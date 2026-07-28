#!/usr/bin/env node
// ─── Bulk-update Launch Exclusive + Clearance prices in Shopify ───────────
//
// Final list — 28 Jul 2026. 5 SKUs that never resolved in two dry runs
// (ARZOPA 17.3" monitor, ARZOPA 14.0" gold frame, SwitchBot Curtain Black,
// Hohem ISTEADY X3 x2) were removed from campaignDeals.ts and are NOT in
// this list. Every SKU below was confirmed FOUND in the last dry run.
//
// RUN (dry run first — makes no changes, just shows what WOULD happen):
//   SHOPIFY_STORE=outdoor-sports-travel.myshopify.com \
//   SHOPIFY_ADMIN_TOKEN=shpat_xxxxxxxx \
//   node scripts/update-campaign-prices.js --dry-run
//
// RUN (for real, once the dry run output looks right):
//   SHOPIFY_STORE=outdoor-sports-travel.myshopify.com \
//   SHOPIFY_ADMIN_TOKEN=shpat_xxxxxxxx \
//   node scripts/update-campaign-prices.js

const STORE = process.env.SHOPIFY_STORE;
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const API_VERSION = '2024-10';
const DRY_RUN = process.argv.includes('--dry-run');

if (!STORE || !TOKEN) {
  console.error('Missing env vars. Set SHOPIFY_STORE and SHOPIFY_ADMIN_TOKEN before running.');
  process.exit(1);
}

