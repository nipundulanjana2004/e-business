import React from 'react';
import { useShop } from '../context/ShopContext';
import { ArrowRight, Sparkles } from 'lucide-react';

export const Hero = () => {
  const { setActiveTab } = useShop();

  return (
    <div className="relative bg-[#0d0e11] text-white overflow-hidden border-b border-neutral-800">
      <div className="absolute inset-0 bg-gradient-to-r from-black via-[#111216] to-[#1c1d24] opacity-95" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-neutral-800/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-neutral-700/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[460px] sm:min-h-[520px] py-12 lg:py-16">
          
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6 sm:space-y-8">
            <div className="inline-flex items-center space-x-2">
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em]">
                NEW COLLECTION 2026
              </span>
              <span className="flex items-center text-neutral-400 text-[11px] font-medium tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-400 mr-1" /> Limited Atelier Edition
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight uppercase leading-[0.95] text-white font-sans">
                WEAR<br />
                YOUR<br />
                STYLE
              </h1>
              <p className="text-neutral-400 text-sm sm:text-base lg:text-lg max-w-xl font-normal leading-relaxed pt-2">
                Premium oversized &amp; graphic apparel crafted for everyday confidence.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => {
                  setActiveTab('shop');
                  window.scrollTo({ top: 600, behavior: 'smooth' });
                }}
                className="px-8 py-3.5 bg-white text-black font-bold text-xs uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all shadow-lg flex items-center group"
              >
                <span>Shop Collection</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('men-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3.5 bg-transparent border border-neutral-600 text-white font-semibold text-xs uppercase tracking-[0.18em] hover:bg-neutral-800/80 hover:border-white transition-all"
              >
                Explore Men
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('women-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3.5 bg-transparent border border-neutral-600 text-white font-semibold text-xs uppercase tracking-[0.18em] hover:bg-neutral-800/80 hover:border-white transition-all"
              >
                Explore Women
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-800/80 max-w-md text-neutral-400 text-[11px]">
              <div>
                <span className="block font-bold text-white text-xs">100% ORGANIC</span>
                Heavyweight Cotton
              </div>
              <div>
                <span className="block font-bold text-white text-xs">BESPOKE</span>
                Italian Tailoring
              </div>
              <div>
                <span className="block font-bold text-white text-xs">GLOBAL</span>
                Express Delivery
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex justify-center items-center">
            <div className="relative w-full max-w-md aspect-[4/5] bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80"
                alt="DRESSFEAT MMXXVI Graphic Back Model"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-95 contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-black/75 backdrop-blur-md border border-neutral-700/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block">
                    Atelier Exclusive
                  </span>
                  <h4 className="text-sm font-bold text-white tracking-wide">
                    Wear Your Style MMXXVI Tee
                  </h4>
                  <p className="text-xs text-neutral-300 font-semibold">
                    Rs. 2,800.00
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('shop');
                    window.scrollTo({ top: 600, behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 bg-white text-black font-bold text-[10px] uppercase tracking-wider hover:bg-neutral-200"
                >
                  Quick View
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
