// src/app/components/FridayFlashDeals.tsx
//
// Homepage section shown directly under Hero — a clickable summary of every
// product in the current Friday flash sale, so people don't have to search
// for them individually. Reads timing from the SAME source as Hero's
// countdown badge (useSaleState in ../data/flashSale) so the two never
// drift out of sync with each other.
//
// ⚠️ FIELD NAMES TO VERIFY: this assumes each Product has `name`, `brand`,
// `image` (or `images[0]`), and `price` (the regular, non-flash price used
// as the "RETAIL PRICE" strikethrough). If your actual Product type in
// data/products.ts uses different field names, adjust the `product.xxx`
// references below — I don't have that file in front of me to confirm exact
// field names, so this is a best-effort match against common patterns seen
// elsewhere in the codebase (ProductDetail, ProductCard).
//
// No "X/N claimed" progress bar — intentionally omitted. Showing a live,
// accurate claimed count would require a new server-side endpoint (Admin
// API calls can't run from the frontend), which wasn't wanted for this pass.

import { useSaleState, FLASH_SALE_PRICES, getFlashPrice } from "../data/flashSale";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Clock, Lock } from "lucide-react";
import type { Product } from "../data/products";

// Local card images for this specific sale, same pattern as Hero.tsx's
// banner imports. These are used INSTEAD OF the product's Shopify image —
// intentional, so this section can use a hand-picked lifestyle shot rather
// than whatever's set as the primary product image in Shopify Admin.
//
// ⚠️ Rename "Skullcandy Hesh Evo .jpg" to remove the trailing space before
// the extension (-> "Skullcandy Hesh Evo.jpg") before adding it to the
// imports folder — a space right before the file extension can break the
// import path on some setups.
import crusherImg from "../../imports/skullcandy crusher wireless.jpg";
import heshEvoImg from "../../imports/Skullcandy Hesh Evo .jpg";
import pushAncImg from "../../imports/skullcandy push anc.jpg";
import dimeEvoImg from "../../imports/skullcandy dime evo.jpg";
import cleerArcImg from "../../imports/Cleer ARC 3.webp";

// Handle -> local image, so each card can look up its image without relying
// on the (possibly different) image Shopify has set for the product.
const FLASH_DEAL_IMAGES: Record<string, string> = {
  "skullcandy-crusher-3-0-wireless-headphones": crusherImg,
  "skullcandy-hesh-evo-wireless-headphones": heshEvoImg,
  "skullcandy-push-ultra-anc-true-wireless-earbuds": pushAncImg,
  "skullcandy-dime-evo-true-wireless-earbuds": dimeEvoImg,
  "pre-order-cleer-arc-iii-music-open-ear-wireless-earbuds": cleerArcImg,
};

// Hardcoded display name/brand per handle, matching the confirmed banner
// copy exactly. Not pulling this from product.name/product.brand because
// those field names on the actual Product type are still unconfirmed —
// the previous attempt using them silently rendered blank text. Once
// data/products.ts is shared, this can be swapped back to reading live
// from the product object if preferred.
const FLASH_DEAL_INFO: Record<string, { name: string; brand: string }> = {
  "pre-order-cleer-arc-iii-music-open-ear-wireless-earbuds": {
    name: "ARC III Music Open-Ear Wireless Earbuds",
    brand: "Cleer",
  },
  "skullcandy-dime-evo-true-wireless-earbuds": {
    name: "Dime® Evo True Wireless Earbuds",
    brand: "Skullcandy",
  },
  "skullcandy-push-ultra-anc-true-wireless-earbuds": {
    name: "Push ANC Active True Wireless Earbuds",
    brand: "Skullcandy",
  },
  "skullcandy-hesh-evo-wireless-headphones": {
    name: "Hesh Evo Wireless Headphones",
    brand: "Skullcandy",
  },
  "skullcandy-crusher-3-0-wireless-headphones": {
    name: "Crusher Wireless 3.0 Over-Ear Headphones",
    brand: "Skullcandy",
  },
};

type FridayFlashDealsProps = {
  products: Product[]; // pass in the live Product objects for every handle in FLASH_SALE_PRICES, in display order
  isFostMember: boolean;
  onSelectProduct: (product: Product) => void;
  onJoinFost: () => void;
  onViewAllFlashDeals?: () => void; // optional — wire up if/when there's a dedicated flash deals page
};

function formatSGD(n: number): string {
  return `SGD ${n.toFixed(0)}`;
}

