import React, { useState } from 'react';
import { 
  ChevronRight, 
  CheckCircle2, 
  LogOut, 
  ShoppingCart, 
  ExternalLink,
  Clock,
  Sparkles
} from 'lucide-react';

export default function AccountPage({ 
  profile, 
  onUpdateProfile, 
  orders, 
  onSelectProduct, 
  onAddToCart, 
  onNavigate 
}) {
  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    company: profile?.company || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    postcode: profile?.postcode || ''
  });

  // Keep form data synced if profile changes externally
  React.useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        ...profile
      }));
    }
  }, [profile]);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile(formData);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="bg-surface-50 min-h-screen py-8 sm:py-12 text-left">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs Navigation */}
        <nav className="flex items-center gap-2 text-xs text-surface-500 mb-6">
          <button 
            onClick={() => onNavigate('home')} 
            className="hover:text-brand-600 transition-colors cursor-pointer"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
          <span className="font-semibold text-surface-900">My Account</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-surface-900 tracking-tight">
              My Account
            </h1>
            <p className="text-xs text-surface-500 mt-1">
              Welcome back, <strong className="text-surface-800">{formData.firstName} {formData.lastName}</strong> ({formData.email})
            </p>
          </div>

          <button
            onClick={() => onNavigate('home')}
            className="px-4 py-2 bg-surface-100 hover:bg-surface-200 text-surface-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Profile Details Form (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-surface-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="pb-3 border-b border-surface-200 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-surface-900">
                  Profile Details
                </h3>
                <p className="text-[11px] text-surface-500">
                  These details will automatically autofill on the checkout page.
                </p>
              </div>
            </div>

            {savedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Profile saved! Checkout page will now autofill with these details.</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-surface-800 mb-1">First Name</label>
                  <input 
                    type="text"
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-surface-800 mb-1">Last Name</label>
                  <input 
                    type="text"
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-surface-800 mb-1">Company</label>
                <input 
                  type="text"
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-surface-800 mb-1">Email</label>
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-surface-800 mb-1">Phone</label>
                  <input 
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-surface-800 mb-1">Address</label>
                <input 
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-surface-800 mb-1">City</label>
                  <input 
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-surface-800 mb-1">Postcode</label>
                  <input 
                    type="text"
                    value={formData.postcode}
                    onChange={e => setFormData({ ...formData, postcode: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500 uppercase"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  Save Profile Details
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Recent Orders with Product Details & Images (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-surface-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="pb-3 border-b border-surface-200 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-surface-900">
                  Recent Orders
                </h3>
                <p className="text-[11px] text-surface-500">
                  Detailed history of equipment and materials ordered.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-surface-100 text-surface-700 rounded-full text-xs font-bold">
                {orders?.length || 0} Orders
              </span>
            </div>

            {(!orders || orders.length === 0) ? (
              <div className="text-center py-10 text-surface-500 text-xs">
                No recent orders found.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const product = order.product || {};
                  const productImage = order.image || (product.images ? product.images[0] : product.image);
                  const productName = order.productName || product.name || order.item;
                  const productBrand = order.brand || product.brand;

                  return (
                    <div 
                      key={order.id} 
                      className="p-4 sm:p-5 rounded-xl border border-surface-200 bg-surface-50/50 space-y-3 transition-all hover:bg-white hover:shadow-xs"
                    >
                      {/* Order Header Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-surface-200/60 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-surface-900 text-sm">
                            {order.id}
                          </span>
                          <span className="text-surface-400">• {order.date}</span>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          order.status === 'Delivered' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      {/* Product Details Row with Image */}
                      <div className="flex items-start gap-4 pt-1">
                        {/* Product Image */}
                        <div 
                          onClick={() => {
                            if (product && onSelectProduct) {
                              onSelectProduct(product);
                              onNavigate('product-detail');
                            }
                          }}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white border border-surface-200 p-2 flex items-center justify-center shrink-0 cursor-pointer hover:border-brand-500 transition-colors"
                        >
                          <img 
                            src={productImage} 
                            alt={productName}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0 text-xs space-y-1">
                          {productBrand && (
                            <span className="font-bold text-[10px] text-brand-600 uppercase tracking-wider block">
                              {productBrand}
                            </span>
                          )}

                          <h4 
                            onClick={() => {
                              if (product && onSelectProduct) {
                                onSelectProduct(product);
                                onNavigate('product-detail');
                              }
                            }}
                            className="font-display font-bold text-sm sm:text-base text-surface-900 hover:text-brand-600 transition-colors cursor-pointer line-clamp-2 leading-snug"
                          >
                            {productName}
                          </h4>

                          {order.specs ? (
                            <div className="text-[11px] text-surface-500">
                              Specs: <span className="font-semibold text-surface-700">{order.specs}</span>
                            </div>
                          ) : product.shortSpecs?.buildVolume ? (
                            <div className="text-[11px] text-surface-500">
                              Volume: <span className="font-semibold text-surface-700">{product.shortSpecs.buildVolume}</span>
                            </div>
                          ) : null}

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-surface-500">
                              Qty: <strong className="text-surface-900">{order.quantity || 1}</strong>
                            </span>
                            <span className="font-black text-surface-900 text-sm">
                              {order.total}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2.5 border-t border-surface-200/60 flex items-center justify-end gap-2">
                        {product && product.id && (
                          <button
                            onClick={() => {
                              if (onSelectProduct) onSelectProduct(product);
                              onNavigate('product-detail');
                            }}
                            className="px-3 py-1.5 bg-white border border-surface-200 hover:border-surface-300 text-surface-700 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                          >
                            View Product
                          </button>
                        )}

                        {product && product.id && onAddToCart && (
                          <button
                            onClick={() => {
                              onAddToCart(product, 1);
                              onNavigate('cart');
                            }}
                            className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Buy Again</span>
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-4 border-t border-surface-100">
              <button
                onClick={() => onNavigate('catalog')}
                className="w-full py-2.5 bg-surface-100 hover:bg-surface-200 text-surface-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer text-center"
              >
                Browse Equipment Catalogue
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
