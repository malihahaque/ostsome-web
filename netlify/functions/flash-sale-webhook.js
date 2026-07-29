// netlify/functions/flash-sale-webhook.js
//
// Listens for Shopify's `orders/paid` webhook. Whenever a paid order includes
// one of the flash-sale variants, it re-tallies total units sold since
// SALE_START directly from Shopify (no separate database — Shopify's order
// history is the source of truth on every check). Each PRODUCT in
// DEAL_PRODUCTS has its OWN automatic discount and its OWN 5-unit cap — so
// when one product hits its cap, only THAT product's discount gets
// deactivated; the others keep running until they hit their own cap or the
// sale window ends.
//
// NOTE on multi-variant products: Cleer ARC III, Skullcandy Dime Evo, and
// Skullcandy Hesh Evo each list more than one variant (colours) below,
// because the flash price applies to ANY colour a customer picks — but all
// colours of the same product share ONE 5-unit cap and ONE discount, not 5
// units per colour. Selling 3x white + 2x black Dime Evo still hits the cap
// at 5 and deactivates the single "Friday Flash Deal — Dime Evo" discount.
// Looki L1 and Hohem MT3 Pro Kit remain scoped to a single variant each,
// same as before.
//
// Same rule as previous drops: first 5 units sold (combined across a
// product's variants) OR the 1-hour window closing, whichever comes first.
// The cap-deactivation here handles the "5 units" half; the 1-hour half is
// enforced by each automatic discount's own active/end dates set in Shopify
// Admin, plus the frontend's FLASH_SALE_END in flashSale.ts (which stops
// showing the deal once the hour is up regardless of whether the cap was hit).

const crypto = require("crypto");

const SHOP = "outdoor-sports-travel.myshopify.com";
const API_VERSION = "2026-07";
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;

// Each key is an internal product key (not a Shopify ID) used to group
// variants together. discountTitle must exactly match the title of that
// product's automatic discount in Shopify Admin.
const DEAL_PRODUCTS = {
  "looki-l1": {
    name: "Looki L1 (Black)",
    cap: 5,
    discountTitle: "Friday Flash Deal — Looki L1",
    variantIds: ["gid://shopify/ProductVariant/47901198155914"],
  },
  "hohem-mt3-pro-kit": {
    name: "Hohem MT3 Pro Kit",
    cap: 5,
    discountTitle: "Friday Flash Deal — Hohem MT3 Pro Kit",
    variantIds: ["gid://shopify/ProductVariant/49524758053002"],
  },
  "cleer-arc-iii": {
    name: "Cleer ARC III",
    cap: 5,
    discountTitle: "Friday Flash Deal — Cleer ARC III",
    variantIds: [
      "gid://shopify/ProductVariant/45517489995914",
      "gid://shopify/ProductVariant/45946653048970",
      "gid://shopify/ProductVariant/45946653081738",
    ],
  },
  "dime-evo": {
    name: "Skullcandy Dime Evo",
    cap: 5,
    discountTitle: "Friday Flash Deal — Dime Evo",
    variantIds: [
      "gid://shopify/ProductVariant/45430632841354",
      "gid://shopify/ProductVariant/45430632874122",
      "gid://shopify/ProductVariant/46148701421706",
    ],
  },
  "push-anc": {
    name: "Skullcandy Push ANC",
    cap: 5,
    discountTitle: "Friday Flash Deal — Push ANC",
    variantIds: ["gid://shopify/ProductVariant/48739507896458"],
  },
  "hesh-evo": {
    name: "Skullcandy Hesh Evo",
    cap: 5,
    discountTitle: "Friday Flash Deal — Hesh Evo",
    variantIds: [
      "gid://shopify/ProductVariant/34959256617098",
      "gid://shopify/ProductVariant/45430703259786",
    ],
  },
  "crusher-3": {
    name: "Skullcandy Crusher 3.0",
    cap: 5,
    discountTitle: "Friday Flash Deal — Crusher 3.0",
    variantIds: ["gid://shopify/ProductVariant/48739507765386"],
  },
};

// Reverse lookup: variant GID -> product key. Built once so the webhook can
// quickly tell whether an incoming order touches any deal product/variant.
const VARIANT_TO_PRODUCT_KEY = {};
for (const [productKey, product] of Object.entries(DEAL_PRODUCTS)) {
  for (const variantId of product.variantIds) {
    VARIANT_TO_PRODUCT_KEY[variantId] = productKey;
  }
}

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

// Returns totals keyed by PRODUCT KEY (not variant GID) — units are summed
// across all of a product's variants, since colours share one cap.
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
  for (const key of Object.keys(DEAL_PRODUCTS)) totals[key] = 0;

  for (const { node: order } of data.orders.edges) {
    for (const { node: li } of order.lineItems.edges) {
      const variantId = li.variant?.id;
      const productKey = variantId && VARIANT_TO_PRODUCT_KEY[variantId];
      if (productKey) {
        totals[productKey] += li.quantity;
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
    const touchesDeal = orderVariantIds.some((id) => VARIANT_TO_PRODUCT_KEY[id]);

    if (!touchesDeal) {
      return { statusCode: 200, body: "No deal items in this order — ignored" };
    }

    const totals = await getDealUnitsSold();
    const capsReached = Object.entries(totals).filter(
      ([productKey, qty]) => qty >= DEAL_PRODUCTS[productKey].cap
    );

    for (const [productKey] of capsReached) {
      await deactivateDiscount(DEAL_PRODUCTS[productKey].discountTitle);
    }

    return { statusCode: 200, body: JSON.stringify(totals) };
  } catch (err) {
    console.error("Flash sale webhook error:", err);
    return { statusCode: 500, body: "Webhook processing error" };
  }
};
