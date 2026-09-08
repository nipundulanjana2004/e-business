import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { MessageCircle, Linkedin, Facebook, ArrowRight, Check } from 'lucide-react';
import { subscribeNewsletter } from '../services/api';

export const Footer = () => {
  const { setIsContactOpen, setIsPolicyOpen, setIsFaqOpen, addToast } = useShop();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      addToast('Please provide a valid email address', 'error');
      return;
    }
    await subscribeNewsletter(email);
    setSubscribed(true);
    addToast('Welcome! 15% discount coupon code FEAT2026 unlocked.', 'success');
  };

  return (
    <footer className="bg-[#101114] text-white pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-neutral-800/80">
          
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-serif font-black text-sm">
                DF
              </div>
              <span className="font-black text-xl tracking-tight text-white font-sans">
                DRESS<span className="font-light text-neutral-400">FEAT</span>
              </span>
            </div>
            <p className="text-neutral-400 text-xs sm:text-sm max-w-sm leading-relaxed">
              Modern luxury and oversized graphic apparel tailored with architectural poise. Crafted in limited batches for everyday confidence.
            </p>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="max-w-md ml-auto w-full space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400 block">
                Join the Vanguard
              </span>
              <p className="text-xs text-neutral-400">
                Receive private archive invitations and an instant 15% discount on your first order.
              </p>
              
              {subscribed ? (
                <div className="p-3 bg-neutral-900 border border-neutral-700 text-xs text-emerald-400 flex items-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>Subscribed! Use code <strong>FEAT2026</strong> at checkout.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-2.5 bg-neutral-900 border border-neutral-700 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-white"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        <div className="py-8 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-neutral-800/80">
          
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-white text-black flex items-center justify-center font-serif font-black text-xs">
              DF
            </div>
            <span className="font-black text-base tracking-tight text-white font-sans">
              DRESS<span className="font-light text-neutral-400">FEAT</span>
            </span>
          </div>

          <div className="flex items-center space-x-6 sm:space-x-8 text-xs font-semibold uppercase tracking-widest text-neutral-400">
            <button
              onClick={() => setIsContactOpen(true)}
              className="hover:text-white transition-colors"
            >
              Contact Us
            </button>
            <button
              onClick={() => setIsPolicyOpen(true)}
              className="hover:text-white transition-colors"
            >
              Delivery & Return Policy
            </button>
            <button
              onClick={() => setIsFaqOpen(true)}
              className="hover:text-white transition-colors"
            >
              FAQ
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="https://wa.me/+94770561399"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-neutral-300 hover:text-emerald-400 hover:border-emerald-400 transition-colors"
              title="WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-neutral-300 hover:text-blue-400 hover:border-blue-400 transition-colors"
              title="LinkedIn"
            >
              <Linkedin className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-neutral-300 hover:text-blue-500 hover:border-blue-500 transition-colors"
              title="Facebook"
            >
              <Facebook className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

        <div className="pt-8 text-center text-[11px] text-neutral-500 tracking-wider">
          <p>© 2026 DRESSFEAT Atelier. All rights reserved. Designed for the modern vanguard.</p>
        </div>

      </div>
    </footer>
  );
};
