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

function CountdownUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center leading-none">
      <span
        className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500"
        style={{ fontSize: "clamp(0.8rem, 2.1vw, 2rem)" }}
      >
        {value}
      </span>
      <span
        className="text-gray-500 tracking-wide"
        style={{ fontSize: "clamp(0.35rem, 0.65vw, 0.65rem)" }}
      >
        {label}
      </span>
    </div>
  );
}

// Overlay pill that sits in the gap between the "THIS FRIDAY, [date] / 6PM–7PM
// ONLY" box and the "FOST MEMBERS UNLOCK IT" line on the Friday Flash Deal
// banner. Position/size is tuned specifically against that banner's 1800x600px
// layout — left: 50% + translateX(-50%) keeps it centered under the date box,
// top: 58% is the vertical slot between the two text blocks. Re-tune these
// percentages if the banner artwork's layout changes.
function FlashSaleCountdown() {
  const { state, days, hours, minutes } = useSaleState();

  const boxStyle = {
    left: "50%",
    top: "58%",
    width: "18%",
    height: "9%",
    transform: "translateX(-50%)",
  };

  return (
    <div
      className="absolute flex items-center justify-center pointer-events-none z-10 rounded-full border-2 border-[#D4537E]/40 bg-white/95 shadow-sm px-[1.5%]"
      style={boxStyle}
    >
      {state === "live" && (
        <span
          className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 tracking-wide animate-pulse"
          style={{ fontSize: "clamp(0.9rem, 2.4vw, 2.1rem)" }}
        >
          DEAL LIVE
        </span>
      )}

      {state === "ended" && (
        <div className="flex flex-col items-center justify-center text-center leading-tight">
          <span
            className="font-extrabold text-gray-800 tracking-wide"
            style={{ fontSize: "clamp(0.5rem, 1.15vw, 1rem)" }}
          >
            THANK YOU FOR PARTICIPATING
          </span>
          <span
            className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 tracking-wide"
            style={{ fontSize: "clamp(0.45rem, 1vw, 0.9rem)" }}
          >
            MORE DEALS COMING SOON
          </span>
        </div>
      )}

      {state === "countdown" && (
        <div className="flex items-center justify-center gap-[2%] w-full h-full">
          <Clock
            className="text-[#D4537E] shrink-0"
            style={{ width: "12%", height: "42%" }}
          />
          <div className="w-px h-2/3 bg-[#D4537E]/30" />
          <CountdownUnit value={days} label="DAYS" />
          <div className="w-px h-2/3 bg-[#D4537E]/30" />
          <CountdownUnit value={hours} label="HOURS" />
          <div className="w-px h-2/3 bg-[#D4537E]/30" />
          <CountdownUnit value={minutes} label="MINS" />
        </div>
      )}
    </div>
  );
}

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
  // FridayFlashDeals.tsx and FlashSaleCountdown, so the slide's visibility
  // never drifts out of sync with the rest of the site.
  const { state: saleState } = useSaleState();

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
              <FlashSaleCountdown />
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