const DEALS = [
  { sku: "BN-CLIPBTN10S", price: "229.00", compareAtPrice: "285.00", label: "BUTTONS - BUTTONS Clip OWS Earphone" },
  { sku: "BN-CLIPBTN10G", price: "229.00", compareAtPrice: "285.00", label: "BUTTONS - BUTTONS Clip OWS Earphone" },
  { sku: "KY-99902CK00017", price: "649.00", compareAtPrice: "758.00", label: "LOONA - Petbot Premium (with Charging Dock)" },
  { sku: "KP-22000018000", price: "249.00", compareAtPrice: "298.00", label: "KOSPET - TANK T4" },
  { sku: "KP-22000014000", price: "249.00", compareAtPrice: "298.00", label: "KOSPET - TANK T4" },
  { sku: "KP-220000180T1", price: "189.00", compareAtPrice: "228.00", label: "KOSPET - TANK T4C" },
  { sku: "KP-220000140T1", price: "189.00", compareAtPrice: "228.00", label: "KOSPET - TANK T4C" },
  { sku: "AR-A1 GAMUT", price: "99.00", compareAtPrice: "129.00", label: "ARZOPA - 15.6\" Portable Monitor (with Smart Cover)" },
  { sku: "AR-A1T", price: "159.00", compareAtPrice: "189.00", label: "ARZOPA - 15.6\" Portable Monitor (Touchscreen)" },
  { sku: "AR-Z1FC-BLACK", price: "149.00", compareAtPrice: "184.00", label: "ARZOPA - 16.1\" Portable Monitor 144Hz" },
  { sku: "AR-Z1RC", price: "159.00", compareAtPrice: "192.00", label: "ARZOPA - 16.0\" Portable Monitor 2K" },
  { sku: "AR-D10-BROWN", price: "89.00", compareAtPrice: "120.00", label: "ARZOPA - 10.1\" Digital Frame Brown" },
  { sku: "AR-D10-GOLD", price: "99.00", compareAtPrice: "135.00", label: "ARZOPA - 10.1\" Digital Frame Gold" },
  { sku: "MP-101-1006P04", price: "239.00", compareAtPrice: "299.00", label: "MOBILE PIXELS - Duex Plus DS" },
  { sku: "MP-101-1007P06", price: "239.00", compareAtPrice: "339.00", label: "MOBILE PIXELS - Duex Max DS" },
  { sku: "ROC-12-043", price: "59.00", compareAtPrice: "264.90", label: "ROCCAT - Vulcan II Mini 65% Optical Gaming Keyboard (Black)" },
  { sku: "ROC-12-063", price: "59.00", compareAtPrice: "264.90", label: "ROCCAT - Vulcan II Mini 65% Optical Gaming Keyboard (White)" },
  { sku: "TBS-0705-01", price: "54.90", compareAtPrice: "104.90", label: "TURTLE BEACH - Recon Wired Controller" },
  { sku: "TBS-0732-01", price: "29.90", compareAtPrice: "74.90", label: "TURTLE BEACH - REACT-R Controller Wired" },
  { sku: "TBS-0734-05", price: "29.90", compareAtPrice: "74.90", label: "TURTLE BEACH - REACT-R Controller Wired" },
  { sku: "TBS-0736-05", price: "29.90", compareAtPrice: "74.90", label: "TURTLE BEACH - REACT-R Controller Wired" },
  { sku: "TBS-0760-05", price: "49.90", compareAtPrice: "174.90", label: "TURTLE BEACH - Atom Controller Xbox Edition (Black/Yellow)" },
  { sku: "TBS-0764-05", price: "49.90", compareAtPrice: "174.90", label: "TURTLE BEACH - Atom Controller Android" },
  { sku: "SBT-ROD-W0701600", price: "59.00", compareAtPrice: "139.00", label: "SWITCHBOT - SwitchBot Curtain (Rod 2) White" },
  { sku: "SBT-W3500000", price: "119.00", compareAtPrice: "199.00", label: "SWITCHBOT - SwitchBot Lock Pro (EU Version)" },
  { sku: "SK-S6HVW-N740", price: "89.90", compareAtPrice: "161.00", label: "SKULLCANDY - HESH EVO Wireless Over-Ear True Black" },
  { sku: "SK-S6HVW-S951", price: "89.90", compareAtPrice: "161.00", label: "SKULLCANDY - HESH EVO Wireless Over-Ear True Black" },
  { sku: "SK-S6HHW-N747", price: "109.90", compareAtPrice: "201.00", label: "SKULLCANDY - HESH ANC Wireless Over-Ear Mod White" },
  { sku: "SK-S6CRW-K591", price: "119.90", compareAtPrice: "229.00", label: "SKULLCANDY - Crusher 3.0 BT - Black" },
  { sku: "SK-S6EVW-N744", price: "169.90", compareAtPrice: "312.00", label: "SKULLCANDY - Crusher EVO Wireless Over-Ear Chill Grey" },
  { sku: "SK-S6EVW-S951", price: "169.90", compareAtPrice: "312.00", label: "SKULLCANDY - Crusher EVO Wireless Over-Ear Chill Grey" },
  { sku: "HT-ISTEADY M6 KIT", price: "169.00", compareAtPrice: "329.00", label: "HOHEM - ISTEADY M6 PRO KIT" },
  { sku: "HT-ISTEADY M6", price: "139.00", compareAtPrice: "259.00", label: "HOHEM - ISTEADY M6 PRO" },
  { sku: "HT-ISTEADY V3-BLACK", price: "99.00", compareAtPrice: "199.00", label: "HOHEM - ISTEADY V3" },
  { sku: "HT-ISTEADY V3-WHITE", price: "99.00", compareAtPrice: "199.00", label: "HOHEM - ISTEADY V3" },
  { sku: "D-97000150815", price: "599.00", compareAtPrice: "899.00", label: "DOMETIC - CFX2 28 AC/DC Compressor Cooler" },
  { sku: "D-97000150816", price: "649.00", compareAtPrice: "1049.00", label: "DOMETIC - CFX2 37 AC/DC Compressor Cooler" },
  { sku: "D-97000150817", price: "699.00", compareAtPrice: "1149.00", label: "DOMETIC - CFX2 45 AC/DC Compressor Cooler" },
  { sku: "D-97000150818", price: "749.00", compareAtPrice: "1249.00", label: "DOMETIC - CFX2 57 AC/DC Compressor Cooler" },
  { sku: "ED-EZ85010101", price: "49.00", compareAtPrice: "95.00", label: "EDIZARD - EZ Power Cube" },
  { sku: "ED-EZ85010102", price: "49.00", compareAtPrice: "95.00", label: "EDIZARD - EZ Power Cube" },
  { sku: "ED-EZ840101", price: "29.00", compareAtPrice: "49.00", label: "EDIZARD - EZ International Travel Wall Charger" },
  { sku: "ED-EZ810201", price: "29.00", compareAtPrice: "49.00", label: "EDIZARD - EZ Mag Wireless Power Bank Qi2 (10000mAh)" },
  { sku: "ED-TV810102", price: "19.00", compareAtPrice: "35.00", label: "EDIZARD - EZ Max Safe SSS Power Bank (5000mAh)" },
  { sku: "ED-TV810101", price: "19.00", compareAtPrice: "35.00", label: "EDIZARD - EZ Max Safe SSS Power Bank (5000mAh)" },
  { sku: "ED-TV810103", price: "19.00", compareAtPrice: "35.00", label: "EDIZARD - EZ Max Safe SSS Power Bank (5000mAh)" },
  { sku: "ED-TV810203", price: "29.00", compareAtPrice: "49.00", label: "EDIZARD - EZ Max Safe SSS Power Bank (10000mAh)" },
  { sku: "ED-TV810202", price: "29.00", compareAtPrice: "49.00", label: "EDIZARD - EZ Max Safe SSS Power Bank (10000mAh)" },
  { sku: "ED-TV810204", price: "29.00", compareAtPrice: "49.00", label: "EDIZARD - EZ Max Safe SSS Power Bank (10000mAh)" },
];

