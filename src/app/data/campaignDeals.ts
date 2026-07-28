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
// A few handles below have MORE THAN ONE deal entry — the ARZOPA
// z1rc-16-portable-monitor handle covers 3 different screen sizes, and the
// ARZOPA e1-dual-screen handle covers 3 different digital-frame
// colors/sizes, all sharing one Shopify handle instead of each having its
// own. There is no reliable key linking a deal's `name` to a specific
// Shopify variant (productVariants.ts option1Value/option2Value for these
// handles are things like "Black"/"Gold", not "17.3" Portable Monitor").
// getCampaignDeal() returns the FIRST entry for these handles as a
// best-effort default — the PDP price may not match whichever variant the
// customer actually has selected. Use hasAmbiguousCampaignDeal() to detect
// this case if you need to warn the customer or hide the badge. Real fix:
// give each physical variant its own Shopify handle, or add a matching key
// (e.g. option1Value) to these deal entries.

export type CampaignType = 'launch' | 'clearance';

export interface CampaignDeal {
  handle: string;
  campaign: CampaignType;
  label: string;
  name: string;
  srp: number;
  promo: number;
}

// ── Launch Exclusive ("Early Bird") ──
// Mirrors ALL_DEALS in LaunchExclusivePage.tsx (which is a superset of
// FEATURED_DEALS in LaunchExclusive.tsx).
const LAUNCH_DEALS: Omit<CampaignDeal, 'campaign'>[] = [
  { handle: 'buttons-clip', label: 'BUTTONS', name: 'BUTTONS Clip OWS Earphone', srp: 285, promo: 229 },
  { handle: 'loona-smart-pet-robot', label: 'LOONA', name: 'Petbot Premium (with Charging Dock)', srp: 758, promo: 649 },
  { handle: 'kospet-tank-t4-smartwatch-black-silver', label: 'KOSPET', name: 'TANK T4', srp: 298, promo: 249 },
  { handle: 'kospet-tank-t4c-smartwatch', label: 'KOSPET', name: 'TANK T4C', srp: 228, promo: 189 },
  { handle: 'arzopa-ar-a1-gamut-15-6-fhd-portable-monitor-ips-1920-1080p-freq-60hz-type-c-hdmi-w-smart-cover-copy', label: 'ARZOPA', name: '15.6" Portable Monitor (with Smart Cover)', srp: 129, promo: 99 },
  { handle: 'arzopa-ar-a1t-15-6-touch-screen-portable-monitor-fhd-1920-1080p-60hz-type-c-hdmi-copy-1', label: 'ARZOPA', name: '15.6" Portable Monitor (Touchscreen)', srp: 189, promo: 159 },
  // ⚠️ ambiguous — shares handle with the two entries below, see DATA GAP note
  { handle: 'arzopa-z1rc-2-5k-16-portable-monitor-brilliant-qhd-500nits-8bit-display-qhd-2560-1600-60hz-copy', label: 'ARZOPA', name: '17.3" Portable Monitor', srp: 226, promo: 189 },
  { handle: 'arzopa-z1rc-2-5k-16-portable-monitor-brilliant-qhd-500nits-8bit-display-qhd-2560-1600-60hz-copy', label: 'ARZOPA', name: '16.1" Portable Monitor 144Hz', srp: 184, promo: 149 },
  { handle: 'arzopa-z1rc-2-5k-16-portable-monitor-brilliant-qhd-500nits-8bit-display-qhd-2560-1600-60hz-copy', label: 'ARZOPA', name: '16.0" Portable Monitor 2K', srp: 192, promo: 159 },
  // ⚠️ ambiguous — shares handle with the two entries below, see DATA GAP note
  { handle: 'arzopa-e1-dual-screen-portable-monitor', label: 'ARZOPA', name: '10.1" Digital Frame Brown', srp: 120, promo: 89 },
  { handle: 'arzopa-e1-dual-screen-portable-monitor', label: 'ARZOPA', name: '10.1" Digital Frame Gold', srp: 135, promo: 99 },
  { handle: 'arzopa-e1-dual-screen-portable-monitor', label: 'ARZOPA', name: '14.0" Digital Frame Gold', srp: 229, promo: 169 },
];

