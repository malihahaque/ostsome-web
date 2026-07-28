// ─── CAMPAIGN DEAL PRICING (Launch Exclusive "Early Bird" + Clearance "One Season Off") ──
//
// Single source of truth for the promo/srp figures used by:
//   - LaunchExclusive.tsx / LaunchExclusivePage.tsx   ("Early Bird")
//   - OneSeasonOff.tsx / OneSeasonOffPage.tsx           ("Clearance")
//   - ProductDetail.tsx (PDP)
//
// These figures come from the brand manager's pricing sheet, NOT from
// products.ts / Shopify admin. products.ts price/comparePrice should NOT be
// relied on for these two campaigns — that mismatch (PDP showing a
// different price than the campaign card) is exactly the bug this file
// fixes. Update the arrays below whenever the sheet changes; every surface
// that shows a campaign price should import from here instead of keeping
// its own copy.
//
// Handles below were verified on 28 Jul 2026 by running
// scripts/update-campaign-prices.js --dry-run against live Shopify and
// reading back each SKU's actual product/handle. Several of the original
// handles here were wrong (typo'd, guessed, or reused from a duplicated
// "-copy" product) — those are now corrected.
//
// ⚠️ CHECKOUT: run scripts/update-campaign-prices.js (without --dry-run)
// against Shopify so the variant price/compareAtPrice actually match what's
// in this file — this file only controls what's DISPLAYED, not what Shopify
// charges.
//
// REMOVED 28 Jul 2026 — no matching SKU found in Shopify after two dry-run
// attempts (including a guessed formatting fix for one of them). Rather
// than show a price that can't be confirmed or charged correctly at
// checkout, these were dropped from the campaign entirely instead of kept
// with a broken handle. If any of these SKUs turn out to exist under a
// different code, re-add the entry with the correct handle/SKU:
//   - ARZOPA "17.3" Portable Monitor" — SKU tried: AR-A1M
//   - ARZOPA "14.0" Digital Frame Gold" — SKU tried: AR-D14-GOLD
//   - SwitchBot Curtain (I Rail 2) Black — SKU tried: SBT-IR-W0701600Bl
//   - Hohem ISTEADY X3 (Black/Grey) — SKUs tried: HT-ISTEADY X3 BLACK/GREY,
//     then HT-ISTEADY X3-BLACK/GREY (hyphen guess, also not found)
//
// ⚠️ NEEDS A LOOK, NOT BLOCKING: "ISTEADY V3" was found, but the actual
// Shopify title has no "Ultra" and no "with screen" in it
// ('Hohem iSteady V3 3-Axis Palm Smartphone Gimbal with AI Visual
// Tracking') — the old handle we had assumed a "V3 Ultra" variant existed.
// Applied the found handle since the SKUs matched, but worth eyeballing
// the live product page once to confirm this is the intended item.
//
// ⚠️ Skullcandy Crusher 3.0 BT (skullcandy-crusher-wireless-bluetooth-headphones)
// is also the handle flash sale's FLASH_SALE_VARIANT_SCOPE / getFlashPrice
// target for the Aivator/Crusher flash deal — worth confirming flashSale.ts
// still points at the correct handle now that this one's been corrected.
//
// ⚠️ DATA GAP — multi-entry handles (best-effort default, not exact):
// A few handles below still have MORE THAN ONE deal entry with no reliable
// way to prefer one over another from code alone:
//   - arzopa-d10-10-1-digital-photo-frame covers 2 confirmed colours
//     (Brown/Gold) at different prices — real handle, just no variant key
//     to disambiguate Brown vs Gold automatically.
//   - edizard-ez-max-safe-power-bank-... covers 2 capacity tiers, each
//     with its own promo price.
// getCampaignDeal() returns the FIRST entry for these handles as a
// best-effort default. Use hasAmbiguousCampaignDeal() to detect this case
// if you need to warn the customer or hide the badge.

export type CampaignType = 'launch' | 'clearance';

