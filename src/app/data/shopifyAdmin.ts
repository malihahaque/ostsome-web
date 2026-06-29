// ─── SHOPIFY ADMIN API ────────────────────────────────────────────────────────
// Used only for the admin orders dashboard
// Requests go through a Netlify Function proxy (netlify/functions/admin-orders.js)
// so the Admin API token never reaches the browser.

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

  const response = await fetch(`/.netlify/functions/admin-orders?${query.toString()}`);
  if (!response.ok) throw new Error(`Admin API error: ${response.status}`);

  const data = await response.json();
  return data.orders;
}