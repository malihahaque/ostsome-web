import { ChevronLeft } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useProducts } from '../hooks/useProducts';
import type { Product } from '../data/products';

type BrandDetailProps = {
  brand: string;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
};

const normalize = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');

export function BrandDetail({ brand, onBack, onSelectProduct }: BrandDetailProps) {
  const { products, loading } = useProducts();
  const brandProducts = products.filter(p => normalize(p.vendor) === normalize(brand));

  return (
    <section className="py-10 md:py-14 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-[#F16C10] transition-colors mb-8"
        >
          <ChevronLeft size={16} /> All Brands
        </button>

        <div className="mb-8">
          <h2 className="text-[26px] md:text-4xl font-bold text-black uppercase mb-1">{brand}</h2>
          <p className="text-xs text-neutral-400">{loading ? 'Loading…' : `${brandProducts.length} products`}</p>
        </div>

        <div className="border-t border-neutral-100 mb-8" />

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-4 border-[#F16C10] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : brandProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {brandProducts.map(product => (
              <ProductCard key={product.handle} product={product} onClick={onSelectProduct} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">📦</p>
            <p className="text-lg font-semibold text-black mb-2">No products found</p>
            <p className="text-sm text-neutral-500">Check back soon.</p>
          </div>
        )}
      </div>
    </section>
  );
}