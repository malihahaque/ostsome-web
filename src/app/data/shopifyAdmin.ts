// ─── SHOPIFY ADMIN API ────────────────────────────────────────────────────────
// Used only for the admin orders dashboard
// NOTE: Shopify Admin API blocks direct browser requests (CORS)
// This works via a proxy — for now it uses a CORS proxy for dev

const SHOPIFY_STORE_DOMAIN = 'outdoor-sports-travel.myshopify.com';
const SHOPIFY_ADMIN_TOKEN = import.meta.env.VITE_SHOPIFY_ADMIN_TOKEN;
const ADMIN_API_URL = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-04`;

async function adminFetch<T>(endpoint: string): Promise<T> {
  // Use a CORS proxy for browser-based Admin API calls
  const url = `${ADMIN_API_URL}${endpoint}`;
  const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`, {
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error(`Admin API error: ${response.status}`);
  return response.json();
}

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

export async function fetchAdminOrders(params?: {
  status?: string;
  created_at_min?: string;
  created_at_max?: string;
  limit?: number;
}): Promise<AdminOrder[]> {
  const query = new URLSearchParams();
  query.set('limit', String(params?.limit ?? 250));
  query.set('status', params?.status ?? 'any');
  if (params?.created_at_min) query.set('created_at_min', params.created_at_min);
  if (params?.created_at_max) query.set('created_at_max', params.created_at_max);

  const data = await adminFetch<{ orders: AdminOrder[] }>(`/orders.json?${query}`);
  return data.orders;
}