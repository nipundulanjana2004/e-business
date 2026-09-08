import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Search, ArrowRight } from 'lucide-react';

export const SearchModal = () => {
  const { isSearchOpen, setIsSearchOpen, products, setSelectedProduct } = useShop();
  const [query, setQuery] = useState('');

  if (!isSearchOpen) return null;

  const filtered = query.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(query.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
      <div className="relative bg-white w-full max-w-2xl border border-neutral-300 shadow-2xl overflow-hidden">
        
        <div className="p-4 border-b border-neutral-200 flex items-center space-x-3">
          <Search className="w-5 h-5 text-neutral-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Silk Utility Shirt, Cashmere Knit, Linen..."
            className="flex-1 text-sm font-medium focus:outline-none placeholder:text-neutral-400"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 text-neutral-400 hover:text-black rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-5 py-2.5 bg-neutral-50 border-b border-neutral-100 flex items-center space-x-2 text-[11px] overflow-x-auto">
          <span className="text-neutral-400 font-bold uppercase">Trending:</span>
          {['Silk Shirt', 'Trench', 'Pleated Pant', 'Boots', 'Knit Polo'].map((k) => (
            <button
              key={k}
              onClick={() => setQuery(k)}
              className="px-2.5 py-1 bg-white border border-neutral-200 rounded-none hover:border-black font-medium text-neutral-700"
            >
              {k}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-2">
          {query.trim() === '' ? (
            <p className="text-center text-xs text-neutral-400 py-8">
              Type to explore the full DRESSFEAT MMXXVI archive.
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-xs text-neutral-500 py-8">
              No matching apparel found for "{query}".
            </p>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id || item._id}
                onClick={() => {
                  setSelectedProduct(item);
                  setIsSearchOpen(false);
                }}
                className="flex items-center justify-between p-2.5 hover:bg-neutral-100 cursor-pointer transition-colors border border-transparent hover:border-neutral-200"
              >
                <div className="flex items-center space-x-3">
                  <img src={item.image} alt="" className="w-10 h-12 object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">{item.name}</h4>
                    <p className="text-[10px] text-neutral-500">{item.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-neutral-900">
                    Rs. {Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <ArrowRight className="w-4 h-4 text-neutral-400" />
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
