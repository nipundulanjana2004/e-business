import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Send, Truck, RotateCcw, HelpCircle, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import { submitContact } from '../services/api';

export const InfoModals = () => {
  const {
    isContactOpen,
    setIsContactOpen,
    isPolicyOpen,
    setIsPolicyOpen,
    isFaqOpen,
    setIsFaqOpen,
    addToast
  } = useShop();

  const [contactData, setContactData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    await submitContact(contactData);
    setSubmitted(true);
    addToast('Message sent! An atelier concierge will reply within 24h.', 'success');
  };

  return (
    <>
      {/* Contact Us Modal */}
      {isContactOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg border border-neutral-300 shadow-2xl overflow-hidden">
            <div className="p-5 bg-neutral-900 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-amber-400 block">
                  Concierge Support
                </span>
                <h3 className="text-sm font-extrabold uppercase tracking-wider">Contact DRESSFEAT Atelier</h3>
              </div>
              <button onClick={() => setIsContactOpen(false)}><X className="w-5 h-5 text-neutral-400 hover:text-white" /></button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2 pb-4 border-b border-neutral-100 text-center text-[10px] text-neutral-600">
                <div className="p-2 bg-neutral-50 border">
                  <Mail className="w-3.5 h-3.5 mx-auto mb-1 text-black" />
                  <span>concierge@dressfeat.com</span>
                </div>
                <div className="p-2 bg-neutral-50 border">
                  <Phone className="w-3.5 h-3.5 mx-auto mb-1 text-black" />
                  <span>+1 (800) 555-DF26</span>
                </div>
                <div className="p-2 bg-neutral-50 border">
                  <MapPin className="w-3.5 h-3.5 mx-auto mb-1 text-black" />
                  <span>London • Paris • Milan</span>
                </div>
              </div>

              {submitted ? (
                <div className="text-center py-8 space-y-2">
                  <p className="font-bold text-sm text-neutral-900">Thank you for getting in touch.</p>
                  <p className="text-neutral-500">Your inquiry has been routed to our senior stylist team.</p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setIsContactOpen(false);
                    }}
                    className="mt-3 px-6 py-2 bg-black text-white font-bold uppercase"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <div>
                    <label className="font-bold block mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={contactData.name}
                      onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                      className="w-full p-2 border border-neutral-300 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Your Email</label>
                    <input
                      type="email"
                      required
                      value={contactData.email}
                      onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                      className="w-full p-2 border border-neutral-300 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={contactData.subject}
                      onChange={(e) => setContactData({ ...contactData, subject: e.target.value })}
                      placeholder="Size consultation, bespoke inquiry, tracking..."
                      className="w-full p-2 border border-neutral-300 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Message</label>
                    <textarea
                      rows={3}
                      required
                      value={contactData.message}
                      onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                      className="w-full p-2 border border-neutral-300 focus:outline-none focus:border-black"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-black text-white font-bold uppercase tracking-widest hover:bg-neutral-800"
                  >
                    Send Concierge Request
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delivery & Return Policy Modal */}
      {isPolicyOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-xl border border-neutral-300 shadow-2xl overflow-hidden">
            <div className="p-5 bg-neutral-900 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-amber-400 block">
                  Atelier Standards
                </span>
                <h3 className="text-sm font-extrabold uppercase tracking-wider">Delivery &amp; Return Policy</h3>
              </div>
              <button onClick={() => setIsPolicyOpen(false)}><X className="w-5 h-5 text-neutral-400 hover:text-white" /></button>
            </div>

            <div className="p-6 space-y-4 text-xs text-neutral-700 leading-relaxed max-h-[75vh] overflow-y-auto">
              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 uppercase flex items-center">
                  <Truck className="w-4 h-4 mr-2" /> Global Express Dispatch
                </h4>
                <p>
                  All orders are dispatched from our European atelier hubs within 24 to 48 hours in signature gift packaging with archival dust bags.
                </p>
                <ul className="list-disc list-inside space-y-1 text-neutral-600 pl-2">
                  <li>Complimentary worldwide shipping on all orders over Rs. 6,000.</li>
                  <li>Standard express delivery takes 3-5 business days.</li>
                  <li>Real-time satellite GPS tracking number provided with every shipment.</li>
                </ul>
              </div>

              <div className="space-y-2 pt-3 border-t border-neutral-200">
                <h4 className="font-bold text-neutral-900 uppercase flex items-center">
                  <RotateCcw className="w-4 h-4 mr-2" /> 30-Day Complimentary Returns
                </h4>
                <p>
                  If your selection does not fit to perfection, we welcome returns and size exchanges within 30 days of receipt, provided items are unworn with original tags attached.
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-neutral-200">
                <h4 className="font-bold text-neutral-900 uppercase flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-2" /> Authenticity Guarantee
                </h4>
                <p>
                  Every DRESSFEAT item is assigned a serialized authenticity certificate verifiable via NFC tag on the garment collar.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {isFaqOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-xl border border-neutral-300 shadow-2xl overflow-hidden">
            <div className="p-5 bg-neutral-900 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-amber-400 block">
                  Knowledge Base
                </span>
                <h3 className="text-sm font-extrabold uppercase tracking-wider">Frequently Asked Questions</h3>
              </div>
              <button onClick={() => setIsFaqOpen(false)}><X className="w-5 h-5 text-neutral-400 hover:text-white" /></button>
            </div>

            <div className="p-6 space-y-4 text-xs text-neutral-700 leading-relaxed max-h-[75vh] overflow-y-auto">
              <div className="space-y-1">
                <h4 className="font-bold text-neutral-900">How do DRESSFEAT oversized silhouettes fit?</h4>
                <p className="text-neutral-600">
                  Our graphic tees and outerwear feature deliberate drop-shoulder boxy cuts. We suggest taking your standard size for the intended fashion drape, or sizing down for a closer classic fit.
                </p>
              </div>

              <div className="space-y-1 pt-3 border-t border-neutral-100">
                <h4 className="font-bold text-neutral-900">What materials are used in the 2026 Collection?</h4>
                <p className="text-neutral-600">
                  We exclusively source Grade 6A Mulberry silk, Normandy raw flax linen, Super 120s Italian tropical wool, and 280 GSM combed organic cotton.
                </p>
              </div>

              <div className="space-y-1 pt-3 border-t border-neutral-100">
                <h4 className="font-bold text-neutral-900">How do I redeem my welcome discount?</h4>
                <p className="text-neutral-600">
                  Enter coupon code <strong>FEAT2026</strong> in your shopping bag to automatically deduct 15% from your subtotal.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