export interface CampaignDeal {
  handle: string;
  campaign: CampaignType;
  label: string;
  name: string;
  srp: number;
  promo: number;
  /**
   * Shopify SKU(s) this promo price applies to — every colour/variant
   * SKU that shares this exact price. Verified against live Shopify via
   * scripts/update-campaign-prices.js --dry-run on 28 Jul 2026.
   */
  skus?: string[];
}

// ── Launch Exclusive ("Early Bird") ──
const LAUNCH_DEALS: Omit<CampaignDeal, 'campaign'>[] = [
  { handle: 'buttons-clip', label: 'BUTTONS', name: 'BUTTONS Clip OWS Earphone', srp: 285, promo: 229, skus: ['BN-CLIPBTN10S', 'BN-CLIPBTN10G'] },
  { handle: 'loona-smart-pet-robot', label: 'LOONA', name: 'Petbot Premium (with Charging Dock)', srp: 758, promo: 649, skus: ['KY-99902CK00017'] },
  { handle: 'kospet-tank-t4-smartwatch-black-silver', label: 'KOSPET', name: 'TANK T4', srp: 298, promo: 249, skus: ['KP-22000018000', 'KP-22000014000'] },
  { handle: 'kospet-tank-t4c-smartwatch', label: 'KOSPET', name: 'TANK T4C', srp: 228, promo: 189, skus: ['KP-220000180T1', 'KP-220000140T1'] },
  // ⚠️ handle corrected 28 Jul 2026 — was 'arzopa-ar-a1-gamut-...-copy'.
  // Real handle is a mislabeled duplicate product (still named after
  // Mobile Pixels internally) — worth asking Kenneth to rename it in
  // Shopify Admin so this isn't confusing later.
  { handle: 'mobile-pixels-duex-ds-max-copy', label: 'ARZOPA', name: '15.6" Portable Monitor (with Smart Cover)', srp: 129, promo: 99, skus: ['AR-A1 GAMUT'] },
  // ⚠️ handle corrected 28 Jul 2026 — was 'arzopa-ar-a1t-...-copy-1'.
  { handle: 'arzopa-ar-a1-gamut-15-6-fhd-portable-monitor-ips-1920-1080p-freq-60hz-type-c-hdmi-w-smart-cover-copy', label: 'ARZOPA', name: '15.6" Portable Monitor (Touchscreen)', srp: 189, promo: 159, skus: ['AR-A1T'] },
  // ⚠️ handle corrected 28 Jul 2026 — was the shared z1rc placeholder; turns
  // out this handle genuinely belongs to just this one product.
  { handle: 'arzopa-z1rc-2-5k-16-portable-monitor-brilliant-qhd-500nits-8bit-display-qhd-2560-1600-60hz-copy', label: 'ARZOPA', name: '16.1" Portable Monitor 144Hz', srp: 184, promo: 149, skus: ['AR-Z1FC-BLACK'] },
  // ⚠️ handle corrected 28 Jul 2026 — was the old AR-A1T placeholder.
  { handle: 'arzopa-ar-a1t-15-6-touch-screen-portable-monitor-fhd-1920-1080p-60hz-type-c-hdmi-copy-1', label: 'ARZOPA', name: '16.0" Portable Monitor 2K', srp: 192, promo: 159, skus: ['AR-Z1RC'] },
  // ⚠️ handle corrected 28 Jul 2026 — was a placeholder shared with Gold below.
  // Still ambiguous (see DATA GAP note): same handle as Gold, different price.
  { handle: 'arzopa-d10-10-1-digital-photo-frame', label: 'ARZOPA', name: '10.1" Digital Frame Brown', srp: 120, promo: 89, skus: ['AR-D10-BROWN'] },
  { handle: 'arzopa-d10-10-1-digital-photo-frame', label: 'ARZOPA', name: '10.1" Digital Frame Gold', srp: 135, promo: 99, skus: ['AR-D10-GOLD'] },
];

