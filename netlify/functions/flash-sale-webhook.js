// netlify/functions/flash-sale-webhook.js
//
// Listens for Shopify's `orders/paid` webhook. Whenever a paid order includes
// one of the flash-sale variants, it re-tallies total units sold since
// SALE_START directly from Shopify (no separate database — Shopify's order
// history is the source of truth on every check). Looki L1 and the Hohem
// MT3 Pro Kit each have their OWN automatic discount (different fixed $
// amounts, since they're priced too differently for one shared discount to
// hit both exact target prices) — so when one product hits its 5-unit cap,
// only THAT product's discount gets deactivated; the other keeps running
// until it hits its own cap or the sale window ends.
//
// Same rule as the previous drop: first 5 units sold OR the 1-hour window
// closing, whichever comes first. The cap-deactivation here handles the
// "5 units" half; the 1-hour half is enforced by the automatic discount's
// own active/end dates set in Shopify Admin, plus the frontend's
// FLASH_SALE_END in flashSale.ts (which stops showing the deal once the
// hour is up regardless of whether the cap was hit).

const crypto = require("crypto");

const SHOP = "outdoor-sports-travel.myshopify.com";
const API_VERSION = "2026-07";
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;

// TODO: replace with the real variant GIDs for the two deal products.
// Find these in Shopify Admin > Products > [product] > variant, the URL
// contains the numeric ID, e.g. .../variants/44771234567890
// -> gid://shopify/ProductVariant/44771234567890
//
// Each product gets its OWN automatic discount (fixed $ off) because the two
// products are priced too differently for one shared discount to hit both
// exact target prices. discountTitle must exactly match the title of that
// product's discount in Shopify Admin.
const DEAL_VARIANTS = {
  "gid://shopify/ProductVariant/47901198155914": {
    name: "Looki L1 (Black)",
    cap: 5,
    discountTitle: "Friday Flash Deal — Looki L1",
  },
  "gid://shopify/ProductVariant/49524758053002": {
    name: "Hohem MT3 Pro Kit",
    cap: 5,
    discountTitle: "Friday Flash Deal — Hohem MT3 Pro Kit",
  },
};

// Sale window start — used to scope the order query so we only count units
// sold under this specific drop, not historical sales of the same products.
const SALE_START = "2026-07-31T18:00:00+08:00";

function verifyWebhook(rawBody, hmacHeader) {
  if (!hmacHeader) return false;
  const digest = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody, "utf8")
    .digest("base64");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(digest),
      Buffer.from(hmacHeader)
    );
  } catch {
    return false; // length mismatch etc.
  }
}

async function shopifyGraphQL(query, variables = {}) {
  const res = await fetch(
    `https://${SHOP}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ADMIN_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    }
  );
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

async function getDealUnitsSold() {
  const data = await shopifyGraphQL(
    `
    query RecentOrders($query: String!) {
      orders(first: 50, query: $query, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            lineItems(first: 20) {
              edges {
                node {
                  quantity
                  variant { id }
                }
              }
            }
          }
        }
      }
    }
  `,
    { query: `created_at:>='${SALE_START}' AND financial_status:paid` }
  );

  const totals = {};
  for (const key of Object.keys(DEAL_VARIANTS)) totals[key] = 0;

  for (const { node: order } of data.orders.edges) {
    for (const { node: li } of order.lineItems.edges) {
      const variantId = li.variant?.id;
      if (variantId && Object.prototype.hasOwnProperty.call(totals, variantId)) {
        totals[variantId] += li.quantity;
      }
    }
  }
  return totals;
}

async function findAutomaticDiscountId(title) {
  const data = await shopifyGraphQL(
    `
    query FindDiscount($query: String!) {
      discountNodes(first: 5, query: $query) {
        edges { node { id } }
      }
    }
  `,
    { query: `title:'${title}'` }
  );

  return data.discountNodes.edges[0]?.node?.id ?? null;
}

async function deactivateDiscount(title) {
  const id = await findAutomaticDiscountId(title);
  if (!id) {
    console.error(
      `Could not find automatic discount titled "${title}" to deactivate — check the title matches exactly.`
    );
    return;
  }

  const data = await shopifyGraphQL(
    `
    mutation DeactivateDiscount($id: ID!) {
      discountAutomaticDeactivate(id: $id) {
        automaticDiscountNode { id }
        userErrors { field message }
      }
    }
  `,
    { id }
  );

  const errors = data.discountAutomaticDeactivate.userErrors;
  if (errors?.length) {
    console.error("Failed to deactivate discount:", errors);
  } else {
    console.log(`Deactivated "${title}" — cap reached.`);
  }
}

exports.handler = async (event) => {
  const hmac = event.headers["x-shopify-hmac-sha256"];
  if (!verifyWebhook(event.body, hmac)) {
    return { statusCode: 401, body: "Invalid signature" };
  }

  try {
    const order = JSON.parse(event.body);
    const orderVariantIds = (order.line_items || []).map(
      (li) => `gid://shopify/ProductVariant/${li.variant_id}`
    );
    const touchesDeal = orderVariantIds.some((id) => DEAL_VARIANTS[id]);

    if (!touchesDeal) {
      return { statusCode: 200, body: "No deal items in this order — ignored" };
    }

    const totals = await getDealUnitsSold();
    const capsReached = Object.entries(totals).filter(
      ([variantId, qty]) => qty >= DEAL_VARIANTS[variantId].cap
    );

    for (const [variantId] of capsReached) {
      await deactivateDiscount(DEAL_VARIANTS[variantId].discountTitle);
    }

    return { statusCode: 200, body: JSON.stringify(totals) };
  } catch (err) {
    console.error("Flash sale webhook error:", err);
    return { statusCode: 500, body: "Webhook processing error" };
  }
};