// ── Clearance ("One Season Off") ──
// Mirrors CLEARANCE_DEALS in OneSeasonOff.tsx.
const CLEARANCE_DEALS_SOURCE: Omit<CampaignDeal, 'campaign'>[] = [
  { handle: 'mobile-pixels-duex-ds-plus', label: 'MOBILE PIXELS', name: 'Duex Plus DS', srp: 299, promo: 239 },
  { handle: 'mobile-pixels-duex-ds-max', label: 'MOBILE PIXELS', name: 'Duex Max DS', srp: 339, promo: 239 },
  { handle: 'roccat-vulcan-ii-mini-65-optical-gaming-keyboard', label: 'ROCCAT', name: 'Vulcan II Mini 65% Optical Gaming Keyboard', srp: 264.90, promo: 59 },
  { handle: 'turtle-beach-rematch-core-wired-gaming-controller', label: 'TURTLE BEACH', name: 'Recon Wired Controller', srp: 104.90, promo: 54.90 },
  { handle: 'turtle-beach-afterglow-wave-controller-wired-rgb-gaming-controller', label: 'TURTLE BEACH', name: 'REACT-R Controller Wired', srp: 74.90, promo: 29.90 },
  { handle: 'turtle-beach-stealth-pivot-wireless-smart-game-controller', label: 'TURTLE BEACH', name: 'Atom Controller Android', srp: 174.90, promo: 49.90 },
  { handle: 'switchbot-curtain-rod', label: 'SWITCHBOT', name: 'SwitchBot Curtain (I Rail 2) Black', srp: 129, promo: 59 },
  { handle: 'switchbot-curtain-3-rod', label: 'SWITCHBOT', name: 'SwitchBot Curtain (Rod 2) White', srp: 139, promo: 59 },
  { handle: 'switchbot-smart-lock-pro', label: 'SWITCHBOT', name: 'SwitchBot Lock Pro (EU Version)', srp: 199, promo: 119 },
  { handle: 'skullcandy-hesh-540-wireless-over-ear', label: 'SKULLCANDY', name: 'HESH EVO Wireless Over-Ear True Black', srp: 161, promo: 89.90 },
  { handle: 'skullcandy-hesh-360-wireless-over-ear', label: 'SKULLCANDY', name: 'HESH ANC Wireless Over-Ear Mod White', srp: 201, promo: 109.90 },
  { handle: 'skullcandy-aivator-900-anc-wireless-over-ear', label: 'SKULLCANDY', name: 'Crusher 3.0 BT - Black', srp: 229, promo: 119.90 },
  { handle: 'skullcandy-push-720-open-ear-black-silver', label: 'SKULLCANDY', name: 'Crusher EVO Wireless Over-Ear Chill Grey', srp: 312, promo: 169.90 },
  { handle: 'hohem-isteady-m6-pro-kit-3-axis-structure-smartphone-gimbal-with-magnetic-fill-light-integrated-with-ai-tracking-module', label: 'HOHEM', name: 'ISTEADY M6 PRO KIT', srp: 329, promo: 169 },
  { handle: 'hohem-isteady-m6-pro-3-axis-structure-smartphone-gimbal-integrated-with-ai-tracking-module', label: 'HOHEM', name: 'ISTEADY M6 PRO', srp: 259, promo: 139 },
  { handle: 'hohem-isteady-v3-ultra-3-axis-palm-smartphone-gimbal-with-ai-visual-tracking-with-screen', label: 'HOHEM', name: 'ISTEADY V3', srp: 199, promo: 99 },
  { handle: 'hohem-isteady-x3-travel-smartphone-stabilizer', label: 'HOHEM', name: 'ISTEADY X3', srp: 169, promo: 79 },
  { handle: 'dometic-cfx2-28-mobile-compressor-cooler', label: 'DOMETIC', name: 'CFX2 28 AC/DC Compressor Cooler', srp: 899, promo: 599 },
  { handle: 'dometic-cfx2-37-mobile-compressor-cooler', label: 'DOMETIC', name: 'CFX2 37 AC/DC Compressor Cooler', srp: 1049, promo: 649 },
  { handle: 'dometic-cfx2-45-mobile-compressor-cooler', label: 'DOMETIC', name: 'CFX2 45 AC/DC Compressor Cooler', srp: 1149, promo: 699 },
  { handle: 'dometic-cfx2-57-mobile-compressor-cooler', label: 'DOMETIC', name: 'CFX2 57 AC/DC Compressor Cooler', srp: 1249, promo: 749 },
  { handle: 'edizard-ez-power-cube', label: 'EDIZARD', name: 'EZ Power Cube', srp: 95, promo: 49 },
  { handle: 'edizard-ez-mag-power-bank-qi2-10000mah-copy', label: 'EDIZARD', name: 'EZ International Travel Wall Charger', srp: 49, promo: 29 },
  { handle: 'edizard-ez-power-bank', label: 'EDIZARD', name: 'EZ Mag Wireless Power Bank Qi2', srp: 49, promo: 29 },
  { handle: 'edizard-ez-max-safe-power-bank-black-gold-silver-5000mah-10000mah', label: 'EDIZARD', name: 'EZ Max Safe Power Bank 5000mAh', srp: 35, promo: 19 },
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
 * If a handle has multiple deals (the ARZOPA multi-variant data gap, see
 * top of file), this returns the FIRST one as a best-effort default — it
 * will not necessarily match the variant the customer has selected.
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
