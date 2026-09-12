import React, { useState } from 'react';
import { 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2, 
  CreditCard, 
  Building, 
  Lock
} from 'lucide-react';

export default function CheckoutPage({ 
  cartItems, 
  onClearCart, 
  onNavigate,
  onSelectProduct,
  userProfile,
  onOrderPlaced
}) {
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderRef, setOrderRef] = useState('');
  
  // Clean checkout form state initialized with userProfile autofill
  const [formData, setFormData] = useState({
    firstName: userProfile?.firstName || '',
    lastName: userProfile?.lastName || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    company: userProfile?.company || '',
    address: userProfile?.address || '',
    city: userProfile?.city || '',
    postcode: userProfile?.postcode || '',
    paymentMethod: 'card', // 'card' | 'invoice'
    poNumber: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: ''
  });

  // Sync autofill when userProfile updates
  React.useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        firstName: userProfile.firstName ?? prev.firstName,
        lastName: userProfile.lastName ?? prev.lastName,
        email: userProfile.email ?? prev.email,
        phone: userProfile.phone ?? prev.phone,
        company: userProfile.company ?? prev.company,
        address: userProfile.address ?? prev.address,
        city: userProfile.city ?? prev.city,
        postcode: userProfile.postcode ?? prev.postcode,
      }));
    }
  }, [userProfile]);

  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Subtotal calculation
  const directSubtotal = cartItems.reduce((sum, item) => {
    if (!item.quoteOnly && item.price) {
      return sum + (item.price * item.quantity);
    }
    return sum;
  }, 0);

  const total = directSubtotal;

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    const reference = 'F3D-ORD-' + Math.floor(100000 + Math.random() * 900000);
    setOrderRef(reference);
    setOrderPlaced(true);

    if (onOrderPlaced) {
      cartItems.forEach((item, idx) => {
        onOrderPlaced({
          id: idx === 0 ? reference : `${reference}-${idx + 1}`,
          date: 'Today',
          status: 'Processing',
          total: item.price ? `£${(item.price * item.quantity).toLocaleString()}` : 'Custom Order',
          product: item,
          productName: item.name,
          brand: item.brand,
          image: (item.images && item.images[0]) || item.image,
          quantity: item.quantity,
          specs: item.shortSpecs ? Object.values(item.shortSpecs).slice(0, 2).join(' • ') : 'Standard Specification'
        });
      });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteAndExit = () => {
    onClearCart();
    onNavigate('account');
  };

  return (
    <div className="bg-surface-50 min-h-screen py-8 sm:py-12 text-left">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-surface-200">
          <div className="flex items-center gap-2 text-xs text-surface-500">
            <button 
              onClick={() => onNavigate('home')} 
              className="hover:text-brand-600 transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
            <button 
              onClick={() => onNavigate('cart')} 
              className="hover:text-brand-600 transition-colors cursor-pointer"
            >
              Cart
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
            <span className="font-semibold text-surface-900">Checkout</span>
          </div>

          <button
            onClick={() => onNavigate('cart')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-surface-600 hover:text-brand-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Cart</span>
          </button>
        </nav>

        {/* Header Title */}
        <div className="mb-8">
          <h1 className="font-display font-black text-3xl sm:text-4xl text-surface-900 tracking-tight">
            Checkout
          </h1>
        </div>

        {orderPlaced ? (
          /* Order Placed Success Confirmation */
          <div className="bg-white border border-surface-200 rounded-2xl p-8 sm:p-14 text-center max-w-2xl mx-auto shadow-xs space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-brand-50 text-brand-700 font-mono text-xs font-bold rounded-md border border-brand-200">
                Order Number: {orderRef}
              </span>
              <h2 className="font-display font-black text-2xl text-surface-900">
                Order Placed Successfully
              </h2>
              <p className="text-sm text-surface-600 max-w-md mx-auto leading-relaxed">
                Thank you for your order, <strong className="text-surface-900">{formData.firstName} {formData.lastName}</strong>. Confirmation has been sent to <strong className="text-surface-900">{formData.email}</strong>.
              </p>
            </div>

            {/* Order Details Card */}
            <div className="bg-surface-50 border border-surface-200 rounded-xl p-5 text-xs text-left max-w-md mx-auto space-y-2.5">
              <div className="flex justify-between py-1 border-b border-surface-200/60">
                <span className="text-surface-500">Company:</span>
                <span className="font-bold text-surface-900">{formData.company || 'Direct Order'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-200/60">
                <span className="text-surface-500">Delivery Address:</span>
                <span className="font-bold text-surface-900 text-right max-w-[220px]">
                  {formData.address}, {formData.city}, {formData.postcode}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-surface-500">Total:</span>
                <span className="font-bold text-brand-600 text-sm">
                  £{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <button
                onClick={handleCompleteAndExit}
                className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                View in Account
              </button>

              <button
                onClick={() => {
                  onClearCart();
                  onNavigate('catalog');
                }}
                className="px-6 py-2.5 bg-surface-100 hover:bg-surface-200 text-surface-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          /* Empty Checkout Fallback */
          <div className="bg-white border border-surface-200 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4">
            <h2 className="font-display font-bold text-xl text-surface-900">Your Cart is Empty</h2>
            <p className="text-xs text-surface-600">Please add products to your cart before proceeding to checkout.</p>
            <button
              onClick={() => onNavigate('catalog')}
              className="px-6 py-2.5 bg-brand-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-brand-600"
            >
              Browse Products
            </button>
          </div>
        ) : (
          /* Main Checkout Grid */
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* Left Column: Form Details (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Contact Information */}
              <div className="bg-white border border-surface-200 rounded-2xl p-4 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-surface-200">
                  <h3 className="font-display font-bold text-base text-surface-900">
                    Contact Information
                  </h3>
                  {userProfile?.firstName && (
                    <span className="px-2.5 py-0.5 bg-brand-50 border border-brand-200 text-brand-700 rounded-full font-bold text-[10px] tracking-wide">
                      Autofilled from Profile
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-surface-800 mb-1">First Name *</label>
                    <input 
                      required
                      type="text"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2.5 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-surface-800 mb-1">Last Name *</label>
                    <input 
                      required
                      type="text"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2.5 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-surface-800 mb-1">Company *</label>
                    <input 
                      required
                      type="text"
                      placeholder="Company name"
                      value={formData.company}
                      onChange={e => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-3 py-2.5 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-surface-800 mb-1">Phone *</label>
                    <input 
                      required
                      type="tel"
                      placeholder="Phone number"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2.5 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-surface-800 mb-1">Email Address *</label>
                    <input 
                      required
                      type="email"
                      placeholder="email@company.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2.5 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white border border-surface-200 rounded-2xl p-4 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-surface-200">
                  <h3 className="font-display font-bold text-base text-surface-900">
                    Delivery Address
                  </h3>
                  {userProfile?.address && (
                    <span className="px-2.5 py-0.5 bg-brand-50 border border-brand-200 text-brand-700 rounded-full font-bold text-[10px] tracking-wide">
                      Autofilled from Profile
                    </span>
                  )}
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-surface-800 mb-1">Address *</label>
                    <input 
                      required
                      type="text"
                      placeholder="Street address or facility"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2.5 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-surface-800 mb-1">City *</label>
                      <input 
                        required
                        type="text"
                        placeholder="City"
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3 py-2.5 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-surface-800 mb-1">Postcode *</label>
                      <input 
                        required
                        type="text"
                        placeholder="Postcode"
                        value={formData.postcode}
                        onChange={e => setFormData({ ...formData, postcode: e.target.value })}
                        className="w-full px-3 py-2.5 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500 uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white border border-surface-200 rounded-2xl p-4 sm:p-7 shadow-xs space-y-4">
                <h3 className="font-display font-bold text-base text-surface-900 pb-3 border-b border-surface-200">
                  Payment Method
                </h3>

                <div className="space-y-3 text-xs">
                  {/* Card Payment */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    formData.paymentMethod === 'card' ? 'border-brand-500 bg-brand-50/15' : 'border-surface-200'
                  }`}>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        checked={formData.paymentMethod === 'card'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'card' })}
                        className="text-brand-500 focus:ring-brand-500"
                      />
                      <span className="font-bold text-surface-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-brand-600" />
                        <span>Credit / Debit Card</span>
                      </span>
                    </label>

                    {formData.paymentMethod === 'card' && (
                      <div className="mt-3 pt-3 border-t border-surface-200/60 space-y-3">
                        <div>
                          <label className="block font-bold text-surface-700 mb-1">Card Number *</label>
                          <input 
                            required
                            type="text"
                            placeholder="•••• •••• •••• ••••"
                            value={formData.cardNumber}
                            onChange={e => setFormData({ ...formData, cardNumber: e.target.value })}
                            className="w-full sm:w-80 px-3 py-2 border border-surface-300 rounded-lg text-xs bg-white font-mono"
                          />
                        </div>
                        <div className="flex gap-3">
                          <div>
                            <label className="block font-bold text-surface-700 mb-1">Expiry *</label>
                            <input 
                              required
                              type="text"
                              placeholder="MM/YY"
                              value={formData.cardExpiry}
                              onChange={e => setFormData({ ...formData, cardExpiry: e.target.value })}
                              className="w-24 px-3 py-2 border border-surface-300 rounded-lg text-xs bg-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-surface-700 mb-1">CVC *</label>
                            <input 
                              required
                              type="text"
                              placeholder="CVC"
                              value={formData.cardCvc}
                              onChange={e => setFormData({ ...formData, cardCvc: e.target.value })}
                              className="w-20 px-3 py-2 border border-surface-300 rounded-lg text-xs bg-white font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Purchase Order */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    formData.paymentMethod === 'invoice' ? 'border-brand-500 bg-brand-50/15' : 'border-surface-200'
                  }`}>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        checked={formData.paymentMethod === 'invoice'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'invoice' })}
                        className="text-brand-500 focus:ring-brand-500"
                      />
                      <span className="font-bold text-surface-900 flex items-center gap-2">
                        <Building className="w-4 h-4 text-brand-600" />
                        <span>Purchase Order (PO)</span>
                      </span>
                    </label>

                    {formData.paymentMethod === 'invoice' && (
                      <div className="mt-3 pt-3 border-t border-surface-200/60 pl-6">
                        <label className="block font-bold text-surface-700 mb-1">PO Number *</label>
                        <input 
                          required
                          type="text"
                          value={formData.poNumber}
                          onChange={e => setFormData({ ...formData, poNumber: e.target.value })}
                          className="w-full sm:w-72 px-3 py-2 border border-surface-300 rounded-lg text-xs bg-white font-mono"
                          placeholder="e.g. PO-8921"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Order Summary & Place Order Button (4 cols) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              
              <div className="bg-white border border-surface-200 rounded-2xl p-4 sm:p-7 shadow-xs space-y-5">
                <h3 className="font-display font-bold text-lg text-surface-900 pb-3 border-b border-surface-200 flex justify-between items-center">
                  <span>Order Summary</span>
                  <span className="text-xs text-surface-500 font-normal">{totalItemCount} items</span>
                </h3>

                {/* Items Mini List */}
                <div className="max-h-60 overflow-y-auto divide-y divide-surface-100 space-y-2 pr-1">
                  {cartItems.map((item) => (
                    <div key={item.id} className="pt-2 first:pt-0 flex items-center gap-3 text-xs">
                      <img 
                        src={item.images ? item.images[0] : item.image} 
                        alt={item.name} 
                        className="w-12 h-12 object-contain bg-surface-50 rounded border border-surface-200 p-1 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-surface-900 line-clamp-2 leading-snug break-words">{item.name}</div>
                        <div className="text-[11px] text-surface-500">Qty: {item.quantity}</div>
                      </div>
                      <div className="font-bold text-surface-900 shrink-0">
                        {item.quoteOnly ? 'Quote' : `£${(item.price * item.quantity).toLocaleString()}`}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Breakdown */}
                <div className="pt-3 border-t border-surface-200 space-y-2.5 text-xs">
                  <div className="flex justify-between text-lg font-black text-surface-900">
                    <span>Total:</span>
                    <span className="text-brand-600">
                      £{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Submit Order Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>Place Order</span>
                  </button>
                </div>
              </div>

            </div>

          </form>
        )}

      </div>
    </div>
  );
}
