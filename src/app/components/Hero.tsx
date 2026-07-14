import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import heroBanner from "../../imports/1-1.png";
import banner1 from "../../imports/2-1.png";
import banner2 from "../../imports/3-1.png";
import banner3 from "../../imports/5.png";
import banner4 from "../../imports/4-1.png";
// TODO: replace with your actual exported 1800x600 flash sale banner filename
import flashSaleBanner from "../../imports/Friday Flash Deal.png";

const banners = [flashSaleBanner, heroBanner, banner1, banner2, banner3, banner4];

// Flash sale window: 17 July 2026, 7:00–8:00 PM Singapore Time (UTC+8)
const SALE_START = new Date("2026-07-17T19:00:00+08:00").getTime();
const SALE_END = new Date("2026-07-17T20:00:00+08:00").getTime();

type SaleState = "countdown" | "live" | "ended";

function useSaleState() {
  const getState = (): { state: SaleState; timeLeft: number } => {
    const now = Date.now();
    if (now < SALE_START) return { state: "countdown", timeLeft: SALE_START - now };
    if (now < SALE_END) return { state: "live", timeLeft: SALE_END - now };
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
        style={{ fontSize: "clamp(0.8rem, 2.1vw, 2rem)" }}
      >
        {value}
      </span>
      <span
        className="text-white/80 tracking-wide"
        style={{ fontSize: "clamp(0.35rem, 0.65vw, 0.65rem)" }}
      >
        {label}
      </span>
    </div>
  );
}

// Overlay that sits on top of the static clock graphic in the flash sale banner.
// Positioned by percentage so it scales with the responsive banner width/height.
// Fine-tune the left/top/width/height values once you see it live against the real asset.
function FlashSaleCountdown() {
  const { state, days, hours, minutes } = useSaleState();

  const boxStyle = {
    left: "39%",
    top: "29%",
    width: "23%",
    height: "10%",
  };

  if (state === "live") {
    return (
      <div
        className="absolute flex items-center justify-center pointer-events-none z-10"
        style={boxStyle}
      >
        <span
          className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 tracking-wide animate-pulse"
          style={{ fontSize: "clamp(0.9rem, 2.4vw, 2.1rem)" }}
        >
          SALE LIVE
        </span>
      </div>
    );
  }

  if (state === "ended") {
    return (
      <div
        className="absolute flex items-center justify-center pointer-events-none z-10"
        style={boxStyle}
      >
        <span
          className="font-extrabold text-white/90 tracking-wide"
          style={{ fontSize: "clamp(0.65rem, 1.5vw, 1.3rem)" }}
        >
          NEW DEALS COMING SOON
        </span>
      </div>
    );
  }

  return (
    <div
      className="absolute flex items-center justify-center gap-[4%] pointer-events-none z-10"
      style={boxStyle}
    >
      <CountdownUnit value={days} label="DAYS" />
      <div className="w-px h-full bg-pink-500/40" />
      <CountdownUnit value={hours} label="HOURS" />
      <div className="w-px h-full bg-pink-500/40" />
      <CountdownUnit value={minutes} label="MINS" />
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