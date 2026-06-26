import { Briefcase, BookOpen, Headphones, Gift, Camera } from 'lucide-react';
import captureLifeImg from '../../imports/image-1.png';
import workAnywhereImg from '../../imports/image.png';
import gamerImg from '../../imports/image-2.png';
import studyImg from '../../imports/image-4.png';
import giftImg from '../../imports/image-5.png';

const lifestyles = [
  {
    id: 1,
    title: 'Work Anywhere',
    description: 'Your office. Your rules.',
    icon: Briefcase,
    image: workAnywhereImg,
    products: '18 products',
    navCategory: 'Desk Setup',
  },
  {
    id: 2,
    title: 'Capture Life',
    description: 'Every moment. Every memory. Print it, keep it.',
    icon: Camera,
    image: captureLifeImg,
    products: '10 products',
    navCategory: 'Mobile Creator',
  },
  {
    id: 3,
    title: 'Study Mode',
    description: 'Focus in. Block out the noise.',
    icon: BookOpen,
    image: studyImg,
    products: '9 products',
    navCategory: 'Mobile Audio',
  },
  {
    id: 4,
    title: 'Game Face',
    description: 'Your setup. Your edge.',
    icon: Headphones,
    image: gamerImg,
    products: '15 products',
    navCategory: 'Gaming',
  },
  {
    id: 5,
    title: 'Their Best Christmas Ever',
    description: 'The tech gifts that light up the room.',
    icon: Gift,
    image: giftImg,
    products: '22 products',
    navCategory: null, // spans multiple categories — routes to All Products instead
  },
];

type Props = {
  onNavToCategory?: (category: string) => void;
  onNavToProducts?: () => void;
};

export function DiscoveryByLifestyle({ onNavToCategory, onNavToProducts }: Props) {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6 md:mb-10 text-left md:text-center">
          <h2 className="text-[26px] md:text-4xl font-bold text-black mb-2">Discovery by Lifestyle</h2>
          <p className="text-[14px] md:text-base text-neutral-600">Your setup. Your rules. Your vibe.</p>
        </div>

        {/* Top 2 large cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
          {lifestyles.slice(0, 2).map((lifestyle) => {
            const Icon = lifestyle.icon;
            return (
              <div
                key={lifestyle.id}
                onClick={() => lifestyle.navCategory ? onNavToCategory?.(lifestyle.navCategory) : onNavToProducts?.()}
                className="group relative overflow-hidden rounded-xl cursor-pointer"
              >
                <div className="relative h-[300px] md:h-[420px] bg-neutral-100 overflow-hidden">
                  <img
                    src={lifestyle.image}
                    alt={lifestyle.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.objectFit = 'contain';
                      (e.target as HTMLImageElement).style.padding = '2rem';
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />
                </div>
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 group-hover:bg-[#F16C10] transition">
                    <Icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">{lifestyle.title}</h3>
                  <p className="text-white/90 text-sm mb-3">{lifestyle.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-xs">{lifestyle.products}</span>
                    <span className="text-white text-sm font-medium group-hover:translate-x-1 transition">Explore →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom 3 smaller cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {lifestyles.slice(2).map((lifestyle) => {
            const Icon = lifestyle.icon;
            return (
              <div
                key={lifestyle.id}
                onClick={() => lifestyle.navCategory ? onNavToCategory?.(lifestyle.navCategory) : onNavToProducts?.()}
                className="group relative overflow-hidden rounded-xl cursor-pointer"
              >
                <div className="relative h-[220px] md:h-[260px] bg-neutral-100 overflow-hidden">
                  <img
                    src={lifestyle.image}
                    alt={lifestyle.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.objectFit = 'contain';
                      (e.target as HTMLImageElement).style.padding = '2rem';
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />
                </div>
                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-3 group-hover:bg-[#F16C10] transition">
                    <Icon className="text-white" size={20} />
                  </div>
                  <h3 className="text-white text-lg font-bold mb-1">{lifestyle.title}</h3>
                  <p className="text-white/90 text-xs mb-2">{lifestyle.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-xs">{lifestyle.products}</span>
                    <span className="text-white text-sm font-medium group-hover:translate-x-1 transition">Explore →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}