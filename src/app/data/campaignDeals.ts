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
// ⚠️ CHECKOUT WARNING — please verify separately:
// This file (and the pages that read it) only controls what price is
// DISPLAYED. It does not touch Shopify's actual variant price. If Shopify's
// variant price for a given handle hasn't also been set to match `promo`
// (or discounted down to it via an automatic discount, the way flash sale
// deals work), the customer will see one price on-site and be charged a
// different one at checkout — the same failure mode as the KOSPET T4 flat
// -discount bug. Confirm in CartContext.tsx / Shopify Admin that these
// handles actually charge `promo` (or `promo` minus FOST 5% for members)
// before treating this as fully fixed.
//
// ⚠️ DATA GAP — multi-entry handles (best-effort default, not exact):
// A few handles below have MORE THAN ONE deal entry:
//   - arzopa-z1rc-... covers 3 different screen sizes (SKUs AR-A1M,
//     AR-Z1FC-BLACK, AR-Z1RC)
//   - arzopa-e1-dual-screen-... covers 3 different digital-frame
//     colors/sizes (SKUs AR-D10-BROWN, AR-D10-GOLD, AR-D14-GOLD)
//   - edizard-ez-max-safe-power-bank-... covers 2 capacity tiers, each
//     with its own promo price (5000mAh SKUs end -101/-102/-103 at
//     19/35; 10000mAh SKUs end -201/-202/-203/-204 at 29/49)
// all sharing one Shopify handle instead of each having its own.
//
// The three ARZOPA monitor/frame SKUs above are each genuinely distinct
// (confirmed against the brand manager sheet 28 Jul 2026) — they almost
// certainly have their OWN real Shopify handles, not the shared
// placeholder handle below. productVariants.ts has no entries at all for
// any ARZOPA SKU, so there's no way to confirm the real handles from code.
// ⚠️ Check Shopify Admin for the actual handle behind each SKU
// (AR-A1M / AR-Z1FC-BLACK / AR-Z1RC / AR-D10-BROWN / AR-D10-GOLD /
// AR-D14-GOLD) and split these into their own handle entries once known —
// until then, getCampaignDeal() returns the FIRST entry for these
// placeholder handles as a best-effort default, which will not
// necessarily match the variant the customer has selected. Use
// hasAmbiguousCampaignDeal() to detect this case if you need to warn the
// customer or hide the badge.
//
// The Edizard capacity-tier split is a real, resolvable ambiguity (same
// handle, same colors, price genuinely depends on which capacity is
// selected) — worth wiring PDP variant selection to pick the right entry
// rather than treating it as unresolvable like the ARZOPA case.

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
   * SKU that shares this exact price. Sourced from the brand manager's
   * sheet (28 Jul 2026); use this to find/update the matching variant in
   * Shopify Admin when setting the backend price. Optional since it's
   * being backfilled — treat a missing skus array as "not yet verified
   * against the sheet," not as "confirmed no SKU."
   */
  skus?: string[];
}

