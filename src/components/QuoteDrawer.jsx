import React, { useState } from 'react';
import { 
  X, 
  ShoppingCart, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Building, 
  User, 
  Mail, 
  Phone,
  Send
} from 'lucide-react';

export default function QuoteDrawer({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart 
}) {
  if (!isOpen) return null;

  const [rfqSubmitted, setRfqSubmitted] = useState(false);
  const [rfqRef, setRfqRef] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    vatNumber: '',
    notes: '',
    requireInstallation: true,
    requireTraining: true
  });

  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate subtotal for direct items
  const directSubtotal = cartItems.reduce((sum, item) => {
    if (!item.quoteOnly && item.price) {
      return sum + (item.price * item.quantity);
    }
    return sum;
  }, 0);

  const hasQuoteOnlyItems = cartItems.some(item => item.quoteOnly);

  const handleSubmitRFQ = (e) => {
    e.preventDefault();
    const reference = 'F3D-' + Math.floor(100000 + Math.random() * 900000);
    setRfqRef(reference);
    setRfqSubmitted(true);
  };

  const handleFinish = () => {
    setRfqSubmitted(false);
    onClearCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between text-left">
          
          {/* Header */}
          <div className="p-6 bg-surface-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-brand-500" />
              <div>
                <h3 className="font-display font-bold text-base">
                  Equipment Quotation &amp; Cart
                </h3>
                <span className="text-xs text-surface-400">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} selected
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-full text-surface-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {rfqSubmitted ? (
              /* Success confirmation state */
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h4 className="font-display font-bold text-xl text-surface-900">
                  Quotation Request Dispatched!
                </h4>

                <div className="p-3 bg-surface-50 rounded-lg border border-surface-200 inline-block font-mono text-xs font-bold text-brand-700">
                  Ref: {rfqRef}
                </div>

                <p className="text-xs text-surface-600 leading-relaxed max-w-xs mx-auto">
                  Thank you, <span className="font-bold">{formData.name}</span>. An authorized technical application engineer from our West Midlands center will prepare your formal commercial quote and reach out within 2 business hours.
                </p>

                <div className="pt-4">
                  <button
                    onClick={handleFinish}
                    className="w-full py-3 bg-surface-900 hover:bg-surface-800 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors"
                  >
                    Return to Store
                  </button>
                </div>
              </div>
            ) : cartItems.length > 0 ? (
              /* Items List */
              <>
                <div className="space-y-4 divide-y divide-surface-100">
                  {cartItems.map(item => (
                    <div key={item.id} className="pt-4 first:pt-0 flex items-start gap-4">
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-16 h-16 object-contain rounded bg-surface-50 p-1 border border-surface-200 flex-shrink-0"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-brand-600 uppercase">
                          {item.brand}
                        </span>
                        <h5 className="font-bold text-xs text-surface-900 line-clamp-2 leading-snug break-words">
                          {item.name}
                        </h5>

                        <div className="text-xs font-semibold mt-1">
                          {item.quoteOnly ? (
                            <span className="text-brand-600 font-bold">RFQ Quoted</span>
                          ) : (
                            <span className="text-surface-900">
                              {item.currency}{(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border border-surface-200 rounded text-xs">
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-0.5 text-surface-600 hover:bg-surface-100 font-bold"
                            >
                              -
                            </button>
                            <span className="px-2 py-0.5 font-semibold text-surface-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-0.5 text-surface-600 hover:bg-surface-100 font-bold"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-surface-400 hover:text-red-500 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* RFQ Submission Details Form */}
                <form id="rfq-form" onSubmit={handleSubmitRFQ} className="pt-6 border-t border-surface-200 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-surface-700">
                    Business Quotation Contact
                  </h4>

                  <div>
                    <label className="block text-[11px] font-semibold text-surface-600 mb-1">
                      Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Mark Turner"
                      className="w-full p-2 bg-surface-50 border border-surface-300 rounded text-xs focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-surface-600 mb-1">
                        Company Name *
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="e.g. Apex Precision Ltd"
                        className="w-full p-2 bg-surface-50 border border-surface-300 rounded text-xs focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-surface-600 mb-1">
                        Phone *
                      </label>
                      <input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+44 7123 456789"
                        className="w-full p-2 bg-surface-50 border border-surface-300 rounded text-xs focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-surface-600 mb-1">
                      Business Email *
                    </label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="mark@apexprecision.co.uk"
                      className="w-full p-2 bg-surface-50 border border-surface-300 rounded text-xs focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-surface-600 mb-1">
                      Project Notes / Delivery Requirements
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Required delivery dates, power supply, specific material test requirements..."
                      className="w-full p-2 bg-surface-50 border border-surface-300 rounded text-xs focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div className="space-y-1.5 pt-1 text-[11px] text-surface-600">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.requireInstallation}
                        onChange={(e) => setFormData({ ...formData, requireInstallation: e.target.checked })}
                        className="rounded text-brand-500 focus:ring-brand-500"
                      />
                      <span>Include UK engineer onsite installation</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.requireTraining}
                        onChange={(e) => setFormData({ ...formData, requireTraining: e.target.checked })}
                        className="rounded text-brand-500 focus:ring-brand-500"
                      />
                      <span>Include staff operational training &amp; SLA</span>
                    </label>
                  </div>
                </form>
              </>
            ) : (
              /* Empty Cart State */
              <div className="text-center py-12 text-surface-500 space-y-3">
                <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mx-auto text-surface-400">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-surface-800">
                  Your quotation tray is currently empty
                </h4>
                <p className="text-xs text-surface-400 max-w-xs mx-auto">
                  Browse our 3D printers, LFAM systems, or materials catalogue to add machines to your technical bill of materials.
                </p>
              </div>
            )}
          </div>

          {/* Footer Checkout / RFQ Submit Action */}
          {!rfqSubmitted && cartItems.length > 0 && (
            <div className="p-6 bg-surface-50 border-t border-surface-200 space-y-4">
              {/* Financial summary */}
              {directSubtotal > 0 && (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-surface-600 font-bold">
                    <span>Direct Items Total:</span>
                    <span className="font-semibold text-surface-900">
                      £{directSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              {hasQuoteOnlyItems && (
                <div className="p-2.5 bg-brand-50 rounded border border-brand-200 text-[11px] text-brand-800 font-medium">
                  Includes production machines requiring custom logistics &amp; commercial quotation.
                </div>
              )}

              <button
                type="submit"
                form="rfq-form"
                className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Official RFQ Request</span>
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-surface-500">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                <span>Zero purchase obligation • Full technical assessment</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
