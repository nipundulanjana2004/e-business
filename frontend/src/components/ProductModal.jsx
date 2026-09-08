import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Heart, ShoppingBag, Check, ShieldCheck, Truck, RotateCcw, Star, AlertTriangle } from 'lucide-react';

export const ProductModal = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    addToCart,
    toggleWishlist,
    isInWishlist
  } = useShop();

  if (!selectedProduct) return null;

  const [selectedImage, setSelectedImage] = useState(selectedProduct.image);
  const [selectedSize, setSelectedSize] = useState(
    selectedProduct.sizes ? selectedProduct.sizes[0] : 'M'
  );
  const [selectedColor, setSelectedColor] = useState(
    selectedProduct.colors ? selectedProduct.colors[0]?.name : 'Standard'
  );
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const stock = typeof selectedProduct.stock === 'number' ? selectedProduct.stock : 10;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  const isFavorite = isInWishlist(selectedProduct.id || selectedProduct._id);
  const allImages = [
    selectedProduct.image,
    ...(selectedProduct.additionalImages || [])
  ];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(selectedProduct, selectedSize, selectedColor, qty);
    setSelectedProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-4xl border border-neutral-200 shadow-2xl overflow-hidden my-8">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/90 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-800 hover:bg-black hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Column: Image Gallery */}
          <div className="bg-neutral-100 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-200">
            <div className="aspect-[4/5] bg-white border border-neutral-200 overflow-hidden mb-4 relative">
              <img
                src={selectedImage}
                alt={selectedProduct.name}
                className={`w-full h-full object-cover object-center ${isOutOfStock ? 'grayscale opacity-75' : ''}`}
              />
              <div className="absolute top-3 left-3 flex flex-col space-y-1">
                {selectedProduct.isNewArrival && (
                  <span className="px-2.5 py-1 bg-black text-white text-[9px] font-bold uppercase tracking-widest">
                    New Arrival
                  </span>
                )}
                {isOutOfStock && (
                  <span className="px-2.5 py-1 bg-red-600 text-white text-[9px] font-bold uppercase tracking-widest">
                    Sold Out
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-20 flex-shrink-0 border-2 overflow-hidden bg-white ${
                      selectedImage === img ? 'border-black' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Meta & Add to Bag */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-400">
                  {selectedProduct.category} Atelier Capsule
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 font-sans tracking-tight">
                  {selectedProduct.name}
                </h2>
                {selectedProduct.subtitle && (
                  <p className="text-xs text-neutral-500 font-medium pt-1">
                    {selectedProduct.subtitle}
                  </p>
                )}
              </div>

              {/* Price & Rating */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-baseline space-x-3">
                  <span className="text-xl font-extrabold text-neutral-900">
                    Rs. {Number(selectedProduct.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                    <span className="text-sm text-neutral-400 line-through">
                      Rs. {Number(selectedProduct.originalPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1 text-xs text-neutral-600">
                  <Star className="w-3.5 h-3.5 fill-black text-black" />
                  <span className="font-bold">{selectedProduct.rating || 5.0}</span>
                  <span className="text-neutral-400">({selectedProduct.numReviews || 12} reviews)</span>
                </div>
              </div>

              {/* Size Selector */}
              {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                      Select Size
                    </label>
                    <span className="text-[10px] text-neutral-400 underline cursor-pointer">
                      Size Guide
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {selectedProduct.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`py-2 text-xs font-bold uppercase border transition-all ${
                          selectedSize === s
                            ? 'border-black bg-black text-white'
                            : 'border-neutral-200 text-neutral-800 hover:border-neutral-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Available Stock Indicator & Quantity Stepper */}
              <div className="flex items-center justify-between pt-2">
                {!isOutOfStock && (
                  <div className="flex items-center border border-neutral-300">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="px-3 py-1.5 text-xs font-bold hover:bg-neutral-100"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 text-xs font-bold min-w-[28px] text-center">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty(Math.min(stock, qty + 1))}
                      className="px-3 py-1.5 text-xs font-bold hover:bg-neutral-100"
                    >
                      +
                    </button>
                  </div>
                )}

                {/* Available Quantity Pill */}
                {isOutOfStock ? (
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 border border-red-200 flex items-center">
                    Sold Out (0 available)
                  </span>
                ) : isLowStock ? (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 border border-amber-200 flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" /> Only {stock} left in stock!
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 border border-emerald-200 flex items-center">
                    <Check className="w-3.5 h-3.5 mr-1" /> In Stock ({stock} units available)
                  </span>
                )}
              </div>

              {/* Tabs: Description vs Details */}
              <div className="pt-3 border-t border-neutral-100">
                <div className="flex space-x-4 border-b border-neutral-100 text-xs font-bold uppercase tracking-wider mb-2">
                  <button
                    onClick={() => setActiveTab('description')}
                    className={`pb-1.5 border-b-2 ${
                      activeTab === 'description' ? 'border-black text-black' : 'border-transparent text-neutral-400'
                    }`}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`pb-1.5 border-b-2 ${
                      activeTab === 'details' ? 'border-black text-black' : 'border-transparent text-neutral-400'
                    }`}
                  >
                    Materials &amp; Care
                  </button>
                </div>

                <div className="text-xs text-neutral-600 leading-relaxed min-h-[50px]">
                  {activeTab === 'description' ? (
                    <p>{selectedProduct.description}</p>
                  ) : (
                    <ul className="list-disc list-inside space-y-1">
                      {(selectedProduct.details || [
                        'Ethically sourced luxury fibers',
                        'Signature DRESSFEAT tailoring',
                        'Dry clean recommended'
                      ]).map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

            </div>

            {/* Actions: Add to Bag & Wishlist */}
            <div className="pt-6 space-y-3">
              <div className="flex gap-3">
                <button
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition-colors flex items-center justify-center space-x-2 ${
                    isOutOfStock
                      ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                      : 'bg-black text-white hover:bg-neutral-800'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {isOutOfStock
                      ? 'Sold Out'
                      : `Add to Bag • Rs. ${(selectedProduct.price * qty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  </span>
                </button>

                <button
                  onClick={() => toggleWishlist(selectedProduct)}
                  className={`p-3.5 border transition-colors ${
                    isFavorite
                      ? 'border-red-500 bg-red-50 text-red-500'
                      : 'border-neutral-300 hover:border-black text-neutral-800'
                  }`}
                  title="Toggle Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px] text-neutral-500 pt-2 border-t border-neutral-100">
                <div className="flex items-center space-x-1">
                  <Truck className="w-3 h-3" />
                  <span>Express Global</span>
                </div>
                <div className="flex items-center space-x-1">
                  <RotateCcw className="w-3 h-3" />
                  <span>30-Day Returns</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>100% Authentic</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
