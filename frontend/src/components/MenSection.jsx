import React from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';
import { ArrowRight } from 'lucide-react';

export const MenSection = () => {
  const { products, setActiveTab } = useShop();

  const menProducts = products.filter(p => p.category === 'men').slice(0, 4);

  return (
    <section id="men-section" className="py-12 sm:py-16 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-neutral-200">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 font-sans">
            Men
          </h2>

          <button
            onClick={() => {
              setActiveTab('shop');
              window.scrollTo({ top: 600, behavior: 'smooth' });
            }}
            className="text-xs font-bold uppercase tracking-widest text-neutral-900 hover:text-neutral-600 transition-colors flex items-center group"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {menProducts.map((product) => (
            <ProductCard key={product.id || product._id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
};