async function shopifyGraphQL(query, variables) {
  const res = await fetch(`https://${STORE}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error(JSON.stringify(json.errors));
  }
  return json.data;
}

async function findVariantBySku(sku) {
  const query = `
    query FindVariant($q: String!) {
      productVariants(first: 1, query: $q) {
        edges {
          node {
            id
            sku
            price
            compareAtPrice
            product { title handle }
          }
        }
      }
    }
  `;
  const data = await shopifyGraphQL(query, { q: `sku:"${sku}"` });
  return data.productVariants.edges[0]?.node ?? null;
}

async function updateVariantPrice(variantId, price, compareAtPrice) {
  const mutation = `
    mutation UpdateVariant($input: ProductVariantInput!) {
      productVariantUpdate(input: $input) {
        productVariant { id price compareAtPrice }
        userErrors { field message }
      }
    }
  `;
  const data = await shopifyGraphQL(mutation, {
    input: { id: variantId, price, compareAtPrice },
  });
  return data.productVariantUpdate;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log(DRY_RUN ? '=== DRY RUN — no changes will be made ===\n' : '=== LIVE RUN — updating prices in Shopify ===\n');

  const notFound = [];
  const updated = [];
  const alreadyCorrect = [];
  const failed = [];

  for (const deal of DEALS) {
    const variant = await findVariantBySku(deal.sku);

    if (!variant) {
      console.log(`❌ NOT FOUND   ${deal.sku}  (${deal.label})`);
      notFound.push(deal.sku);
      continue;
    }

    const currentPrice = parseFloat(variant.price).toFixed(2);
    const currentCompareAt = variant.compareAtPrice ? parseFloat(variant.compareAtPrice).toFixed(2) : null;

    if (currentPrice === deal.price && currentCompareAt === deal.compareAtPrice) {
      console.log(`✓  ALREADY OK  ${deal.sku}  (${variant.product.title})  price=${currentPrice} compareAt=${currentCompareAt}`);
      alreadyCorrect.push(deal.sku);
      continue;
    }

    console.log(`→  ${deal.sku}  (${variant.product.title} — handle: ${variant.product.handle})`);
    console.log(`     price:      ${currentPrice} -> ${deal.price}`);
    console.log(`     compareAt:  ${currentCompareAt ?? '(none)'} -> ${deal.compareAtPrice}`);

    if (DRY_RUN) {
      updated.push(deal.sku);
      continue;
    }

    try {
      const result = await updateVariantPrice(variant.id, deal.price, deal.compareAtPrice);
      if (result.userErrors.length > 0) {
        console.log(`     ⚠️  FAILED: ${JSON.stringify(result.userErrors)}`);
        failed.push({ sku: deal.sku, errors: result.userErrors });
      } else {
        console.log(`     ✅ updated`);
        updated.push(deal.sku);
      }
    } catch (err) {
      console.log(`     ⚠️  ERROR: ${err.message}`);
      failed.push({ sku: deal.sku, errors: err.message });
    }

    await sleep(500);
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Already correct: ${alreadyCorrect.length}`);
  console.log(`${DRY_RUN ? 'Would update' : 'Updated'}:      ${updated.length}`);
  console.log(`Not found:       ${notFound.length}${notFound.length ? '  -> ' + notFound.join(', ') : ''}`);
  console.log(`Failed:          ${failed.length}`);
  if (failed.length > 0) {
    console.log(JSON.stringify(failed, null, 2));
  }
  if (DRY_RUN) {
    console.log('\nThis was a dry run — nothing was changed. Re-run without --dry-run to apply.');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});