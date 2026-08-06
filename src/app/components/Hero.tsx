import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useSaleState } from "../data/flashSale";
import flashDealBanner from "../../imports/Friday Flash Deal.png";
import heroBanner from "../../imports/1-1.png";
import banner1 from "../../imports/2-1.png";
import banner2 from "../../imports/3-1.png";
import banner3 from "../../imports/5.png";
import banner4 from "../../imports/4-1.png";

const imageBanners = [heroBanner, banner1, banner2, banner3, banner4];

const imageBannerLabels = [
  "All Products",
  "Skullcandy Hesh ANC",
  "Join FOST",
  "Clearance",
  "Looki L1",
];

type HeroProps = {
  onNavToAllProducts: () => void;
  onNavToHeshAnc: () => void;
  onNavToFostSignup: () => void;
  onNavToClearance: () => void;
  onNavToLooki: () => void;
};

export function Hero({
  onNavToAllProducts,
  onNavToHeshAnc,
  onNavToFostSignup,
  onNavToClearance,
  onNavToLooki,
}: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Same 3-state clock (countdown -> live -> ended) that drives
  // FridayFlashDeals.tsx, so the Hero slide and the homepage section never
  // drift out of sync with each other.
  const { state: saleState, days, hours, minutes } = useSaleState();

  // The flash-deal banner only appears while there's something to say — hide
  // it entirely once the sale has ended, rather than showing a stale/empty
  // promo slide in the carousel.
  const showFlashSlide = saleState === "countdown" || saleState === "live";

  // Each banner's click destination, in the same order as `imageBanners`
  const imageBannerActions = [
    onNavToAllProducts,
    onNavToHeshAnc,
    onNavToFostSignup,
    onNavToClearance,
    onNavToLooki,
  ];

  // Flash banner is always slide 0 (when shown); the 5 image banners shift
  // down by one index to make room for it.
  const flashSlideIndex = 0;
  const imageSlideOffset = showFlashSlide ? 1 : 0;
  const slideCount = imageBanners.length + (showFlashSlide ? 1 : 0);

  // If the sale ends while the flash slide happens to be showing, drop back
  // to slide 0 instead of pointing at a slide index that no longer exists.
  useEffect(() => {
    if (currentSlide >= slideCount) {
      setCurrentSlide(0);
    }
  }, [slideCount, currentSlide]);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const goToPrevious = () =>
    setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount);
  const goToNext = () => setCurrentSlide((prev) => (prev + 1) % slideCount);

  // Auto-cycle every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, 8000);
    return () => clearInterval(timer);
  }, [slideCount]);

  return (
    <section className="relative bg-neutral-900 group w-full">
      <div className="relative w-full aspect-[3/1] overflow-hidden">
        {/* Friday Flash Deal banner — the real designed asset, slide 0.
            Only rendered while showFlashSlide is true (countdown or live
            states); a live countdown badge is overlaid on top of it via
            useSaleState(), same clock FridayFlashDeals.tsx uses below it.
            NOTE: the date printed inside the PNG itself (e.g. "7th August")
            is baked into the image and does NOT update automatically —
            whoever preps the banner each week still needs to swap in a
            fresh Friday Flash Deal.png with the correct date before this
            goes live. This overlay only handles the live countdown numbers. */}
        {showFlashSlide && (
          <div
            className={`absolute inset-0 transition-opacity duration-700 ${
              currentSlide === flashSlideIndex
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <button
              onClick={onNavToFostSignup}
              className="block w-full h-full cursor-pointer relative"
              aria-label="Join FOST for Friday Flash Deals"
            >
              <ImageWithFallback
                src={flashDealBanner}
                alt="Friday Flash Deal — up to 70% off, FOST members only"
                className="w-full h-full object-cover object-center"
              />

              {/* Live countdown / live-now badge overlaid on the banner.
                  Positioned bottom-left by default — adjust the className
                  below if it should sit somewhere else on the banner. */}
              <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8">
                {saleState === "countdown" && (
                  <div className="flex items-center gap-2 md:gap-3 bg-black/60 backdrop-blur-sm rounded-xl px-3 py-1.5 md:px-4 md:py-2">
                    <Clock size={14} className="text-white/80" />
                    {[
                      { value: days, label: "D" },
                      { value: hours, label: "H" },
                      { value: minutes, label: "M" },
                    ].map((unit, i) => (
                      <div key={unit.label} className="flex items-center gap-2 md:gap-3">
                        {i > 0 && <span className="text-white/40 font-bold">:</span>}
                        <div className="flex items-baseline gap-0.5 text-white">
                          <span className="text-sm md:text-lg font-extrabold">{unit.value}</span>
                          <span className="text-[9px] md:text-[10px] text-white/70">{unit.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {saleState === "live" && (
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-xl px-4 py-1.5 md:py-2 font-extrabold text-sm md:text-base text-white animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-orange-400" />
                    DEAL LIVE NOW
                  </div>
                )}
              </div>
            </button>
          </div>
        )}

        {imageBanners.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index + imageSlideOffset === currentSlide
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <button
              onClick={imageBannerActions[index]}
              className="block w-full h-full cursor-pointer relative"
              aria-label={`Go to ${imageBannerLabels[index]}`}
            >
              <ImageWithFallback
                src={banner}
                alt={`Hero banner ${index + 1}`}
                className="w-full h-full object-cover object-center"
              />
            </button>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition md:opacity-0 md:group-hover:opacity-100"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition md:opacity-0 md:group-hover:opacity-100"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2">
        {Array.from({ length: slideCount }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="h-11 min-w-[44px] flex items-center justify-center"
            aria-label={`Go to slide ${index + 1}`}
          >
            <span
              className={`block h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-white w-8"
                  : "bg-white/50 w-2 hover:bg-white/75"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}