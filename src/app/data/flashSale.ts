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

export const FLASH_SALE_START = new Date("2026-07-17T19:00:00+08:00").getTime();
export const FLASH_SALE_END = new Date("2026-07-17T20:00:00+08:00").getTime();

// Product handle -> flash sale price. Handles are the part of the URL
// after /products/ on the live site — copy them exactly, a typo here
// means the deal silently never shows for that product.
export const FLASH_SALE_PRICES: Record<string, number> = {
  "skullcandy-aivator-900-anc-wireless-over-ear": 269.0,
  "kospet-tank-t4-smartwatch-black-silver": 199.0,
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
