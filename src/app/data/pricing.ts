// ─── FOST MEMBER PRICING ──────────────────────────────────────────────────────
// FOST members (anyone logged in) get an extra 5% off every product, stacked
// on top of any existing sale/discount price.

export const FOST_DISCOUNT_RATE = 0.05; // 5%

// IMPORTANT: this must match the code of an active discount in Shopify Admin
// (Discounts → Create discount → Percentage → 5% off → Applies to: All products
// → Discount code: FOST5). Without that discount code existing in Shopify, the
// price shown on-site will be 5% lower than what Shopify actually charges at
// checkout. See note in CartContext.tsx for how this gets applied automatically.
export const FOST_DISCOUNT_CODE = 'FOST5';

export function getFostPrice(price: number): number {
  return Math.round(price * (1 - FOST_DISCOUNT_RATE) * 100) / 100;
}