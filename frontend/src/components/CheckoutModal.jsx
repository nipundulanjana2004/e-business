import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, CheckCircle, CreditCard, Truck, ShieldCheck, Printer, Banknote, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';
import { createOrder as apiCreateOrder } from '../services/api';
import { sendOrderConfirmEmail } from '../services/emailService';

// ─── PayHere Sandbox Configuration ───────────────────────────────────────────
// Replace with your LIVE credentials from payhere.lk merchant portal
const PAYHERE_CONFIG = {
  merchant_id: '1228929',           // Your PayHere Merchant ID
  sandbox:     true,                // Set false for production
  notify_url:  '',                  // Optional: backend webhook URL
  return_url:  window.location.href,
  cancel_url:  window.location.href,
};

function launchPayHere(paymentData, onSuccess, onDismiss, onError) {
  // PayHere JS SDK must be loaded in index.html
  if (typeof window.payhere === 'undefined') {
    // Fallback: open PayHere in a new tab if SDK not loaded
    const params = new URLSearchParams({
      merchant_id: PAYHERE_CONFIG.merchant_id,
      order_id:    paymentData.order_id,
      items:       paymentData.items,
      amount:      paymentData.amount,
      currency:    paymentData.currency || 'LKR',
      first_name:  paymentData.first_name,
      last_name:   paymentData.last_name,
      email:       paymentData.email,
      phone:       paymentData.phone,
      address:     paymentData.address,
      city:        paymentData.city || 'Colombo',
      country:     paymentData.country || 'Sri Lanka',
      return_url:  PAYHERE_CONFIG.return_url,
      cancel_url:  PAYHERE_CONFIG.cancel_url,
    });
    const base = PAYHERE_CONFIG.sandbox
      ? 'https://sandbox.payhere.lk/pay/checkout'
      : 'https://www.payhere.lk/pay/checkout';
    window.open(base + '?' + params.toString(), '_blank');
    onSuccess();  // Simulate success for GitHub Pages demo
    return;
  }

  window.payhere.onCompleted = onSuccess;
  window.payhere.onDismissed = onDismiss;
  window.payhere.onError     = onError;

  window.payhere.startPayment({
    sandbox:     PAYHERE_CONFIG.sandbox,
    merchant_id: PAYHERE_CONFIG.merchant_id,
    return_url:  PAYHERE_CONFIG.return_url,
    cancel_url:  PAYHERE_CONFIG.cancel_url,
    notify_url:  PAYHERE_CONFIG.notify_url,
    order_id:    paymentData.order_id,
    items:       paymentData.items,
    amount:      paymentData.amount,
    currency:    paymentData.currency || 'LKR',
    hash:        paymentData.hash || '',    // MD5 hash (generate on backend for production)
    first_name:  paymentData.first_name,
    last_name:   paymentData.last_name || '',
    email:       paymentData.email,
    phone:       paymentData.phone,
    address:     paymentData.address,
    city:        paymentData.city || 'Colombo',
    country:     paymentData.country || 'Sri Lanka',
    delivery_address: paymentData.address,
    delivery_city:    paymentData.city || 'Colombo',
    delivery_country: paymentData.country || 'Sri Lanka',
    custom_1:    '',
    custom_2:    '',
  });
}

