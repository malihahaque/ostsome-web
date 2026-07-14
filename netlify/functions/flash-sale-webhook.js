// netlify/functions/flash-sale-webhook.js
//
// Listens for Shopify's `orders/paid` webhook. Whenever a paid order includes
// one of the two flash-sale variants, it re-tallies total units sold since
// SALE_START directly from Shopify (no separate database — Shopify's order
// history is the source of truth on every check). Once either product hits
// its cap, it immediately deactivates the automatic discount so the deal
// stops applying to any orders after that point.

const crypto = require("crypto");

const SHOP = "outdoor-sports-travel.myshopify.com";
const API_VERSION = "2024-10";
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;

// TODO: replace with the real variant GIDs for the two deal products.
// Find these in Shopify Admin > Products > [product] > variant, the URL
// contains the numeric ID, e.g. .../variants/44771234567890
// -> gid://shopify/ProductVariant/44771234567890
const DEAL_VARIANTS = {
  "gid://shopify/ProductVariant/REPLACE_WITH_AVIATOR_900_ANC_VARIANT_ID": {
    name: "Aviator 900 ANC",
    cap: 5,
  },
  "gid://shopify/ProductVariant/REPLACE_WITH_TANK_T4_BLACK_VARIANT_ID": {
    name: "Tank T4 Black",
    cap: 5,
  },
};

// TODO: must exactly match the title of the automatic discount you create
// in Shopify Admin (Discounts > Create discount).
const DISCOUNT_TITLE = "Friday Flash Deal";

// Sale window start — used to scope the order query so we only count units
// sold under this specific drop, not historical sales of the same products.
const SALE_START = "2026-07-17T19:00:00+08:00";

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

async function findAutomaticDiscountId() {
  const data = await shopifyGraphQL(
    `
    query FindDiscount($query: String!) {
      discountNodes(first: 5, query: $query) {
        edges { node { id } }
      }
    }
  `,
    { query: `title:'${DISCOUNT_TITLE}'` }
  );

  return data.discountNodes.edges[0]?.node?.id ?? null;
}

async function deactivateDiscount() {
  const id = await findAutomaticDiscountId();
  if (!id) {
    console.error(
      `Could not find automatic discount titled "${DISCOUNT_TITLE}" to deactivate — check the title matches exactly.`
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
    console.log(`Deactivated "${DISCOUNT_TITLE}" — cap reached.`);
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
    const capReached = Object.entries(totals).some(
      ([variantId, qty]) => qty >= DEAL_VARIANTS[variantId].cap
    );

    if (capReached) {
      await deactivateDiscount();
    }

    return { statusCode: 200, body: JSON.stringify(totals) };
  } catch (err) {
    console.error("Flash sale webhook error:", err);
    return { statusCode: 500, body: "Webhook processing error" };
  }
};
