import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import heroBanner from "../../imports/1-1.png";
import banner1 from "../../imports/2-1.png";
import banner2 from "../../imports/3-1.png";
import banner3 from "../../imports/5.png";
import banner4 from "../../imports/4-1.png";
// TODO: replace with your actual exported 1800x600 flash sale banner filename
import flashSaleBanner from "../../imports/Friday Flash Deal.png";
import { FLASH_SALE_START, FLASH_SALE_END } from "../data/flashSale";

const banners = [flashSaleBanner, heroBanner, banner1, banner2, banner3, banner4];

type SaleState = "countdown" | "live" | "ended";

function useSaleState() {
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

function CountdownUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center leading-none">
      <span
        className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500"
        style={{ fontSize: "clamp(0.9rem, 2.3vw, 2.2rem)" }}
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

// Fully opaque badge that covers the static clock graphic baked into the banner
// image, and rebuilds the same pill/border/clock-icon look in code so the live
// numbers never overlap or double-render against the exported asset.
//
// NOTE: "bg-[#0a0e1a]" is an estimate of the banner's dark navy background.
// Use the color picker on the real exported PNG and swap in the exact hex so
// the badge blends in seamlessly rather than showing as a visible box.
// Badge position/size is tuned against the 1800x600 "Your shot at Looki L1
// and Hohem MT3 Pro" banner, sitting in the gap between the "FOST members
// unlock it..." subtext and the "BECOME A FOST MEMBER" button — the same
// spot marked "insert live countdown timer here" in the exported artwork.
// Colors switched from the old dark-navy/pink-border pill to a light pill
// that sits naturally on the new cream/light banner background, using the
// same coral-to-orange gradient as the "$2XX" / "$6XX" lock tags so the
// countdown reads as part of the same design system as the rest of the art.
function FlashSaleCountdown() {
  const { state, days, hours, minutes } = useSaleState();

  const boxStyle = {
    left: "50%",
    top: "58%",
    width: "24%",
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

  // Each banner's click destination, in the same order as `banners`
  const bannerActions = [
    onNavToFostSignup,
    onNavToAllProducts,
    onNavToHeshAnc,
    onNavToFostSignup,
    onNavToClearance,
    onNavToLooki,
  ];
  const bannerLabels = [
    "FOST Flash Sale — Join FOST",
    "All Products",
    "Skullcandy Hesh ANC",
    "Join FOST",
    "Clearance",
    "Looki L1",
  ];

  const goToSlide = (index: number) => setCurrentSlide(index);
  const goToPrevious = () =>
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  const goToNext = () =>
    setCurrentSlide((prev) => (prev + 1) % banners.length);

  // Auto-cycle every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative bg-neutral-900 group w-full">
      <div className="relative w-full aspect-[3/1] overflow-hidden">
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentSlide
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <button
              onClick={bannerActions[index]}
              className="block w-full h-full cursor-pointer relative"
              aria-label={`Go to ${bannerLabels[index]}`}
            >
              <ImageWithFallback
                src={banner}
                alt={`Hero banner ${index + 1}`}
                className="w-full h-full object-cover object-center"
              />
              {index === 0 && <FlashSaleCountdown />}
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
        {banners.map((_, index) => (
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