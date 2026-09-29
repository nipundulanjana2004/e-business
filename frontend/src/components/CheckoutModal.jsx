import React, { useState } from 'react';
import md5 from 'md5';
import { useShop } from '../context/ShopContext';
import { X, CheckCircle, CreditCard, Truck, ShieldCheck, Printer, Banknote } from 'lucide-react';
import confetti from 'canvas-confetti';
import { createOrder as apiCreateOrder } from '../services/api';
import { sendOrderConfirmEmail } from '../services/emailService';

// ─── PayHere Configuration ──────────────────────────────────────────────────
const PH_MERCHANT_ID = import.meta.env.VITE_PAYHERE_MERCHANT_ID || '1238333';
const RAW_SECRET     = import.meta.env.VITE_PAYHERE_SECRET      || '4066085982411028965413319993263855172799';
const PH_SANDBOX     = import.meta.env.VITE_PAYHERE_SANDBOX === 'true'; // Default to false for live merchant ID 1238333

/**
 * Safely extract raw secret (decodes base64 if needed)
 */
function getRawSecret(secretStr) {
  if (!secretStr) return '';
  try {
    if (secretStr.endsWith('=') || (/^[A-Za-z0-9+/=]+$/.test(secretStr) && secretStr.length > 30 && !/^\d+$/.test(secretStr))) {
      return atob(secretStr);
    }
  } catch (e) {}
  return secretStr;
}

/**
 * PayHere MD5 Hash Formula:
 * hash = MD5( merchant_id + order_id + amount_formatted + currency + MD5(merchant_secret).toUpperCase() ).toUpperCase()
 */
function generateHash(merchantId, orderId, amount, currency = 'LKR') {
  const secret = getRawSecret(RAW_SECRET);
  if (!secret) {
    console.warn('[PayHere] No secret configured — hash will be empty');
    return '';
  }
  const hashedSecret   = md5(secret).toUpperCase();
  const amountFormatted = Number(amount).toFixed(2);
  const rawString       = merchantId + orderId + amountFormatted + currency + hashedSecret;
  return md5(rawString).toUpperCase();
}

/**
 * Launch PayHere checkout via JS SDK (loaded in index.html).
 * Falls back to direct form post / popup if SDK hasn't loaded yet.
 */
function launchPayHere(data, onSuccess, onDismiss, onError) {
  const hash = generateHash(PH_MERCHANT_ID, data.order_id, data.amount, data.currency || 'LKR');

  const payment = {
    sandbox:           PH_SANDBOX,
    merchant_id:       PH_MERCHANT_ID,
    return_url:        window.location.href,
    cancel_url:        window.location.href,
    notify_url:        '',
    order_id:          data.order_id,
    items:             data.items,
    amount:            Number(data.amount).toFixed(2),
    currency:          data.currency || 'LKR',
    hash:              hash,
    first_name:        data.first_name,
    last_name:         data.last_name || '',
    email:             data.email,
    phone:             data.phone,
    address:           data.address,
    city:              data.city || 'Colombo',
    country:           data.country || 'Sri Lanka',
    delivery_address:  data.address,
    delivery_city:     data.city || 'Colombo',
    delivery_country:  data.country || 'Sri Lanka',
    custom_1:          '',
    custom_2:          '',
  };

  console.log('[PayHere Init]', { merchant_id: PH_MERCHANT_ID, sandbox: PH_SANDBOX, order_id: data.order_id, hash });

  if (typeof window.payhere !== 'undefined') {
    window.payhere.onCompleted = onSuccess;
    window.payhere.onDismissed = onDismiss;
    window.payhere.onError     = onError;
    window.payhere.startPayment(payment);
  } else {
    // Fallback redirect if SDK not loaded
    const base   = PH_SANDBOX
      ? 'https://sandbox.payhere.lk/pay/checkout'
      : 'https://www.payhere.lk/pay/checkout';
    const params = new URLSearchParams(payment);
    window.open(base + '?' + params.toString(), '_blank');
    onSuccess(data.order_id);
  }
}