// ── Clearance ("One Season Off") ──
const CLEARANCE_DEALS_SOURCE: Omit<CampaignDeal, 'campaign'>[] = [
  { handle: 'mobile-pixels-duex-ds-plus', label: 'MOBILE PIXELS', name: 'Duex Plus DS', srp: 299, promo: 239, skus: ['MP-101-1006P04'] },
  { handle: 'mobile-pixels-duex-ds-max', label: 'MOBILE PIXELS', name: 'Duex Max DS', srp: 339, promo: 239, skus: ['MP-101-1007P06'] },
  { handle: 'roccat-vulcan-ii-mini-65-optical-gaming-keyboard', label: 'ROCCAT', name: 'Vulcan II Mini 65% Optical Gaming Keyboard (Black)', srp: 264.90, promo: 59, skus: ['ROC-12-043'] },
  // ⚠️ split out 28 Jul 2026 — White is a SEPARATE Shopify product/handle,
  // not a colour variant of the Black one.
  { handle: 'roccat-vulcan-ii-mini-65-optical-gaming-keyboard-white', label: 'ROCCAT', name: 'Vulcan II Mini 65% Optical Gaming Keyboard (White)', srp: 264.90, promo: 59, skus: ['ROC-12-063'] },
  // ⚠️ handle corrected 28 Jul 2026 — was 'turtle-beach-rematch-core-wired-gaming-controller'.
  { handle: 'turtle-beach-recon-wired-controller', label: 'TURTLE BEACH', name: 'Recon Wired Controller', srp: 104.90, promo: 54.90, skus: ['TBS-0705-01'] },
  // ⚠️ handle corrected 28 Jul 2026 — was 'turtle-beach-afterglow-wave-controller-wired-rgb-gaming-controller'.
  { handle: 'turtle-beach-react-r-wired-controller', label: 'TURTLE BEACH', name: 'REACT-R Controller Wired', srp: 74.90, promo: 29.90, skus: ['TBS-0732-01', 'TBS-0734-05', 'TBS-0736-05'] },
  // ⚠️ split out 28 Jul 2026 — Xbox Edition is a SEPARATE Shopify
  // product/handle from the base Atom controller below, not a colour variant.
  { handle: 'turtle-beach-atom-mobile-game-controller-xbox-edition', label: 'TURTLE BEACH', name: 'Atom Controller Xbox Edition (Black/Yellow)', srp: 174.90, promo: 49.90, skus: ['TBS-0760-05'] },
  { handle: 'turtle-beach-atom-mobile-game-controller', label: 'TURTLE BEACH', name: 'Atom Controller Android', srp: 174.90, promo: 49.90, skus: ['TBS-0764-05'] },
  // ⚠️ UNRESOLVED SKU (SBT-IR-W0701600Bl) — SwitchBot Curtain (I Rail 2)
  // Black was removed from this campaign 28 Jul 2026 after two dry runs
  // couldn't find that SKU in Shopify. See REMOVED note at top of file.
  //
  // handle corrected 28 Jul 2026 — was 'switchbot-curtain-3-rod'. Confirmed
  // via SKU search that SBT-ROD-W0701600 actually lives at this handle.
  { handle: 'switchbot-curtain-rod', label: 'SWITCHBOT', name: 'SwitchBot Curtain (Rod 2) White', srp: 139, promo: 59, skus: ['SBT-ROD-W0701600'] },
  { handle: 'switchbot-smart-lock-pro', label: 'SWITCHBOT', name: 'SwitchBot Lock Pro (EU Version)', srp: 199, promo: 119, skus: ['SBT-W3500000'] },
  // ⚠️ handle corrected 28 Jul 2026 — was 'skullcandy-hesh-540-wireless-over-ear'.
  { handle: 'skullcandy-hesh-evo-wireless-headphones', label: 'SKULLCANDY', name: 'HESH EVO Wireless Over-Ear True Black', srp: 161, promo: 89.90, skus: ['SK-S6HVW-N740', 'SK-S6HVW-S951'] },
  // ⚠️ handle corrected 28 Jul 2026 — was 'skullcandy-hesh-360-wireless-over-ear'.
  { handle: 'skullcandy-hesh-anc-noise-canceling-wireless-headphones', label: 'SKULLCANDY', name: 'HESH ANC Wireless Over-Ear Mod White', srp: 201, promo: 109.90, skus: ['SK-S6HHW-N747'] },
  // ⚠️ handle corrected 28 Jul 2026 — was 'skullcandy-aivator-900-anc-wireless-over-ear'.
  // This handle is also referenced by flashSale.ts — see note at top of file.
  { handle: 'skullcandy-crusher-wireless-bluetooth-headphones', label: 'SKULLCANDY', name: 'Crusher 3.0 BT - Black', srp: 229, promo: 119.90, skus: ['SK-S6CRW-K591'] },
  // ⚠️ handle corrected 28 Jul 2026 — was 'skullcandy-push-720-open-ear-black-silver'.
  { handle: 'skullcandy-crusher-evo', label: 'SKULLCANDY', name: 'Crusher EVO Wireless Over-Ear Chill Grey', srp: 312, promo: 169.90, skus: ['SK-S6EVW-N744', 'SK-S6EVW-S951'] },
  { handle: 'hohem-isteady-m6-pro-kit-3-axis-structure-smartphone-gimbal-with-magnetic-fill-light-integrated-with-ai-tracking-module', label: 'HOHEM', name: 'ISTEADY M6 PRO KIT', srp: 329, promo: 169, skus: ['HT-ISTEADY M6 KIT'] },
  { handle: 'hohem-isteady-m6-pro-3-axis-structure-smartphone-gimbal-integrated-with-ai-tracking-module', label: 'HOHEM', name: 'ISTEADY M6 PRO', srp: 259, promo: 139, skus: ['HT-ISTEADY M6'] },
  // ⚠️ handle corrected 28 Jul 2026 — was '...v3-ultra-...-with-screen'. See
  // "NEEDS A LOOK, NOT BLOCKING" note at top of file — confirm this is the
  // right product, real title has no "Ultra" / "with screen" in it.
  { handle: 'hohem-isteady-v3-3-axis-palm-smartphone-gimbal-with-ai-visual-tracking', label: 'HOHEM', name: 'ISTEADY V3', srp: 199, promo: 99, skus: ['HT-ISTEADY V3-BLACK', 'HT-ISTEADY V3-WHITE'] },
  // Hohem ISTEADY X3 was removed from this campaign 28 Jul 2026 — neither
  // the original SKUs (HT-ISTEADY X3 BLACK/GREY) nor a guessed hyphen fix
  // (HT-ISTEADY X3-BLACK/GREY, matching the V3 pattern) matched anything in
  // Shopify across two dry runs. See REMOVED note at top of file.
  { handle: 'dometic-cfx2-28-mobile-compressor-cooler', label: 'DOMETIC', name: 'CFX2 28 AC/DC Compressor Cooler', srp: 899, promo: 599, skus: ['D-97000150815'] },
  { handle: 'dometic-cfx2-37-mobile-compressor-cooler', label: 'DOMETIC', name: 'CFX2 37 AC/DC Compressor Cooler', srp: 1049, promo: 649, skus: ['D-97000150816'] },
  { handle: 'dometic-cfx2-45-mobile-compressor-cooler', label: 'DOMETIC', name: 'CFX2 45 AC/DC Compressor Cooler', srp: 1149, promo: 699, skus: ['D-97000150817'] },
  { handle: 'dometic-cfx2-57-mobile-compressor-cooler', label: 'DOMETIC', name: 'CFX2 57 AC/DC Compressor Cooler', srp: 1249, promo: 749, skus: ['D-97000150818'] },
  { handle: 'edizard-ez-power-cube', label: 'EDIZARD', name: 'EZ Power Cube', srp: 95, promo: 49, skus: ['ED-EZ85010101', 'ED-EZ85010102'] },
  { handle: 'edizard-ez-mag-power-bank-qi2-10000mah-copy', label: 'EDIZARD', name: 'EZ International Travel Wall Charger', srp: 49, promo: 29, skus: ['ED-EZ840101'] },
  { handle: 'edizard-ez-power-bank', label: 'EDIZARD', name: 'EZ Mag Wireless Power Bank Qi2 (10000mAh)', srp: 49, promo: 29, skus: ['ED-EZ810201'] },
  { handle: 'edizard-ez-max-safe-power-bank-black-gold-silver-5000mah-10000mah', label: 'EDIZARD', name: 'EZ Max Safe SSS Power Bank (5000mAh)', srp: 35, promo: 19, skus: ['ED-TV810102', 'ED-TV810101', 'ED-TV810103'] },
  { handle: 'edizard-ez-max-safe-power-bank-black-gold-silver-5000mah-10000mah', label: 'EDIZARD', name: 'EZ Max Safe SSS Power Bank (10000mAh)', srp: 49, promo: 29, skus: ['ED-TV810203', 'ED-TV810202', 'ED-TV810204'] },
];