// ── Launch Exclusive ("Early Bird") ──
// Mirrors ALL_DEALS in LaunchExclusivePage.tsx (which is a superset of
// FEATURED_DEALS in LaunchExclusive.tsx).
const LAUNCH_DEALS: Omit<CampaignDeal, 'campaign'>[] = [
  { handle: 'buttons-clip', label: 'BUTTONS', name: 'BUTTONS Clip OWS Earphone', srp: 285, promo: 229, skus: ['BN-CLIPBTN10S', 'BN-CLIPBTN10G'] },
  { handle: 'loona-smart-pet-robot', label: 'LOONA', name: 'Petbot Premium (with Charging Dock)', srp: 758, promo: 649, skus: ['KY-99902CK00017'] },
  { handle: 'kospet-tank-t4-smartwatch-black-silver', label: 'KOSPET', name: 'TANK T4', srp: 298, promo: 249, skus: ['KP-22000018000', 'KP-22000014000'] },
  { handle: 'kospet-tank-t4c-smartwatch', label: 'KOSPET', name: 'TANK T4C', srp: 228, promo: 189, skus: ['KP-220000180T1', 'KP-220000140T1'] },
  { handle: 'arzopa-ar-a1-gamut-15-6-fhd-portable-monitor-ips-1920-1080p-freq-60hz-type-c-hdmi-w-smart-cover-copy', label: 'ARZOPA', name: '15.6" Portable Monitor (with Smart Cover)', srp: 129, promo: 99, skus: ['AR-A1 GAMUT'] },
  { handle: 'arzopa-ar-a1t-15-6-touch-screen-portable-monitor-fhd-1920-1080p-60hz-type-c-hdmi-copy-1', label: 'ARZOPA', name: '15.6" Portable Monitor (Touchscreen)', srp: 189, promo: 159, skus: ['AR-A1T'] },
  // ⚠️ ambiguous placeholder handle — SKU is real and distinct (AR-A1M), see DATA GAP note. Verify real handle in Shopify Admin.
  { handle: 'arzopa-z1rc-2-5k-16-portable-monitor-brilliant-qhd-500nits-8bit-display-qhd-2560-1600-60hz-copy', label: 'ARZOPA', name: '17.3" Portable Monitor', srp: 226, promo: 189, skus: ['AR-A1M'] },
  // ⚠️ ambiguous placeholder handle — SKU is real and distinct (AR-Z1FC-BLACK), see DATA GAP note. Verify real handle in Shopify Admin.
  { handle: 'arzopa-z1rc-2-5k-16-portable-monitor-brilliant-qhd-500nits-8bit-display-qhd-2560-1600-60hz-copy', label: 'ARZOPA', name: '16.1" Portable Monitor 144Hz', srp: 184, promo: 149, skus: ['AR-Z1FC-BLACK'] },
  // ⚠️ ambiguous placeholder handle — SKU is real and distinct (AR-Z1RC), see DATA GAP note. Verify real handle in Shopify Admin.
  { handle: 'arzopa-z1rc-2-5k-16-portable-monitor-brilliant-qhd-500nits-8bit-display-qhd-2560-1600-60hz-copy', label: 'ARZOPA', name: '16.0" Portable Monitor 2K', srp: 192, promo: 159, skus: ['AR-Z1RC'] },
  // ⚠️ ambiguous placeholder handle — SKU is real and distinct (AR-D10-BROWN), see DATA GAP note. Verify real handle in Shopify Admin.
  { handle: 'arzopa-e1-dual-screen-portable-monitor', label: 'ARZOPA', name: '10.1" Digital Frame Brown', srp: 120, promo: 89, skus: ['AR-D10-BROWN'] },
  // ⚠️ ambiguous placeholder handle — SKU is real and distinct (AR-D10-GOLD), see DATA GAP note. Verify real handle in Shopify Admin.
  { handle: 'arzopa-e1-dual-screen-portable-monitor', label: 'ARZOPA', name: '10.1" Digital Frame Gold', srp: 135, promo: 99, skus: ['AR-D10-GOLD'] },
  // ⚠️ ambiguous placeholder handle — SKU is real and distinct (AR-D14-GOLD), see DATA GAP note. Verify real handle in Shopify Admin.
  { handle: 'arzopa-e1-dual-screen-portable-monitor', label: 'ARZOPA', name: '14.0" Digital Frame Gold', srp: 229, promo: 169, skus: ['AR-D14-GOLD'] },
];

