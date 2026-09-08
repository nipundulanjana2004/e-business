import React from 'react';
import { useShop } from '../context/ShopContext';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';

export const WishlistDrawer = () => {
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    wishlist,
    toggleWishlist,
    addToCart
  } = useShop();

  if (!isWishlistOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-500 fill-current" />
              <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-neutral-900">
                Wishlist ({wishlist.length})
              </h2>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-1.5 text-neutral-500 hover:text-black rounded-full hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {wishlist.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <Heart className="w-12 h-12 text-neutral-300 mx-auto" />
                <p className="text-sm text-neutral-500 font-medium">Your wishlist is currently empty.</p>
                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800"
                >
                  Discover Collection
                </button>
              </div>
            ) : (
              wishlist.map((item) => (
                <div
                  key={item.id || item._id}
                  className="flex space-x-3.5 pb-4 border-b border-neutral-100 items-center justify-between"
                >
                  <div className="w-16 h-20 bg-neutral-100 flex-shrink-0 overflow-hidden border border-neutral-200">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  <div className="flex-1 px-2">
                    <h4 className="text-xs font-bold text-neutral-900 truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs font-bold text-neutral-900 pt-0.5">
                      Rs. {Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        addToCart(item);
                        toggleWishlist(item);
                      }}
                      className="p-2 bg-black text-white hover:bg-neutral-800 text-xs font-bold"
                      title="Move to Shopping Bag"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleWishlist(item)}
                      className="p-2 text-neutral-400 hover:text-red-500"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-5 bg-neutral-50 border-t border-neutral-200">
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="w-full py-3 bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-black"
            >
              Continue Browsing
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
