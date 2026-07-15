import { useState, useEffect } from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import type { Product } from '../data/products';
import { useAuth } from './AuthContext';
import { getFostPrice } from '../data/pricing';

type ProductCardProps = {
  product: Product;
  onClick: (product: Product) => void;
};

// Flash sale window: 17 July 2026, 7:00–8:00 PM Singapore Time (UTC+8).
// Must stay in sync with the same window in Hero.tsx, ProductDetail.tsx,
// and the caps in flash-sale-webhook.js.
const FLASH_SALE_START = new Date("2026-07-17T19:00:00+08:00").getTime();
const FLASH_SALE_END = new Date("2026-07-17T20:00:00+08:00").getTime();

// TODO: must match the same handles used in ProductDetail.tsx exactly.
const FLASH_SALE_PRICES: Record<string, number> = {
  "skullcandy-aivator-900-anc-wireless-over-ear": 269.0,
  "kospet-tank-t4-smartwatch-black-silver": 199.0,
};

function useFlashSaleActive() {
  const inWindow = () => {
    const now = Date.now();
    return now >= FLASH_SALE_START && now < FLASH_SALE_END;
  };
  const [isActive, setIsActive] = useState(inWindow);

  useEffect(() => {
    const tick = () => setIsActive(inWindow());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return isActive;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const [imgIdx, setImgIdx] = useState(0);
  const { user } = useAuth();
  const isFostMember = Boolean(user);
  const flashSaleActive = useFlashSaleActive();
  const flashSalePrice = FLASH_SALE_PRICES[product.handle];
  const showFlashPrice = isFostMember && flashSaleActive && flashSalePrice !== undefined;
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0;
  // Stacks on top of any existing sale price — getFostPrice is applied to
  // product.price, which is already the discounted price if one exists.
  const fostPrice = getFostPrice(product.price);
  const isSoldOut = !product.availableForSale;

  return (
    <div
      className="group bg-white border border-neutral-100 rounded-xl overflow-hidden hover:shadow-lg hover:border-neutral-200 transition-all duration-300 cursor-pointer flex flex-col"
      onClick={() => onClick(product)}
    >
      <div
        className="relative overflow-hidden bg-neutral-50"
        style={{ aspectRatio: '1 / 1' }}
        onMouseEnter={() => product.images.length > 1 && setImgIdx(1)}
        onMouseLeave={() => setImgIdx(0)}
      >
        <img
          src={product.images[imgIdx] || product.images[0]}
          alt={product.title}
          className={`w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500 ${isSoldOut ? 'opacity-50 grayscale' : ''}`}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';
          }}
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isSoldOut ? (
            <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
              Sold Out
            </span>
          ) : showFlashPrice ? (
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide animate-pulse">
              Flash Deal
            </span>
          ) : hasDiscount && (
            <span className="bg-[#F16C10] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
              -{discountPct}%
            </span>
          )}
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
          <button className="flex items-center gap-2 bg-white border border-neutral-200 text-black text-xs font-semibold px-4 py-2 rounded-full shadow-md hover:bg-[#F16C10] hover:text-white hover:border-[#F16C10] transition-all">
            <Eye size={13} />
            Quick View
          </button>
        </div>
        {product.images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {product.images.slice(0, 4).map((_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all ${
                  i === imgIdx ? 'w-3 h-1.5 bg-[#F16C10]' : 'w-1.5 h-1.5 bg-neutral-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] font-semibold text-[#F16C10] uppercase tracking-widest mb-1">
          {product.vendor}
        </p>
        <h3 className="text-sm font-semibold text-black leading-snug mb-3 line-clamp-2 flex-1">
          {product.title}
        </h3>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            {showFlashPrice ? (
              <>
                <span className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
                  SGD {flashSalePrice!.toFixed(2)}
                </span>
                <span className="text-xs text-neutral-400 line-through">
                  SGD {product.price.toFixed(2)}
                </span>
              </>
            ) : isFostMember ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold text-[#F16C10]">
                    SGD {fostPrice.toFixed(2)}
                  </span>
                  <span className="text-[8px] font-bold text-white bg-[#F16C10] px-1.5 py-0.5 rounded uppercase tracking-wide">
                    FOST
                  </span>
                </div>
                <span className="text-xs text-neutral-400 line-through">
                  SGD {product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <>
                <span className="text-base font-bold text-black">
                  SGD {product.price.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-neutral-400 line-through">
                    SGD {product.comparePrice!.toFixed(2)}
                  </span>
                )}
              </>
            )}
          </div>
          <button
            className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 transition-all ${
              isSoldOut
                ? 'border-neutral-100 text-neutral-300 cursor-not-allowed'
                : 'border-neutral-200 text-neutral-500 hover:bg-[#F16C10] hover:border-[#F16C10] hover:text-white'
            }`}
            onClick={(e) => { e.stopPropagation(); }}
            disabled={isSoldOut}
            aria-label={isSoldOut ? 'Sold out' : 'Add to cart'}
          >
            <ShoppingCart size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}