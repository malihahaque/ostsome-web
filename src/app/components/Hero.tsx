import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import heroBanner from "../../imports/1-1.png";
import banner1 from "../../imports/2-1.png";
import banner2 from "../../imports/3-1.png";
import banner3 from "../../imports/5.png";
import banner4 from "../../imports/4-1.png";

const banners = [heroBanner, banner1, banner2, banner3, banner4];

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
    onNavToAllProducts,
    onNavToHeshAnc,
    onNavToFostSignup,
    onNavToClearance,
    onNavToLooki,
  ];
  const bannerLabels = [
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
      <div className="relative w-full aspect-[2/1] sm:aspect-[3/1] overflow-hidden">
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
              className="block w-full h-full cursor-pointer"
              aria-label={`Go to ${bannerLabels[index]}`}
            >
              <ImageWithFallback
                src={banner}
                alt={`Hero banner ${index + 1}`}
                className="w-full h-full object-cover object-left sm:object-center"
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