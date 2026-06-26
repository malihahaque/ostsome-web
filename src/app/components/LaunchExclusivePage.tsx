import { ChevronLeft } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import type { Product } from '../data/products';
import { useAuth } from './AuthContext';
import { getFostPrice } from '../data/pricing';

// One entry per unique discount — colours with identical discount collapsed into one card
interface DealConfig {
  handle: string;
  label: string;
  name: string;
  srp: number;
  promo: number;
}

const ALL_DEALS: DealConfig[] = [
  // BUTTONS — Black & Gold both $229, collapsed to one card
  { handle: 'buttons-clip',                         label: 'BUTTONS', name: 'BUTTONS Clip OWS Earphone',              srp: 285, promo: 229 },

  // LOOKI — all colours $299, collapsed to one card
  { handle: 'looki-l1',                             label: 'LOOKI',   name: 'Looki L1',                               srp: 349, promo: 299 },

  // LOONA
  { handle: 'loona-smart-pet-robot',                label: 'LOONA',   name: 'Petbot Premium (with Charging Dock)',     srp: 758, promo: 649 },

  // KOSPET — T4 Black & Silver both $249, collapsed
  { handle: 'kospet-tank-t4-smartwatch-black-silver', label: 'KOSPET', name: 'TANK T4',                               srp: 298, promo: 249 },
  // KOSPET — T4C Black & Silver both $189, collapsed
  { handle: 'kospet-tank-t4c-smartwatch',           label: 'KOSPET', name: 'TANK T4C',                                srp: 228, promo: 189 },

  // ARZOPA monitors — all different prices, each its own card
  { handle: 'arzopa-ar-a1-gamut-15-6-fhd-portable-monitor-ips-1920-1080p-freq-60hz-type-c-hdmi-w-smart-cover-copy', label: 'ARZOPA', name: '15.6" Portable Monitor (with Smart Cover)', srp: 129, promo: 99  },
  { handle: 'arzopa-ar-a1t-15-6-touch-screen-portable-monitor-fhd-1920-1080p-60hz-type-c-hdmi-copy-1',              label: 'ARZOPA', name: '15.6" Portable Monitor (Touchscreen)',      srp: 189, promo: 159 },
  { handle: 'arzopa-z1rc-2-5k-16-portable-monitor-brilliant-qhd-500nits-8bit-display-qhd-2560-1600-60hz-copy',      label: 'ARZOPA', name: '17.3" Portable Monitor',                   srp: 226, promo: 189 },
  { handle: 'arzopa-z1rc-2-5k-16-portable-monitor-brilliant-qhd-500nits-8bit-display-qhd-2560-1600-60hz-copy',      label: 'ARZOPA', name: '16.1" Portable Monitor 144Hz',              srp: 184, promo: 149 },
  { handle: 'arzopa-z1rc-2-5k-16-portable-monitor-brilliant-qhd-500nits-8bit-display-qhd-2560-1600-60hz-copy',      label: 'ARZOPA', name: '16.0" Portable Monitor 2K',                 srp: 192, promo: 159 },

  // ARZOPA digital frames — Brown $89, Gold 10" $99, Gold 14" $169 — all different
  { handle: 'arzopa-e1-dual-screen-portable-monitor', label: 'ARZOPA', name: '10.1" Digital Frame Brown',             srp: 120, promo: 89  },
  { handle: 'arzopa-e1-dual-screen-portable-monitor', label: 'ARZOPA', name: '10.1" Digital Frame Gold',              srp: 135, promo: 99  },
  { handle: 'arzopa-e1-dual-screen-portable-monitor', label: 'ARZOPA', name: '14.0" Digital Frame Gold',              srp: 229, promo: 169 },
];

type Props = {
  onBack?: () => void;
  onSelectProduct?: (product: Product) => void;
  onJoinFost?: () => void;
};

