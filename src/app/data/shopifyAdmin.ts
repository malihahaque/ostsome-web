// ─── SHOPIFY ADMIN API ────────────────────────────────────────────────────────
// Used only for the admin orders dashboard
// Requests go through a Netlify Function proxy (netlify/functions/admin-orders.js)
// so the Admin API token never reaches the browser. The orders endpoint itself
// requires a signed session token (see adminLogin below) — without one, it
// returns 401, even if someone finds the URL directly.

const SESSION_KEY = 'ostsome_admin_session';

export type AdminOrder = {
  id: number;
  name: string;
  created_at: string;
  financial_status: string;
  fulfillment_status: string | null;
  total_price: string;
  currency: string;
  email: string;
  phone: string | null;
  shipping_address: {
    name: string;
    address1: string;
    city: string;
    zip: string;
    country: string;
  } | null;
  line_items: {
    id: number;
    title: string;
    quantity: number;
    price: string;
    vendor: string;
    variant_title: string | null;
  }[];
};

// Verifies the password server-side and stores the returned signed session
// token. The real password never lives in this file or ships to the browser
// as a comparable value — it's only ever sent once, over the wire, to the
// serverless function that checks it against an env var.
export async function adminLogin(password: string): Promise<void> {
  const response = await fetch('/.netlify/functions/admin-auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Login failed');
  }

  const data = await response.json();
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ token: data.token, expiresAt: data.expiresAt }));
}

export function adminLogout(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

// Reads the stored session and returns the token only if it hasn't expired
// yet — an expired token is treated the same as no session at all, so the
// dashboard falls back to the login screen rather than firing a doomed request.
export function getValidSessionToken(): string | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { token, expiresAt } = JSON.parse(raw);
    if (!token || Date.now() > expiresAt) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

export async function fetchAdminOrders(params?: {
  status?: string;
  created_at_min?: string;
  created_at_max?: string;
  limit?: number;
}): Promise<AdminOrder[]> {
  const token = getValidSessionToken();
  if (!token) throw new Error('Not logged in');

  const query = new URLSearchParams();
  query.set('limit', String(params?.limit ?? 250));
  query.set('status', params?.status ?? 'any');
  if (params?.created_at_min) query.set('created_at_min', params.created_at_min);
  if (params?.created_at_max) query.set('created_at_max', params.created_at_max);

  const response = await fetch(`/.netlify/functions/admin-orders?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) {
    // Session expired or invalid server-side — clear it so the next load
    // shows the login screen instead of silently failing forever.
    adminLogout();
    throw new Error('Session expired — please log in again');
  }
  if (!response.ok) throw new Error(`Admin API error: ${response.status}`);

  const data = await response.json();
  return data.orders;
}