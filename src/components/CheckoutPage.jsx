import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2, 
  CreditCard, 
  Building, 
  Lock,
  Tag,
  AlertCircle,
  Sparkles,
  X
} from 'lucide-react';
import { api } from '../services/api';

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
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState(null);

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  
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

  // Load active coupons from Supabase & subscribe to realtime changes
  const loadCoupons = async () => {
    try {
      const res = await api.coupons.list();
      if (res?.coupons) {
        setAvailableCoupons(res.coupons);
      }
    } catch (err) {
      console.warn('Could not load available coupons:', err);
    }
  };

  useEffect(() => {
    loadCoupons();
    const unsub = api.realtime.subscribeCoupons(() => {
      loadCoupons();
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Subtotal calculation
  const directSubtotal = cartItems.reduce((sum, item) => {
    if (!item.quoteOnly && item.price) {
      return sum + (item.price * item.quantity);
    }
    return sum;
  }, 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = (directSubtotal * appliedCoupon.discountValue) / 100;
    } else {
      discountAmount = Math.min(appliedCoupon.discountValue, directSubtotal);
    }
  }

  const total = Math.max(0, directSubtotal - discountAmount);

  const applyCouponCode = async (codeToApply) => {
    const trimmed = (codeToApply || '').trim();
    if (!trimmed) return;
    setCouponCode(trimmed);
    setCouponLoading(true);
    setCouponMsg(null);

    try {
      const res = await api.coupons.validate(trimmed, directSubtotal);
      setAppliedCoupon(res);
      setCouponMsg({ text: res.message, isError: false });
    } catch (err) {
      setAppliedCoupon(null);
      setCouponMsg({ text: err.message || 'Invalid promotional code.', isError: true });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleApplyCoupon = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    await applyCouponCode(couponCode);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponMsg(null);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setOrderError(null);
    setOrderSubmitting(true);

    try {
      const orderPayload = {
        customerEmail: formData.email,
        customerName: `${formData.firstName} ${formData.lastName}`.trim(),
        customerPhone: formData.phone,
        company: formData.company,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          company: formData.company,
          address: formData.address,
          city: formData.city,
          postcode: formData.postcode,
          country: 'United Kingdom'
        },
        billingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          company: formData.company,
          address: formData.address,
          city: formData.city,
          postcode: formData.postcode,
          country: 'United Kingdom'
        },
        cartItems: cartItems.map(item => ({
          id: item.id,
          quantity: item.quantity
        })),
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        paymentMethod: formData.paymentMethod,
        poNumber: formData.poNumber
      };

      const res = await api.orders.create(orderPayload);
      const created = res.order;

      setOrderRef(created.id);
      setOrderPlaced(true);

      if (onClearCart) {
        onClearCart();
      }

      if (onOrderPlaced) {
        onOrderPlaced({
          id: created.id,
          date: new Date(created.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: created.status,
          total: `£${(created.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          items: created.items,
          product: created.items?.[0],
          productName: created.items?.[0]?.name,
          brand: created.items?.[0]?.brand,
          image: created.items?.[0]?.image,
          quantity: created.items?.reduce((s, i) => s + i.quantity, 0) || 1,
          specs: created.items?.[0]?.specs || 'Industrial Additive Hardware'
        });
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setOrderError(err.message || 'Failed to place order. Please verify your details.');
    } finally {
      setOrderSubmitting(false);
    }
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

                {/* Promotional Code & Available Coupons */}
                <div className="pt-3 border-t border-surface-200 space-y-3">
                  {appliedCoupon ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 flex-wrap">
                            <span>Code</span>
                            <span className="font-mono bg-emerald-100/80 px-1.5 py-0.5 rounded text-emerald-800 tracking-wider">
                              {appliedCoupon.code}
                            </span>
                            <span>Applied!</span>
                          </div>
                          <div className="text-[11px] text-emerald-700 font-medium">
                            {appliedCoupon.discountType === 'percentage'
                              ? `${appliedCoupon.discountValue}% discount applied`
                              : `£${appliedCoupon.discountValue} discount applied`}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="px-2 py-1 text-xs font-bold text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                        title="Remove coupon"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Promo / Coupon code"
                          value={couponCode}
                          onChange={e => setCouponCode(e.target.value)}
                          className="flex-1 px-3 py-2 border border-surface-300 rounded-xl text-xs uppercase font-mono focus:outline-none focus:border-brand-500"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="px-3.5 py-2 bg-surface-900 hover:bg-brand-600 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {couponLoading ? '...' : 'Apply'}
                        </button>
                      </div>
                      {couponMsg && (
                        <div className={`mt-2 text-[11px] font-semibold ${couponMsg.isError ? 'text-red-600' : 'text-emerald-700'}`}>
                          {couponMsg.text}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Available Coupons List */}
                  {availableCoupons.length > 0 && (
                    <div className="bg-surface-50 border border-surface-200 rounded-xl p-3 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-surface-800">
                        <div className="flex items-center gap-1.5 text-brand-700">
                          <Tag className="w-3.5 h-3.5 text-brand-600" />
                          <span>Available Offers &amp; Coupons</span>
                        </div>
                        <span className="text-[10px] text-surface-500 font-normal">{availableCoupons.length} active</span>
                      </div>

                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {availableCoupons.map((cp) => {
                          const isEligible = !cp.minOrderAmount || directSubtotal >= cp.minOrderAmount;
                          const isCurrent = appliedCoupon?.code === cp.code;

                          return (
                            <div
                              key={cp.id}
                              className={`p-2.5 rounded-lg border transition-all text-xs flex items-center justify-between gap-2.5 ${
                                isCurrent
                                  ? 'bg-emerald-50 border-emerald-300'
                                  : isEligible
                                  ? 'bg-white hover:border-brand-300 border-surface-200 shadow-2xs'
                                  : 'bg-white/60 border-surface-200 opacity-70'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono font-black text-xs text-brand-600 tracking-wider">
                                    {cp.code}
                                  </span>
                                  <span className="px-1.5 py-0.2 bg-brand-50 text-brand-700 font-bold text-[10px] rounded border border-brand-100">
                                    {cp.discountType === 'percentage' ? `${cp.discountValue}% OFF` : `Save £${cp.discountValue}`}
                                  </span>
                                </div>
                                <div className="text-[11px] text-surface-500 mt-1">
                                  {cp.minOrderAmount > 0 ? (
                                    isEligible ? (
                                      <span className="text-emerald-700 font-medium">✓ Min. spend £{cp.minOrderAmount.toLocaleString()} met</span>
                                    ) : (
                                      <span className="text-amber-700 font-medium">
                                        Add £{(cp.minOrderAmount - directSubtotal).toFixed(2)} more to unlock
                                      </span>
                                    )
                                  ) : (
                                    <span>No minimum spend required</span>
                                  )}
                                </div>
                              </div>

                              <div className="shrink-0">
                                {isCurrent ? (
                                  <button
                                    type="button"
                                    onClick={handleRemoveCoupon}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-red-600 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                                    title="Click to remove"
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Applied</span>
                                  </button>
                                ) : isEligible ? (
                                  <button
                                    type="button"
                                    onClick={() => applyCouponCode(cp.code)}
                                    disabled={couponLoading}
                                    className="px-3 py-1 bg-surface-900 hover:bg-brand-600 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                                  >
                                    Apply
                                  </button>
                                ) : (
                                  <span className="text-[10px] font-semibold text-surface-400 bg-surface-100 border border-surface-200 px-2 py-1 rounded-lg">
                                    Min £{cp.minOrderAmount}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Breakdown */}
                <div className="pt-3 border-t border-surface-200 space-y-2 text-xs">
                  <div className="flex justify-between text-surface-600">
                    <span>Subtotal:</span>
                    <span>£{directSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  {appliedCoupon && discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Discount ({appliedCoupon.code}):</span>
                      <span>-£{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-surface-200 flex justify-between text-lg font-black text-surface-900">
                    <span>Total:</span>
                    <span className="text-brand-600">
                      £{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {orderError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{orderError}</span>
                  </div>
                )}

                {/* Submit Order Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={orderSubmitting}
                    className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    <span>{orderSubmitting ? 'Placing Order...' : 'Place Verified Order'}</span>
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
