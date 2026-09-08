import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, CheckCircle, CreditCard, Truck, ShieldCheck, Sparkles, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';
import { createOrder as apiCreateOrder } from '../services/api';

export const CheckoutModal = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    discountAmount,
    shippingFee,
    cartTotal,
    clearCart,
    user,
    token,
    addToast
  } = useShop();

  if (!isCheckoutOpen) return null;

  const [step, setStep] = useState(1); // 1: Shipping Address, 2: Payment Method, 3: Confirmation
  const [formData, setFormData] = useState({
    fullName: user ? user.name : '',
    email: user ? user.email : '',
    phone: '+91 98765 43210',
    address: '88 Fashion Boulevard, Suite 400',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
    country: 'India',
    paymentMethod: 'Credit Card',
    cardNumber: '4532 •••• •••• 8820',
    cardExp: '08/28',
    cardCvc: '888'
  });
  const [completedOrder, setCompletedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const orderPayload = {
      orderItems: cart.map(item => ({
        product: item.productId,
        name: item.name,
        price: item.price,
        qty: item.qty,
        size: item.selectedSize,
        color: item.selectedColor,
        image: item.image
      })),
      shippingAddress: {
        fullName: formData.fullName,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
        phone: formData.phone
      },
      paymentMethod: formData.paymentMethod,
      itemsPrice: cartSubtotal,
      shippingPrice: shippingFee,
      discountPrice: discountAmount,
      totalPrice: cartTotal,
      userEmail: formData.email,
      userName: formData.fullName
    };

    try {
      const res = await apiCreateOrder(orderPayload, token);
      if (res.success) {
        setCompletedOrder(res.order);
        setStep(3);
        clearCart();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        addToast('Order placed successfully! Confirmation generated.', 'success');
      } else {
        addToast(res.message || 'Could not place order', 'error');
      }
    } catch (err) {
      addToast('Error communicating with order server', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-3xl border border-neutral-200 shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 block">
              DRESSFEAT Atelier
            </span>
            <h2 className="text-base font-extrabold uppercase tracking-wider text-neutral-900">
              {step === 3 ? 'Order Confirmed' : 'Checkout & Express Dispatch'}
            </h2>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 text-neutral-500 hover:text-black rounded-full hover:bg-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Progress */}
        {step < 3 && (
          <div className="grid grid-cols-2 text-center text-xs font-bold uppercase tracking-wider border-b border-neutral-200">
            <button
              onClick={() => setStep(1)}
              className={`py-3 border-b-2 ${step === 1 ? 'border-black text-black bg-white' : 'border-transparent text-neutral-400 bg-neutral-50'}`}
            >
              1. Delivery Details
            </button>
            <button
              onClick={() => {
                if (formData.fullName && formData.address) setStep(2);
              }}
              className={`py-3 border-b-2 ${step === 2 ? 'border-black text-black bg-white' : 'border-transparent text-neutral-400 bg-neutral-50'}`}
            >
              2. Payment & Review
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                Recipient & Shipping Address
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Sophia Laurent"
                    className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="sophia@example.com"
                    className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-neutral-700 font-semibold mb-1">Street Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!formData.fullName || !formData.address) {
                      addToast('Please fill in your name and delivery address', 'error');
                      return;
                    }
                    setStep(2);
                  }}
                  className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              
              {/* Payment Methods */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 mb-3">
                  Select Payment Method
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {['Credit Card', 'UPI / QR', 'Cash on Delivery'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: m })}
                      className={`p-3 text-xs font-bold border text-center transition-all ${
                        formData.paymentMethod === m
                          ? 'border-black bg-neutral-900 text-white'
                          : 'border-neutral-200 text-neutral-700 hover:border-neutral-400 bg-neutral-50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulated Card Fields */}
              {formData.paymentMethod === 'Credit Card' && (
                <div className="p-4 bg-neutral-50 border border-neutral-200 space-y-3 text-xs">
                  <div>
                    <label className="block text-neutral-600 font-semibold mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white border border-neutral-300 focus:outline-none focus:border-black"
                      />
                      <CreditCard className="w-4 h-4 text-neutral-400 absolute right-3 top-2.5" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-neutral-600 font-semibold mb-1">Expires</label>
                      <input
                        type="text"
                        name="cardExp"
                        value={formData.cardExp}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white border border-neutral-300 focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-600 font-semibold mb-1">CVC / CVV</label>
                      <input
                        type="text"
                        name="cardCvc"
                        value={formData.cardCvc}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white border border-neutral-300 focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Order Summary Recap */}
              <div className="p-4 bg-neutral-100 border border-neutral-200 text-xs space-y-2">
                <div className="flex justify-between font-bold text-neutral-900">
                  <span>Shipping To:</span>
                  <span className="text-right">{formData.fullName}, {formData.city}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>Rs. {cartSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span>-Rs. {discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span>{shippingFee === 0 ? 'Complimentary' : `Rs. ${shippingFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-neutral-900 pt-2 border-t border-neutral-300">
                  <span>Total Amount Due:</span>
                  <span>Rs. {cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-black"
                >
                  ← Back to Address
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={handlePlaceOrder}
                  className="px-8 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-50"
                >
                  {submitting ? 'Authenticating Order...' : `Pay & Complete (Rs. ${cartTotal.toLocaleString('en-IN')})`}
                </button>
              </div>

            </div>
          )}

          {step === 3 && completedOrder && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <span className="text-xs uppercase font-bold tracking-[0.2em] text-emerald-600">
                  Transaction Successful
                </span>
                <h3 className="text-2xl font-black text-neutral-900 font-sans">
                  Thank you for your patronage.
                </h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  Your bespoke pieces are being prepared by the DRESSFEAT atelier staff and will dispatch shortly.
                </p>
              </div>

              {/* Tracking ID Badge */}
              <div className="p-4 bg-neutral-50 border border-neutral-200 max-w-sm mx-auto space-y-1 text-xs">
                <span className="text-neutral-500 uppercase tracking-wider font-semibold">Atelier Tracking Number</span>
                <p className="font-mono font-extrabold text-sm text-neutral-900 tracking-wider">
                  {completedOrder.trackingNumber || 'DF-2026-981742'}
                </p>
                <p className="text-[10px] text-neutral-400">
                  Confirmation receipt dispatched to {formData.email}
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 border border-neutral-300 text-neutral-700 text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 flex items-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
