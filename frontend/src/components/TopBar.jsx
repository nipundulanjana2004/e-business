import React from 'react';
import { useShop } from '../context/ShopContext';
import { MessageCircle, Linkedin, Facebook } from 'lucide-react';

export const TopBar = () => {
  const { setIsContactOpen, setIsPolicyOpen, setIsFaqOpen } = useShop();

  return (
    <div className="bg-[#111113] text-neutral-300 text-[11px] font-medium tracking-wider border-b border-neutral-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between">
        {/* Left: Social Icons */}
        <div className="flex items-center space-x-2.5">
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn"
            className="w-5 h-5 rounded-full bg-[#0077b5] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
          >
            <Linkedin className="w-3 h-3 fill-current" />
          </a>

          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Facebook"
            className="w-5 h-5 rounded-full bg-[#1877f2] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
          >
            <Facebook className="w-3 h-3 fill-current" />
          </a>

          <a
            href="https://wa.me/1234567890"
            target="_blank"
            rel="noopener noreferrer"
            title="WhatsApp Concierge"
            className="w-5 h-5 rounded-full bg-[#25d366] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-3 h-3 fill-current" />
          </a>
        </div>

        {/* Right: Quick Links */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setIsContactOpen(true)}
            className="hover:text-white transition-colors uppercase tracking-widest text-[10px]"
          >
            Contact Us
          </button>
          <button
            onClick={() => setIsPolicyOpen(true)}
            className="hover:text-white transition-colors uppercase tracking-widest text-[10px]"
          >
            Delivery & Return Policy
          </button>
          <button
            onClick={() => setIsFaqOpen(true)}
            className="hover:text-white transition-colors uppercase tracking-widest text-[10px]"
          >
            FAQ
          </button>
        </div>
      </div>
    </div>
  );
};
