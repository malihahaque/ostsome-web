import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Star, Shield, Truck, RefreshCw, Check } from 'lucide-react';
import type { Product } from '../data/products';
import { getVariants } from '../data/productVariants';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { fetchProductByHandle } from '../data/shopify';
import { getFostPrice } from '../data/pricing';

type ProductDetailProps = {
  product: Product;
  onBack: () => void;
  onCheckout?: () => void;
};

export function ProductDetail({ product, onBack, onCheckout }: ProductDetailProps) {
  const { user } = useAuth();
  const isFostMember = Boolean(user);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedOption1, setSelectedOption1] = useState<string | null>(null);
  const [selectedOption2, setSelectedOption2] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { addItem } = useCart();
  const [shopifyVariants, setShopifyVariants] = useState<Record<string, string>>({});

  // Fetch Shopify variant GIDs for checkout
  useEffect(() => {
    fetchProductByHandle(product.handle).then(sp => {
      if (!sp) return;
      const map: Record<string, string> = {};
      sp.variants.edges.forEach(({ node }) => {
        // Key by option values joined, or 'default' for single-variant products
        const optionValues = node.selectedOptions
          .filter(o => o.name !== 'Title' && o.value !== 'Default Title')
          .map(o => o.value);
        const key = optionValues.length > 0 ? optionValues.join('/') : 'default';
        map[key] = node.id;
      });
      setShopifyVariants(map);
    }).catch(() => {}); // silent fail
  }, [product.handle]);
  const variants = getVariants(product.handle);

  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0;

  const option1Name = variants[0]?.option1Name ?? null;
  const option2Name = variants[0]?.option2Name ?? null;

  const option1Values = useMemo(() =>
    [...new Set(variants.map(v => v.option1Value))] as string[],
    [variants]
  );

  const option2Values = useMemo(() => {
    const base = selectedOption1
      ? variants.filter(v => v.option1Value === selectedOption1)
      : variants;
    return [...new Set(
      base.map(v => v.option2Value).filter((v): v is string => Boolean(v))
    )] as string[];
  }, [variants, selectedOption1]);

  const selectedVariant = useMemo(() => {
    if (!selectedOption1) return null;
    return variants.find(v =>
      v.option1Value === selectedOption1 &&
      (!selectedOption2 || v.option2Value === selectedOption2)
    ) ?? null;
  }, [variants, selectedOption1, selectedOption2]);

  const activePrice = selectedVariant ? selectedVariant.price : product.price;

  const allImages = useMemo(() => {
    const variantImgs = variants
      .map(v => v.image)
      .filter((img): img is string => Boolean(img));
    const combined = [...product.images, ...variantImgs];
    return [...new Set(combined)] as string[];
  }, [product.images, variants]);

  const isColourOption = (name: string | null) =>
    name?.toLowerCase().includes('color') || name?.toLowerCase().includes('colour');

  function handleOption1Select(val: string) {
    setSelectedOption1(val);
    setSelectedOption2(null);
    if (isColourOption(option1Name)) {
      const v = variants.find(vv => vv.option1Value === val && vv.image);
      if (v?.image) {
        const idx = allImages.indexOf(v.image);
        if (idx !== -1) setActiveImg(idx);
      }
    }
  }

  function handleOption2Select(val: string) {
    setSelectedOption2(val);
    const v = variants.find(vv =>
      (!selectedOption1 || vv.option1Value === selectedOption1) &&
      vv.option2Value === val &&
      vv.image
    );
    if (v?.image) {
      const idx = allImages.indexOf(v.image);
      if (idx !== -1) setActiveImg(idx);
    }
  }

  const needsOption1 = variants.length > 0 && option1Name && option1Name !== 'Title';
  const needsOption2 = option2Values.length > 0 && option2Name;

  function getMissingOptionsMessage(): string | null {
    if (needsOption1 && !selectedOption1 && needsOption2 && !selectedOption2) {
      return `Please select a ${option1Name} and ${option2Name} before adding to cart.`;
    }
    if (needsOption1 && !selectedOption1) {
      return `Please select a ${option1Name} before adding to cart.`;
    }
    if (needsOption2 && !selectedOption2) {
      return `Please select a ${option2Name} before adding to cart.`;
    }
    return null;
  }

  function handleAddToCart() {
    const error = getMissingOptionsMessage();
    if (error) {
      setValidationError(error);
      setTimeout(() => setValidationError(null), 3500);
      return;
    }
    setValidationError(null);
    addItem({
      product,
      selectedOption1,
      selectedOption2,
      variantPrice: activePrice,
      variantImage: selectedVariant?.image ?? product.images[0],
      shopifyVariantId: (() => {
        const key = [selectedOption1, selectedOption2].filter(Boolean).join('/');
        return shopifyVariants[key] || shopifyVariants['default'] || null;
      })(),
      qty,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  function handleBuyNow() {
    const error = getMissingOptionsMessage();
    if (error) {
      setValidationError(error);
      setTimeout(() => setValidationError(null), 3500);
      return;
    }
    setValidationError(null);
    addItem({
      product,
      selectedOption1,
      selectedOption2,
      variantPrice: activePrice,
      variantImage: selectedVariant?.image ?? product.images[0],
      shopifyVariantId: (() => {
        const key = [selectedOption1, selectedOption2].filter(Boolean).join('/');
        return shopifyVariants[key] || shopifyVariants['default'] || null;
      })(),
      qty,
    });
    onCheckout?.();
  }

  // Per-product video banners shown at the top of the page (YouTube video ID + autoplay)
  const PRODUCT_VIDEOS: Record<string, { videoId: string; title: string; start?: number }> = {
    'looki-l1': { videoId: 'KHjibXAMLxI', title: 'Looki L1 video', start: 1 },
    'dometic-cfx5-35-performance-compressor-cooler': { videoId: 'YV7fcGkof0I', title: 'Dometic CFX5 35 video' },
    'polaroid-now-instant-camera-gen3': { videoId: 'IeAajXkrRgQ', title: 'Polaroid Now+ Gen3 video' },
    'skullcandy-crusher-anc-2-wireless-headphones': { videoId: 'uOqvYKwIeP4', title: 'Skullcandy Crusher ANC 2 video' },
    'pre-order-larq-bottle-purevis-2-self-cleaning-1000ml': { videoId: 'Lmi5XBA-PhA', title: 'LARQ Bottle PureVis 2 video' },
    'arzopa-d10-10-1-digital-photo-frame': { videoId: '_Hbar0aUjis', title: 'Arzopa D10 video' },
  };
  const productVideo = PRODUCT_VIDEOS[product.handle];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-[#F16C10] transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Products
        </button>
      </div>

      {productVideo && (
        <div className="max-w-2xl mx-auto px-4 mb-8">
          <div className="relative w-full overflow-hidden rounded-2xl bg-neutral-50" style={{ aspectRatio: '16 / 9' }}>
            <iframe
              src={`https://www.youtube.com/embed/${productVideo.videoId}?${productVideo.start ? `start=${productVideo.start}&` : ''}autoplay=1&mute=1&playsinline=1`}
              title={productVideo.title}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* Image Gallery */}
          <div className="flex flex-col gap-4">
            <div className="relative rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-100 group" style={{ aspectRatio: '1 / 1' }}>
              <img
                src={allImages[activeImg] ?? product.images[0]}
                alt={product.title}
                className="w-full h-full object-contain p-8 transition-opacity duration-300"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'; }}
              />
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg((i) => (i - 1 + allImages.length) % allImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white shadow rounded-full flex items-center justify-center text-black transition opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setActiveImg((i) => (i + 1) % allImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white shadow rounded-full flex items-center justify-center text-black transition opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
              {hasDiscount && (
                <div className="absolute top-4 left-4 bg-[#F16C10] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  -{discountPct}% OFF
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-[#F16C10]' : 'border-neutral-200 hover:border-neutral-400'}`}
                  >
                    <img
                      src={img}
                      alt={`View ${i + 1}`}
                      className="w-full h-full object-contain bg-neutral-50 p-1"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-bold text-[#F16C10] uppercase tracking-widest">{product.vendor}</span>
              <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">{product.category}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-black leading-tight mb-4">{product.title}</h1>

            <div className="flex items-center gap-2 mb-5">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={14} className={s <= 4 ? 'text-amber-400 fill-amber-400' : 'text-neutral-200 fill-neutral-200'} />
                ))}
              </div>
              <span className="text-xs text-neutral-400">(24 reviews)</span>
            </div>

            {isFostMember ? (
              <div className="mb-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-[#F16C10]">SGD {getFostPrice(activePrice).toFixed(2)}</span>
                  <span className="text-lg text-neutral-400 line-through">SGD {activePrice.toFixed(2)}</span>
                  <span className="text-[10px] font-bold text-white bg-[#F16C10] px-2 py-0.5 rounded-full uppercase tracking-wide">FOST Price</span>
                </div>
                {hasDiscount && (
                  <p className="text-xs text-neutral-400 mt-1">Original price SGD {product.comparePrice!.toFixed(2)} — now with an extra 5% FOST member discount</p>
                )}
              </div>
            ) : (
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl font-bold text-black">SGD {activePrice.toFixed(2)}</span>
                {hasDiscount && (
                  <span className="text-lg text-neutral-400 line-through">SGD {product.comparePrice!.toFixed(2)}</span>
                )}
              </div>
            )}
            {!isFostMember && (
              <p className="text-xs text-[#F16C10] font-semibold mb-5">
                FOST members save an extra 5% — join free to unlock this price.
              </p>
            )}
            {isFostMember && <div className="mb-5" />}

            <p className="text-xs text-neutral-500 mb-6 bg-neutral-50 border border-neutral-100 rounded-lg px-3 py-2">
              Or 3 payments of <strong className="text-black">SGD {((isFostMember ? getFostPrice(activePrice) : activePrice) / 3).toFixed(2)}</strong> with Atome. Taxes included.
            </p>

            {/* Option 1 */}
            {variants.length > 0 && option1Name && option1Name !== 'Title' && (
              <div className="mb-5">
                <label className={`text-xs font-semibold uppercase tracking-wide block mb-2 ${validationError && !selectedOption1 ? 'text-red-500' : 'text-neutral-600'}`}>
                  {option1Name}
                  {selectedOption1 && (
                    <span className="text-black normal-case tracking-normal font-normal ml-1">: {selectedOption1}</span>
                  )}
                  {validationError && !selectedOption1 && (
                    <span className="text-red-500 normal-case tracking-normal font-normal ml-1">— required</span>
                  )}
                </label>
                {isColourOption(option1Name) ? (
                  <div className="flex flex-wrap gap-2">
                    {option1Values.map((val) => {
                      const v = variants.find(vv => vv.option1Value === val && vv.image);
                      return (
                        <button
                          key={val}
                          onClick={() => handleOption1Select(val)}
                          title={val}
                          className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                            selectedOption1 === val
                              ? 'border-[#F16C10] scale-110'
                              : 'border-neutral-200 hover:border-neutral-400'
                          }`}
                        >
                          {v?.image ? (
                            <img src={v.image} alt={val} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-[8px] text-neutral-400 p-0.5 text-center leading-tight">
                              {val}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {option1Values.map((val) => (
                      <button
                        key={val}
                        onClick={() => handleOption1Select(val)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          selectedOption1 === val
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Option 2 */}
            {option2Values.length > 0 && option2Name && (
              <div className="mb-5">
                <label className={`text-xs font-semibold uppercase tracking-wide block mb-2 ${validationError && !selectedOption2 ? 'text-red-500' : 'text-neutral-600'}`}>
                  {option2Name}
                  {selectedOption2 && (
                    <span className="text-black normal-case tracking-normal font-normal ml-1">: {selectedOption2}</span>
                  )}
                  {validationError && !selectedOption2 && (
                    <span className="text-red-500 normal-case tracking-normal font-normal ml-1">— required</span>
                  )}
                </label>
                {isColourOption(option2Name) ? (
                  <div className="flex flex-wrap gap-2">
                    {option2Values.map((val) => {
                      const v = variants.find(vv =>
                        (!selectedOption1 || vv.option1Value === selectedOption1) &&
                        vv.option2Value === val
                      );
                      return (
                        <button
                          key={val}
                          onClick={() => handleOption2Select(val)}
                          title={val}
                          className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                            selectedOption2 === val
                              ? 'border-[#F16C10] scale-110'
                              : 'border-neutral-200 hover:border-neutral-400'
                          }`}
                        >
                          {v?.image ? (
                            <img src={v.image} alt={val} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-[8px] text-neutral-400 p-0.5 text-center leading-tight">
                              {val}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {option2Values.map((val) => (
                      <button
                        key={val}
                        onClick={() => setSelectedOption2(val)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          selectedOption2 === val
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide block mb-2">Quantity</label>
              <div className="flex items-center border border-neutral-200 rounded-lg w-fit">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:text-black transition text-xl font-light">−</button>
                <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:text-black transition text-xl font-light">+</button>
              </div>
            </div>

            {validationError && (
              <div className="mb-3 flex items-start gap-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium px-4 py-3 rounded-xl animate-pulse">
                <span className="text-base leading-none mt-0.5">⚠️</span>
                <span>{validationError}</span>
              </div>
            )}

            <div className="flex flex-col gap-3 mb-8">
              {!product.availableForSale ? (
                <div className="w-full bg-neutral-100 text-neutral-400 font-bold py-4 rounded-xl flex items-center justify-center text-sm uppercase tracking-wide">
                  Sold Out
                </div>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all text-sm uppercase tracking-wide ${
                      addedToCart
                        ? 'bg-green-500 text-white'
                        : 'bg-[#F16C10] hover:bg-[#d9610e] text-white'
                    }`}
                  >
                    {addedToCart ? (
                      <><Check size={18} /> Added to Cart</>
                    ) : (
                      <><ShoppingCart size={18} /> Add to Cart</>
                    )}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="w-full bg-black hover:bg-neutral-800 text-white font-bold py-4 rounded-xl transition-colors text-sm uppercase tracking-wide"
                  >
                    Buy Now
                  </button>
                </>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: Truck, label: 'Free shipping', sub: 'Orders over SGD 150' },
                { icon: Shield, label: 'Warranty', sub: '1-year coverage' },
                { icon: RefreshCw, label: 'Easy returns', sub: '30-day policy' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center p-3 bg-neutral-50 rounded-xl">
                  <Icon size={18} className="text-[#F16C10] mb-1.5" />
                  <span className="text-xs font-semibold text-black">{label}</span>
                  <span className="text-[10px] text-neutral-400 leading-tight">{sub}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-100 mb-6" />

            <div>
              <h2 className="text-sm font-bold text-black uppercase tracking-wide mb-4">About this product</h2>
              <div
                className="text-sm text-neutral-600 leading-relaxed product-description"
                dangerouslySetInnerHTML={{ __html: product.bodyHtml }}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .product-description ul { list-style: disc; padding-left: 1.25rem; margin: 0.75rem 0; }
        .product-description li { margin-bottom: 0.25rem; }
        .product-description p { margin-bottom: 0.75rem; }
        .product-description h3 { font-weight: 700; margin: 1rem 0 0.5rem; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .product-description strong { color: #111; font-weight: 600; }
      `}</style>
    </div>
  );
}