export function FridayFlashDeals({
  products,
  isFostMember,
  onSelectProduct,
  onJoinFost,
  onViewAllFlashDeals,
}: FridayFlashDealsProps) {
  const { state, days, hours, minutes } = useSaleState();

  // Nothing to show if none of the passed-in products actually have a flash
  // price configured (e.g. handle typo, or FLASH_SALE_PRICES not yet updated).
  const dealProducts = products.filter((p) => FLASH_SALE_PRICES[p.handle] !== undefined);
  if (dealProducts.length === 0) return null;

  return (
    <section className="w-full bg-white border-b border-gray-100 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-orange-600 text-xs font-bold tracking-wide uppercase mb-2">
              <span>👑</span>
              <span>Exclusive for FOST Members</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Friday{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
                Flash Deals
              </span>
            </h2>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              1 hour only. Unbeatable prices on the best tech &amp; lifestyle gear.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-3 text-xs md:text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-orange-500" /> Only 6PM – 7PM
              </span>
              <span className="flex items-center gap-1.5">
                <Lock size={14} className="text-orange-500" /> Exclusive member pricing
              </span>
            </div>
          </div>

          {/* Countdown card — only really meaningful pre-sale, but shown in all
              states so the section layout doesn't jump around between states */}
          <div className="bg-gray-50 rounded-2xl px-6 py-4 shrink-0 self-start">
            {state === "countdown" && (
              <>
                <div className="text-[10px] font-bold text-gray-500 tracking-wider text-center mb-2">
                  DEAL STARTS IN
                </div>
                <div className="flex items-center gap-3">
                  {[
                    { value: days, label: "DAYS" },
                    { value: hours, label: "HOURS" },
                    { value: minutes, label: "MINS" },
                  ].map((unit, i) => (
                    <div key={unit.label} className="flex items-center gap-3">
                      {i > 0 && <span className="text-gray-300 font-bold">:</span>}
                      <div className="flex flex-col items-center leading-none">
                        <span className="text-2xl font-extrabold text-orange-600">{unit.value}</span>
                        <span className="text-[9px] text-gray-400 tracking-wide mt-1">{unit.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {state === "live" && (
              <div className="flex items-center gap-2 text-orange-600 font-extrabold text-lg animate-pulse">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                DEAL LIVE NOW
              </div>
            )}
            {state === "ended" && (
              <div className="text-center">
                <div className="text-sm font-bold text-gray-700">Deal has ended</div>
                <div className="text-xs text-gray-400 mt-0.5">More deals coming soon</div>
              </div>
            )}
          </div>
        </div>

        {/* Product cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {dealProducts.map((product) => {
            const flashPrice = getFlashPrice(product.handle);
            const retailPrice = product.price;
            const imageSrc = FLASH_DEAL_IMAGES[product.handle] ?? "";
            const info = FLASH_DEAL_INFO[product.handle];

            return (
              <button
                key={product.handle}
                onClick={() => onSelectProduct(product)}
                className="text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    🔥 HOT DEAL
                  </span>
                  <ImageWithFallback
                    src={imageSrc}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-3">
                  <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wide mb-0.5">
                    {info?.brand ?? ""}
                  </div>
                  <div className="text-sm font-bold text-gray-900 leading-snug mb-2 line-clamp-2 min-h-[2.5rem]">
                    {info?.name ?? product.handle}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-gray-400 tracking-wide">RETAIL PRICE</span>
                      <span className="text-xs text-gray-400 line-through">
                        {retailPrice !== undefined ? formatSGD(retailPrice) : ""}
                      </span>
                    </div>
                    <div className="flex flex-col bg-orange-50 rounded-lg px-2 py-1">
                      <span className="text-[9px] text-orange-500 tracking-wide font-bold">
                        FOST PRICE
                      </span>
                      <span className="text-sm font-extrabold text-orange-600">
                        {flashPrice !== undefined ? formatSGD(flashPrice) : ""}
                      </span>
                    </div>
                  </div>

                  {!isFostMember && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onJoinFost();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-orange-600 border border-orange-200 rounded-lg py-2 hover:bg-orange-50 transition-colors"
                    >
                      <Lock size={12} />
                      JOIN FOST TO UNLOCK
                    </button>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {onViewAllFlashDeals && (
          <div className="text-center mt-6">
            <button
              onClick={onViewAllFlashDeals}
              className="text-sm font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1"
            >
              View All Flash Deals →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