export const CAMPAIGN_DEALS: CampaignDeal[] = [
  ...LAUNCH_DEALS.map(d => ({ ...d, campaign: 'launch' as const })),
  ...CLEARANCE_DEALS_SOURCE.map(d => ({ ...d, campaign: 'clearance' as const })),
];

// handle -> deal(s). Most handles map to exactly one deal; a few map to
// several — see the DATA GAP note at the top of this file.
const dealsByHandle: Record<string, CampaignDeal[]> = {};
for (const deal of CAMPAIGN_DEALS) {
  (dealsByHandle[deal.handle] ??= []).push(deal);
}

/**
 * Returns the active campaign deal for a product handle, or undefined if
 * it's not currently part of Launch Exclusive or Clearance.
 *
 * If a handle has multiple deals (see DATA GAP note at top of file), this
 * returns the FIRST one as a best-effort default — it will not
 * necessarily match the variant the customer has selected.
 */
export function getCampaignDeal(handle: string): CampaignDeal | undefined {
  return dealsByHandle[handle]?.[0];
}

/** True if this handle has more than one deal entry (the ambiguous case). */
export function hasAmbiguousCampaignDeal(handle: string): boolean {
  return (dealsByHandle[handle]?.length ?? 0) > 1;
}

/**
 * All deal entries for one campaign, in original sheet order. Duplicates
 * for the ambiguous multi-variant handles (see DATA GAP note above) are
 * preserved on purpose — this is what a "view all deals" page should
 * render, one card per entry.
 */
