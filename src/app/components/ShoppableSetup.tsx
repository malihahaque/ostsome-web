import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import type { Product as AppProduct } from '../data/products';
import deskSetup from '../../imports/desk_study_setup_.png';
import beachProducts from '../../imports/beach_products_figma.png';

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

interface Product {
  id: number;
  name: string;
  price: number;
  handle?: string; // Shopify handle — when set, the tooltip links through to the real product page
  position: {
    top: string;
    left: string;
  };
}

interface Scene {
  id: string;
  image: string;
  navigatorText: string;
  navigatorTextShort: string;
  products: Product[];
}

const scenes: Scene[] = [
  {
    id: 'desk-setup',
    image: deskSetup,
    navigatorText: 'DEFINE YOUR WORKSPACE',
    navigatorTextShort: 'YOUR WORKSPACE',
    products: [
      {
        id: 1,
        name: 'Arzopa D10 Digital Photo Frame',
        price: 114,
        handle: 'arzopa-d10-10-1-digital-photo-frame',
        position: { top: '58%', left: '15%' },
      },
      {
        id: 2,
        name: 'Arzopa Portable Monitor',
        price: 172,
        handle: 'arzopa-ar-a1-gamut-15-6-fhd-portable-monitor-ips-1920-1080p-freq-60hz-type-c-hdmi-w-smart-cover-copy',
        position: { top: '33%', left: '44%' },
      },
      {
        id: 3,
        name: 'Skullcandy Crusher ANC 2 Wireless Headphones',
        price: 279,
        handle: 'skullcandy-crusher-anc-2-wireless-headphones',
        position: { top: '62%', left: '73%' },
      },
      {
        id: 4,
        name: 'LARQ Water Bottle',
        price: 69,
        handle: 'larq-bottle-swig-top-680ml',
        position: { top: '54%', left: '85%' },
      },
    ],
  },
  {
    id: 'beach-setup',
    image: beachProducts,
    navigatorText: 'WITH YOU, WHEREVER YOU GO',
    navigatorTextShort: 'WHEREVER YOU GO',
    products: [
      {
        id: 5,
        name: 'Polaroid Camera',
        price: 229,
        handle: 'polaroid-now-instant-camera-gen3',
        position: { top: '64%', left: '24%' },
      },
      {
        id: 8,
        name: 'Dometic Cooler',
        price: 1349,
        handle: 'dometic-cfx5-35-performance-compressor-cooler',
        position: { top: '42%', left: '34%' },
      },
      {
        id: 6,
        name: 'Otterbox Tumbler',
        price: 18,
        handle: 'otterbox-elevation-hot-cold-tumbler-20-fluid-oz-591ml',
        position: { top: '50%', left: '69%' },
      },
      {
        id: 7,
        name: 'Sennheiser Headphones',
        price: 179,
        handle: 'sennheiser-accentum-wireless-headphone',
        position: { top: '45%', left: '86%' },
      },
    ],
  },
];

export function ShoppableSetup({ onSelectProduct }: { onSelectProduct?: (product: AppProduct) => void }) {
  const { products: catalogProducts } = useProducts();
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  const nextScene = () => {
    setCurrentSceneIndex((prev) => (prev + 1) % scenes.length);
    setActiveProduct(null);
  };

  const prevScene = () => {
    setCurrentSceneIndex((prev) => (prev - 1 + scenes.length) % scenes.length);
    setActiveProduct(null);
  };

  return (
    <section className="py-8 md:py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-4 md:mb-8">
        <div className="text-left md:text-center">
          <h2 className="text-[26px] md:text-4xl font-bold text-black mb-2">Shop The Setup</h2>
          <p className="text-[14px] md:text-base text-neutral-600 leading-relaxed md:leading-normal">Tap on the products to see details</p>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        {/* Carousel Container */}
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSceneIndex * 100}%)` }}
        >
          {scenes.map((scene) => (
            <div key={scene.id} className="w-full flex-shrink-0 relative aspect-[3/1]">
              <ImageWithFallback
                src={scene.image}
                alt={scene.navigatorText}
                className="w-full h-full object-cover object-left sm:object-center"
              />

              {scene.products.map((product) => (
                <div
                  key={product.id}
                  className="absolute"
                  style={{ top: product.position.top, left: product.position.left, transform: 'translate(-50%, -50%)' }}
                  onMouseEnter={() => setActiveProduct(product)}
                  onMouseLeave={() => setActiveProduct(null)}
                  onClick={() => setActiveProduct(activeProduct?.id === product.id ? null : product)}
                >
                  <button
                    className="w-8 h-8 md:w-4 md:h-4 flex items-center justify-center -ml-2 -mt-2 md:m-0 cursor-pointer"
                    aria-label={`View ${product.name}`}
                  >
                    <span className="w-4 h-4 bg-white rounded-full shadow-lg border-2 border-[#F16C10] hover:scale-125 transition-transform inline-block" />
                  </button>

                  {activeProduct?.id === product.id && (() => {
                    const realProduct = product.handle
                      ? catalogProducts.find(p => p.handle === product.handle)
                      : undefined;
                    return (
                      // Note: pb-3 (padding) instead of mb-3 (margin) on this outer
                      // layer — padding is part of the element's own hoverable box,
                      // so the "gap" between the dot and the card below is bridged
                      // and the mouse never leaves the hotspot while crossing it.
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-3 z-10">
                        <div
                          className={`relative bg-white px-4 py-3 rounded-lg shadow-xl border border-neutral-200 whitespace-nowrap ${realProduct ? 'cursor-pointer hover:border-[#F16C10] transition-colors' : ''}`}
                          onClick={(e) => {
                            if (realProduct && onSelectProduct) {
                              e.stopPropagation();
                              onSelectProduct(realProduct);
                            }
                          }}
                        >
                          <div className="text-[14px] md:text-sm font-bold text-black mb-1">{product.name}</div>
                          <div className="text-[16px] md:text-lg font-bold text-[#F16C10]">${product.price}</div>
                          {realProduct && (
                            <div className="text-[11px] font-semibold text-[#F16C10] mt-1">View Product →</div>
                          )}
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white border-r border-b border-neutral-200" />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Navigator */}
        <div className="absolute bottom-3 left-3 md:bottom-6 md:left-6 bg-white/95 backdrop-blur-sm px-3 py-2 md:p-4 shadow-lg border border-neutral-100 min-w-[160px] md:min-w-[200px] z-20 rounded-sm">
          {/* Short label on mobile, full label on desktop */}
          <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-black mb-2">
            <span className="md:hidden">{scenes[currentSceneIndex].navigatorTextShort}</span>
            <span className="hidden md:inline">{scenes[currentSceneIndex].navigatorText}</span>
          </h3>
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-1.5">
              <button
                onClick={prevScene}
                className="w-8 h-8 flex items-center justify-center border border-neutral-200 rounded-full hover:border-[#F16C10] hover:text-[#F16C10] transition-colors bg-white"
                aria-label="Previous Setup"
              >
                <ChevronLeftIcon />
              </button>
              <button
                onClick={nextScene}
                className="w-8 h-8 flex items-center justify-center border border-neutral-200 rounded-full hover:border-[#F16C10] hover:text-[#F16C10] transition-colors bg-white"
                aria-label="Next Setup"
              >
                <ChevronRightIcon />
              </button>
            </div>
            <div className="text-[10px] md:text-xs font-bold tracking-widest text-neutral-400">
              <span className="text-black">{String(currentSceneIndex + 1).padStart(2, '0')}</span> / {String(scenes.length).padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}