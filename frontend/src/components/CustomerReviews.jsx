import React from 'react';
import { useShop } from '../context/ShopContext';
import { Star, CheckCircle2 } from 'lucide-react';

export const CustomerReviews = () => {
  const { reviews } = useShop();

  return (
    <section className="py-16 sm:py-20 bg-[#f7f5f0] border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 font-sans">
            Loved by our customers
          </h2>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 pt-2 font-medium">
            Over 20,000 discerning patrons dressed worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-6 border border-neutral-200/90 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center space-x-1 text-neutral-900 mb-4">
                  {[...Array(rev.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-black text-black" />
                  ))}
                </div>

                <p className="text-neutral-700 text-xs sm:text-[13px] leading-relaxed italic mb-6">
                  &ldquo;{rev.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex flex-col">
                <span className="text-xs font-bold text-neutral-900">
                  {rev.author}
                </span>
                <span className="text-[10px] text-neutral-400 font-medium flex items-center mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 mr-1 inline" />
                  {rev.badge || 'Verified Buyer'}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