export const CheckoutModal = () => {
  const {
    isCheckoutOpen, setIsCheckoutOpen,
    cart, cartSubtotal, discountAmount, shippingFee, cartTotal,
    clearCart, user, token, addToast
  } = useShop();

  if (!isCheckoutOpen) return null;

  const [step, setStep] = useState(1);  // 1: Delivery  2: Review & Pay  3: Confirmed
  const [formData, setFormData] = useState({
    fullName:  user ? user.name    : '',
    email:     user ? user.email   : '',
    phone:     user ? user.phone   : '',
    address:   user ? user.address : '',
    city:      '',
    postalCode:'',
    country:   'Sri Lanka',
    paymentMethod: 'PayHere',
  });
  const [completedOrder, setCompletedOrder]   = useState(null);
  const [submitting, setSubmitting]           = useState(false);
  const [payHereLoading, setPayHereLoading]   = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // ─── Step 1: save shipping & move to review ───────────────────────────────
  const handleContinue = () => {
    if (!formData.fullName.trim() || !formData.address.trim()) {
      addToast('Please fill in your name and delivery address.', 'error');
      return;
    }
    if (!formData.email.trim()) { addToast('Email address is required.', 'error'); return; }
    setStep(2);
  };

  // ─── Step 2: place order record + payment ────────────────────────────────
  const handlePlaceOrder = async () => {
    setSubmitting(true);
    const orderId = 'DF-' + Date.now();

    const orderPayload = {
      orderItems: cart.map(item => ({
        product: item.productId, name: item.name, price: item.price,
        qty: item.qty, size: item.selectedSize, color: item.selectedColor, image: item.image
      })),
      shippingAddress: { fullName: formData.fullName, address: formData.address, city: formData.city, postalCode: formData.postalCode, country: formData.country, phone: formData.phone },
      paymentMethod:  formData.paymentMethod,
      itemsPrice:     cartSubtotal,
      shippingPrice:  shippingFee,
      discountPrice:  discountAmount,
      totalPrice:     cartTotal,
      userEmail:      formData.email,
      userName:       formData.fullName,
    };

    // ── Payment: PayHere ─────────────────────────────────────────────────────
    if (formData.paymentMethod === 'PayHere') {
      setPayHereLoading(true);
      setSubmitting(false);

      const nameParts = formData.fullName.trim().split(' ');
      const paymentData = {
        order_id:   orderId,
        items:      cart.map(i => i.name).join(', '),
        amount:     cartTotal.toFixed(2),
        currency:   'LKR',
        first_name: nameParts[0] || 'Customer',
        last_name:  nameParts.slice(1).join(' ') || '',
        email:      formData.email,
        phone:      formData.phone || '0771234567',
        address:    formData.address,
        city:       formData.city || 'Colombo',
        country:    formData.country || 'Sri Lanka',
      };

      launchPayHere(
        paymentData,
        async () => {  // onCompleted
          setPayHereLoading(false);
          const res = await apiCreateOrder({ ...orderPayload, orderId }, token);
          const finalOrder = res && res.success ? res.order : { _id: orderId, trackingNumber: orderId, ...orderPayload };
          setCompletedOrder(finalOrder);
          setStep(3);
          clearCart();
          confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 } });
          addToast('Payment successful! Order confirmed.', 'success');
          if (user) sendOrderConfirmEmail(user, finalOrder).catch(() => {});
        },
        () => { setPayHereLoading(false); addToast('Payment cancelled.', 'info'); },
        (err) => { setPayHereLoading(false); addToast('Payment error: ' + err, 'error'); }
      );
      return;
    }

    // ── Payment: Cash on Delivery ────────────────────────────────────────────
    try {
      const res = await apiCreateOrder(orderPayload, token);
      const finalOrder = res && res.success ? res.order : { _id: orderId, trackingNumber: orderId, ...orderPayload };
      setCompletedOrder(finalOrder);
      setStep(3);
      clearCart();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      addToast('Order placed! Pay on delivery.', 'success');
      if (user) sendOrderConfirmEmail(user, finalOrder).catch(() => {});
    } catch {
      addToast('Could not place order. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const isAutoFilled = user && (user.phone || user.address);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-3xl border border-neutral-200 shadow-2xl overflow-hidden my-8">

        {/* Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 block">DRESSFEAT Atelier</span>
            <h2 className="text-base font-extrabold uppercase tracking-wider text-neutral-900">
              {step === 3 ? 'Order Confirmed' : 'Checkout & Express Dispatch'}
            </h2>
          </div>
          <button onClick={() => setIsCheckoutOpen(false)} className="p-1.5 text-neutral-500 hover:text-black rounded-full hover:bg-neutral-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Tabs */}
        {step < 3 && (
          <div className="grid grid-cols-2 text-center text-xs font-bold uppercase tracking-wider border-b border-neutral-200">
            <button onClick={() => setStep(1)} className={`py-3 border-b-2 flex items-center justify-center gap-1.5 ${step === 1 ? 'border-black text-black bg-white' : 'border-transparent text-neutral-400 bg-neutral-50'}`}>
              <Truck className="w-3.5 h-3.5" /> 1. Delivery Details
            </button>
            <button onClick={() => { if (formData.fullName && formData.address) setStep(2); }} className={`py-3 border-b-2 flex items-center justify-center gap-1.5 ${step === 2 ? 'border-black text-black bg-white' : 'border-transparent text-neutral-400 bg-neutral-50'}`}>
              <CreditCard className="w-3.5 h-3.5" /> 2. Payment & Review
            </button>
          </div>
        )}

        <div className="p-6 sm:p-8">

          {/* ── STEP 1: Delivery ──────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">Recipient & Shipping Address</h3>
                {isAutoFilled && (
                  <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5">
                    Auto-filled from profile
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {[
                  { label: 'Full Name', name: 'fullName', type: 'text', placeholder: 'Sophia Laurent', required: true },
                  { label: 'Email Address', name: 'email', type: 'email', placeholder: 'sophia@example.com', required: true },
                  { label: 'Phone Number', name: 'phone', type: 'text', placeholder: '+94 77 123 4567', required: true },
                  { label: 'Country', name: 'country', type: 'text', placeholder: 'Sri Lanka', required: false },
                ].map(f => (
                  <div key={f.name}>
                    <label className="block text-neutral-700 font-semibold mb-1">{f.label}</label>
                    <input type={f.type} name={f.name} value={formData[f.name]} onChange={handleChange}
                      placeholder={f.placeholder} required={f.required}
                      className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black" />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-neutral-700 font-semibold mb-1 text-xs">Street Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange}
                    required placeholder="123 Main St, Colombo 03"
                    className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black text-xs" />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1 text-xs">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange}
                    className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black text-xs" />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1 text-xs">Postal Code</label>
                  <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange}
                    className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black text-xs" />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="button" onClick={handleContinue}
                  className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800">
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Payment & Review ──────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">

              {/* Payment Method Selector */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 mb-3">Payment Method</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'PayHere', label: 'PayHere', sub: 'Visa / Master / Amex', icon: <CreditCard className="w-5 h-5" /> },
                    { id: 'Cash on Delivery', label: 'Cash on Delivery', sub: 'Pay when received', icon: <Banknote className="w-5 h-5" /> },
                  ].map(m => (
                    <button key={m.id} type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: m.id })}
                      className={`p-4 text-left border transition-all flex items-start gap-3 ${formData.paymentMethod === m.id ? 'border-black bg-neutral-900 text-white' : 'border-neutral-200 text-neutral-700 hover:border-neutral-400 bg-neutral-50'}`}>
                      <span className={formData.paymentMethod === m.id ? 'text-amber-400' : 'text-neutral-400'}>{m.icon}</span>
                      <div>
                        <p className="font-bold text-xs uppercase tracking-wide">{m.label}</p>
                        <p className={`text-[10px] mt-0.5 ${formData.paymentMethod === m.id ? 'text-neutral-400' : 'text-neutral-400'}`}>{m.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* PayHere info badge */}
                {formData.paymentMethod === 'PayHere' && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 flex-shrink-0 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-bold">Secure payment via PayHere</p>
                      <p className="text-blue-600 mt-0.5">You will be redirected to PayHere's secure checkout to complete your payment. Supports Visa, Mastercard, and Amex.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="p-4 bg-neutral-100 border border-neutral-200 text-xs space-y-2">
                <div className="flex justify-between font-bold text-neutral-900">
                  <span>Shipping To:</span>
                  <span className="text-right">{formData.fullName}{formData.city ? ', ' + formData.city : ''}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Items ({cart.length}):</span>
                  <span>{cart.map(i => i.name).join(', ').slice(0, 40)}{cart.map(i => i.name).join(', ').length > 40 ? '...' : ''}</span>
                </div>
                <div className="flex justify-between"><span>Subtotal:</span><span>Rs. {cartSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                {discountAmount > 0 && <div className="flex justify-between text-emerald-700"><span>Discount:</span><span>-Rs. {discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>}
                <div className="flex justify-between"><span>Delivery:</span><span>{shippingFee === 0 ? 'Complimentary' : `Rs. ${shippingFee.toFixed(2)}`}</span></div>
                <div className="flex justify-between text-sm font-extrabold text-neutral-900 pt-2 border-t border-neutral-300">
                  <span>Total Amount Due:</span>
                  <span>Rs. {cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button type="button" onClick={() => setStep(1)} className="text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-black">
                  Back to Address
                </button>
                <button type="button" disabled={submitting || payHereLoading} onClick={handlePlaceOrder}
                  className="px-8 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-50 flex items-center gap-2">
                  {payHereLoading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Opening PayHere...</>
                  ) : submitting ? (
                    'Processing...'
                  ) : formData.paymentMethod === 'PayHere' ? (
                    <>Pay with PayHere &nbsp;&middot;&nbsp; Rs. {cartTotal.toLocaleString('en-IN')}</>
                  ) : (
                    <>Place Order &nbsp;&middot;&nbsp; Rs. {cartTotal.toLocaleString('en-IN')}</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Confirmed ──────────────────────────────────────────── */}
          {step === 3 && completedOrder && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold tracking-[0.2em] text-emerald-600">Transaction Successful</span>
                <h3 className="text-2xl font-black text-neutral-900 font-sans">Thank you for your patronage.</h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">Your bespoke pieces are being prepared by the DRESSFEAT atelier staff and will dispatch shortly.</p>
              </div>
              <div className="p-4 bg-neutral-50 border border-neutral-200 max-w-sm mx-auto space-y-1 text-xs">
                <span className="text-neutral-500 uppercase tracking-wider font-semibold">Atelier Order Reference</span>
                <p className="font-mono font-extrabold text-sm text-neutral-900 tracking-wider">{completedOrder.trackingNumber || completedOrder._id || 'DF-CONFIRMED'}</p>
                <p className="text-[10px] text-neutral-400">A confirmation email has been sent to {formData.email}</p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button onClick={() => window.print()} className="px-5 py-2.5 border border-neutral-300 text-neutral-700 text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5" /> Print Receipt
                </button>
                <button onClick={() => setIsCheckoutOpen(false)} className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800">
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