// ── Clearance ("One Season Off") ──
// Mirrors CLEARANCE_DEALS in OneSeasonOff.tsx.
const CLEARANCE_DEALS_SOURCE: Omit<CampaignDeal, 'campaign'>[] = [
  { handle: 'mobile-pixels-duex-ds-plus', label: 'MOBILE PIXELS', name: 'Duex Plus DS', srp: 299, promo: 239, skus: ['MP-101-1006P04'] },
  { handle: 'mobile-pixels-duex-ds-max', label: 'MOBILE PIXELS', name: 'Duex Max DS', srp: 339, promo: 239, skus: ['MP-101-1007P06'] },
  { handle: 'roccat-vulcan-ii-mini-65-optical-gaming-keyboard', label: 'ROCCAT', name: 'Vulcan II Mini 65% Optical Gaming Keyboard', srp: 264.90, promo: 59, skus: ['ROC-12-043', 'ROC-12-063'] },
  { handle: 'turtle-beach-rematch-core-wired-gaming-controller', label: 'TURTLE BEACH', name: 'Recon Wired Controller', srp: 104.90, promo: 54.90, skus: ['TBS-0705-01'] },
  { handle: 'turtle-beach-afterglow-wave-controller-wired-rgb-gaming-controller', label: 'TURTLE BEACH', name: 'REACT-R Controller Wired', srp: 74.90, promo: 29.90, skus: ['TBS-0732-01', 'TBS-0734-05', 'TBS-0736-05'] },
  { handle: 'turtle-beach-stealth-pivot-wireless-smart-game-controller', label: 'TURTLE BEACH', name: 'Atom Controller Android', srp: 174.90, promo: 49.90, skus: ['TBS-0760-05', 'TBS-0764-05'] },
  { handle: 'switchbot-curtain-rod', label: 'SWITCHBOT', name: 'SwitchBot Curtain (I Rail 2) Black', srp: 129, promo: 59, skus: ['SBT-IR-W0701600Bl'] },
  { handle: 'switchbot-curtain-3-rod', label: 'SWITCHBOT', name: 'SwitchBot Curtain (Rod 2) White', srp: 139, promo: 59, skus: ['SBT-ROD-W0701600'] },
  { handle: 'switchbot-smart-lock-pro', label: 'SWITCHBOT', name: 'SwitchBot Lock Pro (EU Version)', srp: 199, promo: 119, skus: ['SBT-W3500000'] },
  { handle: 'skullcandy-hesh-540-wireless-over-ear', label: 'SKULLCANDY', name: 'HESH EVO Wireless Over-Ear True Black', srp: 161, promo: 89.90, skus: ['SK-S6HVW-N740', 'SK-S6HVW-S951'] },
  { handle: 'skullcandy-hesh-360-wireless-over-ear', label: 'SKULLCANDY', name: 'HESH ANC Wireless Over-Ear Mod White', srp: 201, promo: 109.90, skus: ['SK-S6HHW-N747'] },
  { handle: 'skullcandy-aivator-900-anc-wireless-over-ear', label: 'SKULLCANDY', name: 'Crusher 3.0 BT - Black', srp: 229, promo: 119.90, skus: ['SK-S6CRW-K591'] },
  { handle: 'skullcandy-push-720-open-ear-black-silver', label: 'SKULLCANDY', name: 'Crusher EVO Wireless Over-Ear Chill Grey', srp: 312, promo: 169.90, skus: ['SK-S6EVW-N744', 'SK-S6EVW-S951'] },
  { handle: 'hohem-isteady-m6-pro-kit-3-axis-structure-smartphone-gimbal-with-magnetic-fill-light-integrated-with-ai-tracking-module', label: 'HOHEM', name: 'ISTEADY M6 PRO KIT', srp: 329, promo: 169, skus: ['HT-ISTEADY M6 KIT'] },
  { handle: 'hohem-isteady-m6-pro-3-axis-structure-smartphone-gimbal-integrated-with-ai-tracking-module', label: 'HOHEM', name: 'ISTEADY M6 PRO', srp: 259, promo: 139, skus: ['HT-ISTEADY M6'] },
  { handle: 'hohem-isteady-v3-ultra-3-axis-palm-smartphone-gimbal-with-ai-visual-tracking-with-screen', label: 'HOHEM', name: 'ISTEADY V3', srp: 199, promo: 99, skus: ['HT-ISTEADY V3-BLACK', 'HT-ISTEADY V3-WHITE'] },
  { handle: 'hohem-isteady-x3-travel-smartphone-stabilizer', label: 'HOHEM', name: 'ISTEADY X3', srp: 169, promo: 79, skus: ['HT-ISTEADY X3 BLACK', 'HT-ISTEADY X3 GREY'] },
  { handle: 'dometic-cfx2-28-mobile-compressor-cooler', label: 'DOMETIC', name: 'CFX2 28 AC/DC Compressor Cooler', srp: 899, promo: 599, skus: ['D-97000150815'] },
  { handle: 'dometic-cfx2-37-mobile-compressor-cooler', label: 'DOMETIC', name: 'CFX2 37 AC/DC Compressor Cooler', srp: 1049, promo: 649, skus: ['D-97000150816'] },
  { handle: 'dometic-cfx2-45-mobile-compressor-cooler', label: 'DOMETIC', name: 'CFX2 45 AC/DC Compressor Cooler', srp: 1149, promo: 699, skus: ['D-97000150817'] },
  { handle: 'dometic-cfx2-57-mobile-compressor-cooler', label: 'DOMETIC', name: 'CFX2 57 AC/DC Compressor Cooler', srp: 1249, promo: 749, skus: ['D-97000150818'] },
  { handle: 'edizard-ez-power-cube', label: 'EDIZARD', name: 'EZ Power Cube', srp: 95, promo: 49, skus: ['ED-EZ85010101', 'ED-EZ85010102'] },
  { handle: 'edizard-ez-mag-power-bank-qi2-10000mah-copy', label: 'EDIZARD', name: 'EZ International Travel Wall Charger', srp: 49, promo: 29, skus: ['ED-EZ840101'] },
  { handle: 'edizard-ez-power-bank', label: 'EDIZARD', name: 'EZ Mag Wireless Power Bank Qi2 (10000mAh)', srp: 49, promo: 29, skus: ['ED-EZ810201'] },
  // Two capacity tiers, two different promo prices — see DATA GAP note above.
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
 * If a handle has multiple deals (the ARZOPA multi-variant / Edizard
 * capacity-tier data gaps, see top of file), this returns the FIRST one as
 * a best-effort default — it will not necessarily match the variant the
 * customer has selected.
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
 * render, one card per entry, same as LaunchExclusivePage.tsx / 
 * OneSeasonOffPage.tsx did before this file existed.
 */
export function getDealsByCampaign(campaign: CampaignType): CampaignDeal[] {
  return CAMPAIGN_DEALS.filter(d => d.campaign === campaign);
}

// ── Homepage teaser subsets ──
// The homepage sections only show a curated handful of each campaign, not
// every deal. These lists are the "which ones" — order here is the order
// they appear on the homepage. Each of these handles has exactly one
// (non-ambiguous) deal entry, so getCampaignDeal() is safe to use with them.

export const LAUNCH_FEATURED_HANDLES: string[] = [
  'buttons-clip',
  'loona-smart-pet-robot',
  'kospet-tank-t4c-smartwatch',
  'arzopa-ar-a1-gamut-15-6-fhd-portable-monitor-ips-1920-1080p-freq-60hz-type-c-hdmi-w-smart-cover-copy',
];

export const CLEARANCE_FEATURED_HANDLES: string[] = [
  'roccat-vulcan-ii-mini-65-optical-gaming-keyboard',
  'hohem-isteady-v3-ultra-3-axis-palm-smartphone-gimbal-with-ai-visual-tracking-with-screen',
  'turtle-beach-afterglow-wave-controller-wired-rgb-gaming-controller',
  'dometic-cfx2-28-mobile-compressor-cooler',
  'skullcandy-hesh-540-wireless-over-ear',
  'edizard-ez-max-safe-power-bank-black-gold-silver-5000mah-10000mah',
];