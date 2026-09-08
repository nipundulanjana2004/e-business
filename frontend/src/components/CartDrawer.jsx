import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Check, ShieldCheck } from 'lucide-react';

export const CartDrawer = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    cartCount,
    cartSubtotal,
    freeShippingThreshold,
    shippingFee,
    discountAmount,
    discountPercent,
    promoCode,
    cartTotal,
    removeFromCart,
    updateCartQty,
    applyCoupon,
    removeCoupon,
    setIsCheckoutOpen
  } = useShop();

  const [inputCode, setInputCode] = useState('');

  if (!isCartOpen) return null;

  const progressPercent = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));
  const amountNeeded = freeShippingThreshold - cartSubtotal;

  const handleApply = (e) => {
    e.preventDefault();
    if (inputCode.trim()) {
      applyCoupon(inputCode);
      setInputCode('');
    }
  };

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-black" />
              <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-neutral-900">
                Shopping Bag ({cartCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-neutral-500 hover:text-black rounded-full hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Tracker */}
          <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 text-xs">
            {amountNeeded > 0 ? (
              <p className="text-neutral-600 mb-1.5">
                Add <strong className="text-black">Rs. {amountNeeded.toLocaleString('en-IN')}</strong> more for complimentary express delivery.
              </p>
            ) : (
              <p className="text-emerald-700 font-bold mb-1.5 flex items-center">
                <Check className="w-3.5 h-3.5 mr-1 inline" /> Complimentary express delivery unlocked!
              </p>
            )}
            <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-black h-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto" />
                <p className="text-sm text-neutral-500 font-medium">Your shopping bag is currently empty.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex space-x-3.5 pb-4 border-b border-neutral-100"
                >
                  <div className="w-20 h-24 bg-neutral-100 flex-shrink-0 overflow-hidden border border-neutral-200">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-neutral-900 leading-snug">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="text-neutral-400 hover:text-red-600 p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-neutral-500 space-x-2 mt-0.5">
                        <span>Size: <strong>{item.selectedSize}</strong></span>
                        <span>•</span>
                        <span>Color: <strong>{item.selectedColor}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-neutral-200 text-xs">
                        <button
                          onClick={() => updateCartQty(item.cartItemId, -1)}
                          className="px-2 py-0.5 hover:bg-neutral-100 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 font-bold min-w-[20px] text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.cartItemId, 1)}
                          className="px-2 py-0.5 hover:bg-neutral-100 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-bold text-neutral-900">
                        Rs. {(item.price * item.qty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Voucher & Checkout */}
          {cart.length > 0 && (
            <div className="p-5 bg-neutral-50 border-t border-neutral-200 space-y-4">
              
              {/* Promo Code Input */}
              {discountPercent > 0 ? (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Code <strong>{promoCode}</strong> applied (-{discountPercent}%)</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-neutral-500 hover:text-black font-bold uppercase text-[10px]"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApply} className="flex">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="Promo Code (FEAT2026 for 15% off)"
                    className="flex-1 px-3 py-2 text-xs uppercase bg-white border border-neutral-300 focus:outline-none focus:border-black"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold uppercase hover:bg-black"
                  >
                    Apply
                  </button>
                </form>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">
                    Rs. {cartSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Atelier Discount ({discountPercent}%)</span>
                    <span>-Rs. {discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-neutral-900">
                    {shippingFee === 0 ? 'Complimentary' : `Rs. ${shippingFee.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-extrabold text-neutral-900 pt-2 border-t border-neutral-200">
                  <span>Total</span>
                  <span>Rs. {cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleProceedCheckout}
                className="w-full py-3.5 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center space-x-2 text-[10px] text-neutral-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
                <span>Encrypted 256-bit atelier secure checkout</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
