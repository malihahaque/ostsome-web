import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useProducts } from '../hooks/useProducts';
import type { Product } from '../data/products';

const PAGE_SIZE = 24;

type ProductListingProps = {
  onSelectProduct: (product: Product) => void;
  initialSearch?: string;
};

export function ProductListing({ onSelectProduct, initialSearch = '' }: ProductListingProps) {
  const { products, loading, error } = useProducts();
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = [...products];
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const words = q.split(/\s+/).filter(Boolean);
      const qNoSpace = q.replace(/\s+/g, '');
      list = list.filter(p => {
        const haystack = `${p.title} ${p.vendor} ${p.category}`.toLowerCase();
        const wordsMatch = words.every(word => haystack.includes(word));
        const noSpaceMatch = qNoSpace.length >= 2 && haystack.replace(/\s+/g, '').includes(qNoSpace);
        return wordsMatch || noSpaceMatch;
      });
    }
    if (sortBy === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, searchQuery, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const topVendors = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => { counts[p.vendor] = (counts[p.vendor] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([v]) => v);
  }, [products]);

  function handleSearch(q: string) { setSearchQuery(q); setPage(1); }
  function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

  if (loading) return (
    <section className="py-10 md:py-14 bg-white min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#F16C10] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-neutral-400 font-medium">Loading products…</p>
      </div>
    </section>
  );

  if (error) return (
    <section className="py-10 md:py-14 bg-white min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-semibold text-black mb-2">Failed to load products</p>
        <p className="text-sm text-neutral-400">{error}</p>
      </div>
    </section>
  );

  return (
    <section className="py-10 md:py-14 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-[26px] md:text-4xl font-bold text-black uppercase">Shop All Products</h2>
            <p className="text-sm text-neutral-500 mt-1">
              {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
              {totalPages > 1 && ` · Page ${page} of ${totalPages}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search products…"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-[#F16C10] transition-colors"
              />
              {searchQuery && (
                <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black">
                  <X size={14} />
                </button>
              )}
            </div>
            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value as typeof sortBy); setPage(1); }}
              className="py-2.5 px-3 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-[#F16C10] text-neutral-700 bg-white"
            >
              <option value="default">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 border rounded-lg transition-colors ${showFilters ? 'bg-[#F16C10] border-[#F16C10] text-white' : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'}`}
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-8 p-5 bg-neutral-50 rounded-xl border border-neutral-100">
            <p className="text-xs font-bold text-black uppercase tracking-wide mb-3">Filter by Brand</p>
            <div className="flex flex-wrap gap-2">
              {topVendors.map(vendor => (
                <button
                  key={vendor}
                  onClick={() => handleSearch(searchQuery === vendor ? '' : vendor)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all border ${searchQuery === vendor ? 'bg-[#F16C10] border-[#F16C10] text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:border-[#F16C10] hover:text-[#F16C10]'}`}
                >
                  {vendor}
                </button>
              ))}
            </div>
          </div>
        )}

        {paginated.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {paginated.map(product => (
                <ProductCard key={product.handle} product={product} onClick={onSelectProduct} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => { setPage(p => Math.max(1, p - 1)); scrollToTop(); }}
                  disabled={page === 1}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border border-neutral-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:border-neutral-400 transition"
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
                    .reduce<(number | '...')[]>((acc, n, idx, arr) => {
                      if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push('...');
                      acc.push(n);
                      return acc;
                    }, [])
                    .map((n, i) =>
                      n === '...' ? (
                        <span key={`dots-${i}`} className="px-2 text-neutral-400">…</span>
                      ) : (
                        <button
                          key={n}
                          onClick={() => { setPage(n as number); scrollToTop(); }}
                          className={`w-10 h-10 text-sm font-semibold rounded-lg transition ${page === n ? 'bg-black text-white' : 'border border-neutral-200 text-neutral-600 hover:border-neutral-400'}`}
                        >
                          {n}
                        </button>
                      )
                    )}
                </div>
                <button
                  onClick={() => { setPage(p => Math.min(totalPages, p + 1)); scrollToTop(); }}
                  disabled={page === totalPages}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border border-neutral-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:border-neutral-400 transition"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-lg font-semibold text-black mb-2">No products found</p>
            <p className="text-sm text-neutral-500 mb-6">Try a different search or category.</p>
            <button
              onClick={() => handleSearch('')}
              className="px-6 py-2.5 bg-[#F16C10] text-white rounded-lg text-sm font-semibold hover:bg-[#d9610e] transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}