export function LaunchExclusivePage({ onBack, onSelectProduct, onJoinFost }: Props) {
  const { products, loading } = useProducts();
  const { user } = useAuth();
  const isFostMember = Boolean(user);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero banner */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-neutral-400 hover:text-white text-sm font-medium mb-6 transition-colors"
            >
              <ChevronLeft size={16} /> Back
            </button>
          )}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#F16C10] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
                ▶ Launch Exclusive
              </div>
              <h1 className="text-4xl md:text-6xl font-black uppercase leading-none mb-3">
                Be First To Shop.<br />Get The Best.
              </h1>
              <p className="text-neutral-400 text-sm md:text-base max-w-lg">
                Early Ostsome shoppers get exclusive early bird discounts across 5 brands.
                Shop early, save more — limited time, while stocks last.
              </p>
            </div>
            <div className="text-left md:text-right shrink-0">
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">Early Bird Off</div>
              <div className="text-6xl md:text-7xl font-black text-[#F16C10] leading-none">Up to</div>
              <div className="text-6xl md:text-7xl font-black text-white leading-none">27%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-[#FFF4EC] border-b border-orange-100 py-2 px-4 text-center">
        <p className="text-xs text-[#F16C10] font-medium">
          ⏱ Launch pricing is for a limited time only. While stocks last. All prices include GST.
        </p>
      </div>

      {/* Flat product grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-neutral-100 rounded-2xl aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {ALL_DEALS.map((deal, idx) => {
              const product = products.find(p => p.handle === deal.handle);
              if (!product) return null;
              const pct = Math.round(((deal.srp - deal.promo) / deal.srp) * 100);
              const saving = (deal.srp - deal.promo).toFixed(2);
              return (
                <div
                  key={`${deal.handle}-${idx}`}
                  onClick={() => onSelectProduct?.(product)}
                  className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                >
                  <div className="relative aspect-square bg-neutral-50 overflow-hidden">
                    <img
                      src={product.images?.[0]}
                      alt={deal.name}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition duration-500"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'; }}
                    />
                    <div className="absolute top-2 left-2 bg-[#F16C10] text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full">
                      Early Bird
                    </div>
                    <div className="absolute top-2 right-2 bg-[#E8291C] text-white text-[10px] font-black rounded-full w-9 h-9 flex items-center justify-center leading-none">
                      -{pct}%
                    </div>
                  </div>
                  <div className="p-3 md:p-4">
                    <p className="text-[9px] font-bold text-[#F16C10] uppercase tracking-widest mb-1">{deal.label}</p>
                    <h3 className="text-xs md:text-sm font-bold text-black line-clamp-2 mb-2">{deal.name}</h3>
                    {isFostMember ? (
                      <>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-black text-[#F16C10]">SGD {getFostPrice(deal.promo).toFixed(2)}</span>
                          <span className="text-xs text-neutral-400 line-through">SGD {deal.promo.toFixed(2)}</span>
                        </div>
                        <p className="text-[10px] text-green-600 font-semibold mt-0.5">You save SGD {(deal.srp - getFostPrice(deal.promo)).toFixed(2)}</p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-black text-black">SGD {deal.promo.toFixed(2)}</span>
                          <span className="text-xs text-neutral-400 line-through">SGD {deal.srp.toFixed(2)}</span>
                        </div>
                        <p className="text-[10px] text-green-600 font-semibold mt-0.5">You save SGD {saving}</p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FOST footer CTA */}
      <div className="bg-black text-white py-14 text-center px-4">
        <p className="text-neutral-400 text-xs mb-2 uppercase tracking-widest font-bold">Friends of Ostsome</p>
        <h2 className="text-2xl md:text-3xl font-black mb-3">FOST Members Get First Dibs</h2>
        <p className="text-neutral-400 text-sm max-w-md mx-auto mb-6">
          Join FOST for free and be the first to hear about launch deals, event invites, and member-only pricing.
        </p>
        <button
          onClick={onJoinFost}
          className="bg-[#F16C10] hover:bg-orange-600 text-white font-black text-sm uppercase tracking-widest px-8 py-3 rounded-full transition-colors"
        >
          Join FOST — It's Free
        </button>
      </div>
    </div>
  );
}