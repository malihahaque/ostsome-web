// src/app/data/flashSale.ts
//
// SINGLE SOURCE OF TRUTH for flash sale timing and pricing on the frontend.
// To run a new flash sale: update FLASH_SALE_START, FLASH_SALE_END, and
// FLASH_SALE_PRICES below. Every component that shows a flash price reads
// from here — Hero, ProductDetail, ProductCard, WhatsNewThisWeek,
// CartDrawer, CartContext, and CheckoutPage — so you only ever edit this
// ONE file to change the frontend side of a flash sale.
//
// IMPORTANT: netlify/functions/flash-sale-webhook.js runs in a separate
// Node runtime (Netlify Functions), not your Vite/React bundle, so it
// can't import this file directly. It keeps its own copy of the same
// dates/prices, plus the Shopify variant GIDs and discount titles (which
// this file doesn't need). Whenever you update this file for a new sale,
// also update the FLASH SALE CONFIG block at the top of that webhook file
// to match — that's the one other place still requiring a manual edit.

import { useState, useEffect } from "react";

export const FLASH_SALE_START = new Date("2026-07-31T18:00:00+08:00").getTime();
export const FLASH_SALE_END = new Date("2026-07-31T19:00:00+08:00").getTime();

// Product handle -> flash sale price. Handles are the part of the URL
// after /products/ on the live site — copy them exactly, a typo here
// means the deal silently never shows for that product.
export const FLASH_SALE_PRICES: Record<string, number> = {
  "looki-l1": 289.0,
  "hohem-isteady-mt3-pro-and-mt3-pro-kit": 649.0,
  "pre-order-cleer-arc-iii-music-open-ear-wireless-earbuds": 99.0,
  "skullcandy-dime-evo-true-wireless-earbuds": 59.0,
  "skullcandy-push-ultra-anc-true-wireless-earbuds": 99.0,
  "skullcandy-hesh-evo-wireless-headphones": 79.0,
  "skullcandy-crusher-3-0-wireless-headphones": 99.0,
};

// Some flash-sale products have multiple variants, but the deal only
// applies to ONE of them (e.g. Hohem: the MT3 Pro Kit is on flash sale,
// the base MT3 Pro is not). Map: product handle -> the exact option1Value
// the flash price is scoped to. Omit a handle here if its flash price
// should apply no matter which variant is selected — this is the case for
// all 5 Skullcandy/Cleer products below (deal applies to any colour/variant),
// same as Looki L1.
export const FLASH_SALE_VARIANT_SCOPE: Record<string, string> = {
  "hohem-isteady-mt3-pro-and-mt3-pro-kit": "MT3 Pro Kit",
  "looki-l1": "Black",
};

export function isFlashSaleActiveNow(): boolean {
  const now = Date.now();
  return now >= FLASH_SALE_START && now < FLASH_SALE_END;
}

// For components that need to re-render as the window opens/closes live
// (Hero countdown, PDP badge, cards, cart, checkout) — ticks every second.
export function useFlashSaleActive(): boolean {
  const [isActive, setIsActive] = useState(isFlashSaleActiveNow);

  useEffect(() => {
    const tick = () => setIsActive(isFlashSaleActiveNow());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return isActive;
}

export function getFlashPrice(handle: string): number | undefined {
  return FLASH_SALE_PRICES[handle];
}

// Use this (not getFlashPrice directly) anywhere you're pricing an actual
// cart/checkout line item, since a line item carries the variant the
// customer actually chose. Returns undefined if this handle has no flash
// deal, OR if the deal is scoped to a specific variant and the item's
// variant doesn't match — e.g. a base "MT3 Pro" line item never gets the
// Kit's flash price, even while the sale is running.
export function getFlashPriceForItem(handle: string, selectedOption1?: string | null): number | undefined {
  const price = FLASH_SALE_PRICES[handle];
  if (price === undefined) return undefined;
  const requiredVariant = FLASH_SALE_VARIANT_SCOPE[handle];
  if (requiredVariant && selectedOption1 !== requiredVariant) return undefined;
  return price;
}

// Shared 3-state sale clock (countdown -> live -> ended), used by both the
// Hero banner countdown badge and the FridayFlashDeals homepage section, so
// there is exactly ONE place computing "how long until/since the sale" —
// previously this lived only inside Hero.tsx as a local hook.
export type SaleState = "countdown" | "live" | "ended";

export function useSaleState(): {
  state: SaleState;
  days: string;
  hours: string;
  minutes: string;
} {
  const getState = (): { state: SaleState; timeLeft: number } => {
    const now = Date.now();
    if (now < FLASH_SALE_START) return { state: "countdown", timeLeft: FLASH_SALE_START - now };
    if (now < FLASH_SALE_END) return { state: "live", timeLeft: FLASH_SALE_END - now };
    return { state: "ended", timeLeft: 0 };
  };

  const [info, setInfo] = useState(getState);

  useEffect(() => {
    const tick = () => setInfo(getState());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const clamped = Math.max(info.timeLeft, 0);
  const days = Math.floor(clamped / (1000 * 60 * 60 * 24));
  const hours = Math.floor((clamped / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((clamped / (1000 * 60)) % 60);

  return {
    state: info.state,
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
  };
}