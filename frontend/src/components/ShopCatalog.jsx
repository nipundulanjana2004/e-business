import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';
import { X, SlidersHorizontal } from 'lucide-react';

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const ALL_CATEGORIES = ['all', 'women', 'men'];

export const ShopCatalog = () => {
  const { products, setActiveTab } = useShop();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [maxPrice, setMaxPrice] = useState(10000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const toggleSize = (sz) =>
    setSelectedSizes(prev =>
      prev.includes(sz) ? prev.filter(s => s !== sz) : [...prev, sz]
    );

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedSizes([]);
    setSortBy('newest');
    setMaxPrice(10000);
    setInStockOnly(false);
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedSizes.length > 0 ||
    sortBy !== 'newest' ||
    maxPrice < 10000 ||
    inStockOnly;

  const filteredProducts = useMemo(() => {
    let result = [...(products || [])];

    if (selectedCategory !== 'all')
      result = result.filter(p => p.category === selectedCategory);

    if (selectedSizes.length > 0)
      result = result.filter(p =>
        selectedSizes.some(sz => (p.sizes || []).includes(sz))
      );

    result = result.filter(p => Number(p.price) <= maxPrice);

    if (inStockOnly)
      result = result.filter(p => (Number(p.stock) || 0) > 0);

    switch (sortBy) {
      case 'price-asc':   result.sort((a, b) => a.price - b.price); break;
      case 'price-desc':  result.sort((a, b) => b.price - a.price); break;
      case 'rating':      result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'stock':       result.sort((a, b) => (Number(b.stock) || 0) - (Number(a.stock) || 0)); break;
      default: break;
    }

    return result;
  }, [products, selectedCategory, selectedSizes, sortBy, maxPrice, inStockOnly]);

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Page Header Bar */}
      <div className="bg-white border-b border-neutral-200 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-black uppercase tracking-widest text-neutral-900">
            Shop All Collection
          </h1>
          <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">
            {filteredProducts.length} of {products.length} garments
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-[10px] font-bold uppercase tracking-wider text-red-600 border border-red-200 px-2.5 py-1 hover:bg-red-50 flex items-center space-x-1"
            >
              <X className="w-3 h-3" />
              <span>Clear Filters</span>
            </button>
          )}
          <button
            onClick={() => setShowFilters(v => !v)}
            className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider px-3 py-2 border border-neutral-300 hover:border-black"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
          </button>
          {/* Back to Home */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider px-3 py-2 bg-neutral-900 text-white hover:bg-black"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close Shop</span>
          </button>
        </div>
      </div>

      {/* Body: Sidebar + Grid */}
      <div className="flex">
        {/* Sidebar Filters */}
        {showFilters && (
          <aside className="w-52 flex-shrink-0 sticky top-0 self-start bg-white border-r border-neutral-200 p-5 min-h-screen space-y-6">
            {/* Category */}
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-3">Category</h4>
              <div className="space-y-1">
                {ALL_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-2 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                      selectedCategory === cat ? 'bg-black text-white' : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    {cat === 'all' ? 'All Items' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Size — Multi Select */}
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-3">
                Size
                {selectedSizes.length > 0 && (
                  <span className="ml-1.5 text-black">({selectedSizes.length} selected)</span>
                )}
              </h4>
              <div className="grid grid-cols-3 gap-1.5">
                {ALL_SIZES.map(sz => {
                  const active = selectedSizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      onClick={() => toggleSize(sz)}
                      className={`py-1.5 text-xs font-extrabold border transition-all ${
                        active
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-neutral-700 border-neutral-300 hover:border-black'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
              {selectedSizes.length > 0 && (
                <button
                  onClick={() => setSelectedSizes([])}
                  className="mt-2 text-[10px] text-red-500 hover:underline font-bold"
                >
                  Clear sizes
                </button>
              )}
            </div>

            {/* Price Range */}
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-3">Max Price</h4>
              <input
                type="range" min={500} max={10000} step={250}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-black"
              />
              <div className="flex justify-between text-[10px] font-bold text-neutral-600 mt-1">
                <span>Rs. 500</span>
                <span className="text-black">Up to Rs. {maxPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* In-Stock Toggle */}
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-3">Availability</h4>
              <label className="flex items-center space-x-2 cursor-pointer">
                <div
                  onClick={() => setInStockOnly(v => !v)}
                  className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${inStockOnly ? 'bg-black' : 'bg-neutral-200'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${inStockOnly ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
                <span className="text-xs font-bold text-neutral-700">In Stock Only</span>
              </label>
            </div>

            {/* Sort */}
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-3">Sort By</h4>
              <div className="space-y-1">
                {[
                  { value: 'newest',     label: 'Newest First' },
                  { value: 'price-asc',  label: 'Price: Low to High' },
                  { value: 'price-desc', label: 'Price: High to Low' },
                  { value: 'rating',     label: 'Top Rated' },
                  { value: 'stock',      label: 'Most In Stock' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={`w-full text-left px-2 py-1.5 text-xs font-bold transition-all ${
                      sortBy === opt.value ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Product Grid */}
        <main className="flex-1 p-6 sm:p-8">
          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 text-[10px] font-bold bg-neutral-900 text-white uppercase">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('all')} className="ml-1"><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedSizes.map(sz => (
                <span key={sz} className="inline-flex items-center px-2 py-1 text-[10px] font-bold bg-neutral-900 text-white uppercase">
                  Size {sz}
                  <button onClick={() => toggleSize(sz)} className="ml-1"><X className="w-3 h-3" /></button>
                </span>
              ))}
              {maxPrice < 10000 && (
                <span className="inline-flex items-center px-2 py-1 text-[10px] font-bold bg-neutral-900 text-white uppercase">
                  Max Rs. {maxPrice.toLocaleString('en-IN')}
                  <button onClick={() => setMaxPrice(10000)} className="ml-1"><X className="w-3 h-3" /></button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center px-2 py-1 text-[10px] font-bold bg-emerald-700 text-white uppercase">
                  In Stock Only
                  <button onClick={() => setInStockOnly(false)} className="ml-1"><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-neutral-400 text-sm font-bold uppercase tracking-wider mb-2">No garments found</p>
              <p className="text-neutral-400 text-xs mb-4">Try adjusting or clearing your filters</p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