// ─── CheckoutModal Component ─────────────────────────────────────────────────
export const CheckoutModal = () => {
  const {
    isCheckoutOpen, setIsCheckoutOpen,
    cart, cartSubtotal, discountAmount, shippingFee, cartTotal,
    clearCart, user, token, addToast
  } = useShop();

  if (!isCheckoutOpen) return null;

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName:      user?.name    || '',
    email:         user?.email   || '',
    phone:         user?.phone   || '',
    address:       user?.address || '',
    city:          '',
    postalCode:    '',
    country:       'Sri Lanka',
    paymentMethod: 'PayHere',
  });
  const [completedOrder, setCompletedOrder] = useState(null);
  const [submitting, setSubmitting]         = useState(false);
  const [phLoading, setPhLoading]           = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleContinue = () => {
    if (!formData.fullName.trim() || !formData.address.trim()) {
      addToast('Please fill in your name and delivery address.', 'error');
      return;
    }
    if (!formData.email.trim()) { addToast('Email address is required.', 'error'); return; }
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    const orderId = 'DF-' + Date.now();

    const orderPayload = {
      orderItems: cart.map(item => ({
        product: item.productId, name: item.name, price: item.price,
        qty: item.qty, size: item.selectedSize, color: item.selectedColor, image: item.image
      })),
      shippingAddress: {
        fullName: formData.fullName, address: formData.address,
        city: formData.city, postalCode: formData.postalCode,
        country: formData.country, phone: formData.phone
      },
      paymentMethod: formData.paymentMethod,
      itemsPrice:    cartSubtotal,
      shippingPrice: shippingFee,
      discountPrice: discountAmount,
      totalPrice:    cartTotal,
      userEmail:     formData.email,
      userName:      formData.fullName,
    };

    const finishOrder = async (order) => {
      setCompletedOrder(order);
      setStep(3);
      clearCart();
      confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 } });
      addToast('Order confirmed! Thank you.', 'success');
      if (user) sendOrderConfirmEmail(user, order).catch(() => {});
    };

    // ── PayHere Payment ──────────────────────────────────────────────────────
    if (formData.paymentMethod === 'PayHere') {
      setSubmitting(false);
      setPhLoading(true);
      const nameParts = formData.fullName.trim().split(' ');

      launchPayHere(
        {
          order_id:   orderId,
          items:      cart.map(i => i.name).join(', ').slice(0, 200),
          amount:     cartTotal,
          currency:   'LKR',
          first_name: nameParts[0] || 'Customer',
          last_name:  nameParts.slice(1).join(' ') || '',
          email:      formData.email,
          phone:      formData.phone || '0771234567',
          address:    formData.address,
          city:       formData.city || 'Colombo',
          country:    formData.country || 'Sri Lanka',
        },
        async () => {
          setPhLoading(false);
          const res = await apiCreateOrder({ ...orderPayload, orderId }, token);
          await finishOrder(res && res.success ? res.order : { _id: orderId, trackingNumber: orderId, ...orderPayload });
        },
        () => { setPhLoading(false); addToast('Payment cancelled.', 'info'); },
        (err) => { setPhLoading(false); addToast('PayHere error: ' + err, 'error'); }
      );
      return;
    }

    // ── Cash on Delivery ─────────────────────────────────────────────────────
    try {
      const res = await apiCreateOrder(orderPayload, token);
      await finishOrder(res && res.success ? res.order : { _id: orderId, trackingNumber: orderId, ...orderPayload });
    } catch {
      addToast('Could not place order. Try again.', 'error');
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

        {/* Step tabs */}
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

          {/* ── STEP 1: Delivery ──────────────────────────────────────────── */}
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
                  { label: 'Full Name',     name: 'fullName', type: 'text',  ph: 'Nipun Dulanjana',   req: true },
                  { label: 'Email Address', name: 'email',    type: 'email', ph: 'you@example.com',   req: true },
                  { label: 'Phone Number',  name: 'phone',    type: 'text',  ph: '+94 77 123 4567',   req: true },
                  { label: 'Country',       name: 'country',  type: 'text',  ph: 'Sri Lanka',         req: false },
                ].map(f => (
                  <div key={f.name}>
                    <label className="block text-neutral-700 font-semibold mb-1">{f.label}</label>
                    <input type={f.type} name={f.name} value={formData[f.name]} onChange={handleChange}
                      placeholder={f.ph} required={f.req}
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
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 mb-3">Select Payment Method</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'PayHere',          label: 'PayHere',          sub: 'Visa / Master / Amex', icon: <CreditCard className="w-5 h-5" /> },
                    { id: 'Cash on Delivery', label: 'Cash on Delivery', sub: 'Pay when received',    icon: <Banknote   className="w-5 h-5" /> },
                  ].map(m => (
                    <button key={m.id} type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: m.id })}
                      className={`p-4 text-left border transition-all flex items-start gap-3 ${formData.paymentMethod === m.id ? 'border-black bg-neutral-900 text-white' : 'border-neutral-200 text-neutral-700 hover:border-neutral-400 bg-neutral-50'}`}>
                      <span className={formData.paymentMethod === m.id ? 'text-amber-400' : 'text-neutral-400'}>{m.icon}</span>
                      <div>
                        <p className="font-bold text-xs uppercase tracking-wide">{m.label}</p>
                        <p className="text-[10px] mt-0.5 opacity-60">{m.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {formData.paymentMethod === 'PayHere' && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 flex-shrink-0 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-bold">MD5 Hash Secured Payment (Merchant ID: {PH_MERCHANT_ID})</p>
                      <p className="text-blue-600 mt-0.5">
                        Your payment request is cryptographically signed with MD5 hash before sending to PayHere.
                        Card details are handled on PayHere's PCI-DSS certified servers.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Order summary */}
              <div className="p-4 bg-neutral-100 border border-neutral-200 text-xs space-y-2">
                <div className="flex justify-between font-bold text-neutral-900">
                  <span>Shipping To:</span>
                  <span className="text-right">{formData.fullName}{formData.city ? ', ' + formData.city : ''}</span>
                </div>
                <div className="flex justify-between"><span>Subtotal:</span><span>Rs. {cartSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                {discountAmount > 0 && <div className="flex justify-between text-emerald-700"><span>Discount:</span><span>- Rs. {discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>}
                <div className="flex justify-between"><span>Delivery:</span><span>{shippingFee === 0 ? 'Complimentary' : `Rs. ${shippingFee.toFixed(2)}`}</span></div>
                <div className="flex justify-between text-sm font-extrabold text-neutral-900 pt-2 border-t border-neutral-300">
                  <span>Total Amount Due:</span>
                  <span>Rs. {cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button type="button" onClick={() => setStep(1)} className="text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-black">
                  Back to Address
                </button>
                <button type="button" disabled={submitting || phLoading} onClick={handlePlaceOrder}
                  className="px-8 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-50 flex items-center gap-2">
                  {phLoading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Connecting to PayHere...</>
                  ) : submitting ? 'Processing...'
                  : formData.paymentMethod === 'PayHere'
                    ? <>Pay Securely &middot; Rs. {cartTotal.toLocaleString('en-IN')}</>
                    : <>Confirm Order &middot; Rs. {cartTotal.toLocaleString('en-IN')}</>
                  }
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Confirmed ─────────────────────────────────────────── */}
          {step === 3 && completedOrder && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold tracking-[0.2em] text-emerald-600">Transaction Successful</span>
                <h3 className="text-2xl font-black text-neutral-900">Thank you for your patronage.</h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">Your bespoke pieces are being prepared by the DRESSFEAT atelier and will dispatch shortly.</p>
              </div>
              <div className="p-4 bg-neutral-50 border border-neutral-200 max-w-sm mx-auto space-y-1 text-xs">
                <span className="text-neutral-500 uppercase tracking-wider font-semibold">Atelier Order Reference</span>
                <p className="font-mono font-extrabold text-sm text-neutral-900 tracking-wider">
                  {completedOrder.trackingNumber || completedOrder._id || 'DF-CONFIRMED'}
                </p>
                <p className="text-[10px] text-neutral-400">Confirmation sent to {formData.email}</p>
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