export function getDealsByCampaign(campaign: CampaignType): CampaignDeal[] {
  return CAMPAIGN_DEALS.filter(d => d.campaign === campaign);
}

// ── Homepage teaser subsets ──
// The homepage sections only show a curated handful of each campaign, not
// every deal. These lists are the "which ones" — order here is the order
// they appear on the homepage.

export const LAUNCH_FEATURED_HANDLES: string[] = [
  'buttons-clip',
  'loona-smart-pet-robot',
  'kospet-tank-t4c-smartwatch',
  // ⚠️ updated 28 Jul 2026 to match the corrected AR-A1 GAMUT handle above.
  'mobile-pixels-duex-ds-max-copy',
];

export const CLEARANCE_FEATURED_HANDLES: string[] = [
  'roccat-vulcan-ii-mini-65-optical-gaming-keyboard',
  // ⚠️ updated 28 Jul 2026 to match the corrected ISTEADY V3 handle above.
  'hohem-isteady-v3-3-axis-palm-smartphone-gimbal-with-ai-visual-tracking',
  // ⚠️ updated 28 Jul 2026 to match the corrected REACT-R handle above.
  'turtle-beach-react-r-wired-controller',
  'dometic-cfx2-28-mobile-compressor-cooler',
  // ⚠️ updated 28 Jul 2026 to match the corrected HESH EVO handle above.
  'skullcandy-hesh-evo-wireless-headphones',
  'edizard-ez-max-safe-power-bank-black-gold-silver-5000mah-10000mah',
];