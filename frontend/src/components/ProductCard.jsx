import React from 'react';
import { useShop } from '../context/ShopContext';
import { Heart, Eye, ShoppingBag } from 'lucide-react';

export const ProductCard = ({ product }) => {
  const {
    setSelectedProduct,
    addToCart,
    toggleWishlist,
    isInWishlist
  } = useShop();

  const isFavorite = isInWishlist(product.id || product._id);
  const stock = typeof product.stock === 'number' ? product.stock : 10;
  const isOutOfStock = stock <= 0;

  return (
    <div className="group flex flex-col bg-white transition-all duration-300">
      <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden border border-neutral-200/80">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter contrast-[1.02] ${isOutOfStock ? 'grayscale opacity-75' : ''}`}
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col space-y-1 z-10">
          {isOutOfStock ? (
            <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-bold uppercase tracking-widest">
              Sold Out
            </span>
          ) : product.isNewArrival ? (
            <span className="px-2 py-0.5 bg-black text-white text-[9px] font-bold uppercase tracking-widest">
              New
            </span>
          ) : null}

          {stock > 0 && stock <= 5 && (
            <span className="px-2 py-0.5 bg-amber-600 text-white text-[9px] font-bold uppercase tracking-widest">
              Only {stock} Left
            </span>
          )}

          {product.originalPrice && product.originalPrice > product.price && (
            <span className="px-2 py-0.5 bg-[#a34f35] text-white text-[9px] font-bold uppercase tracking-widest">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isFavorite
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-white/90 text-neutral-800 hover:bg-black hover:text-white backdrop-blur-sm'
          }`}
          title={isFavorite ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between gap-2">
          <button
            onClick={() => setSelectedProduct(product)}
            className="flex-1 py-2 bg-white/95 text-black hover:bg-white text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
          {!isOutOfStock && (
            <button
              onClick={() => addToCart(product)}
              className="p-2 bg-black text-white hover:bg-neutral-800 text-[11px] font-bold transition-colors"
              title="Add directly to Bag"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="pt-3 pb-2 flex flex-col justify-between flex-1">
        <div className="flex items-baseline justify-between">
          <h3
            onClick={() => setSelectedProduct(product)}
            className="text-xs sm:text-sm font-semibold text-neutral-900 tracking-tight cursor-pointer hover:underline truncate"
          >
            {product.name}
          </h3>
          <div className="text-xs sm:text-sm font-bold text-neutral-900 ml-2 whitespace-nowrap">
            Rs. {Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="flex justify-between items-center pt-0.5">
          {product.subtitle && (
            <p className="text-[10px] text-neutral-500 truncate flex-1">
              {product.subtitle}
            </p>
          )}
          <span className={`text-[9px] font-bold uppercase ml-2 ${stock <= 5 && stock > 0 ? 'text-amber-600' : 'text-neutral-400'}`}>
            {stock > 0 ? `${stock} in stock` : 'Out of stock'}
          </span>
        </div>
      </div>
    </div>
  );
};
