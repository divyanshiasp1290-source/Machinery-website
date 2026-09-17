import React, { useState } from 'react';
import { 
  ChevronRight, 
  CheckCircle2, 
  LogOut, 
  ShoppingCart, 
  ExternalLink,
  Clock,
  Sparkles,
  KeyRound,
  MapPin,
  Plus,
  Trash2,
  AlertCircle,
  AlertTriangle,
  X,
  XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function AccountPage({ 
  profile, 
  onUpdateProfile, 
  orders, 
  onSelectProduct, 
  onAddToCart, 
  onNavigate 
}) {
  const { customer, customerAddresses, customerLogout, refreshCustomerProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: customer?.firstName || profile?.firstName || '',
    lastName: customer?.lastName || profile?.lastName || '',
    company: customer?.company || profile?.company || '',
    email: customer?.email || profile?.email || '',
    phone: customer?.phone || profile?.phone || '',
    address: customer?.address || profile?.address || '',
    city: customer?.city || profile?.city || '',
    postcode: customer?.postcode || profile?.postcode || ''
  });

  // Change Password State
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Address Modal State
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    postcode: '',
    isDefault: false
  });

  // Keep form data synced if customer or profile changes
  React.useEffect(() => {
    if (customer) {
      setFormData(prev => ({
        ...prev,
        firstName: customer.firstName || prev.firstName || '',
        lastName: customer.lastName || prev.lastName || '',
        company: customer.company !== undefined ? customer.company : (prev.company || ''),
        email: customer.email || prev.email || '',
        phone: customer.phone !== undefined ? customer.phone : (prev.phone || ''),
        address: customer.address !== undefined ? customer.address : (prev.address || ''),
        city: customer.city !== undefined ? customer.city : (prev.city || ''),
        postcode: customer.postcode !== undefined ? customer.postcode : (prev.postcode || '')
      }));
    } else if (profile) {
      setFormData(prev => ({
        ...prev,
        ...profile
      }));
    }
  }, [customer, profile]);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await api.customerAuth.updateProfile(formData);
      await refreshCustomerProfile();
      if (onUpdateProfile) {
        onUpdateProfile(formData);
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update profile: ' + (err.message || 'Please check your connection.'));
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMsg(null);
    try {
      await api.customerAuth.changePassword(passwordData);
      setPasswordMsg({ text: 'Password updated successfully.', isError: false });
      setPasswordData({ currentPassword: '', newPassword: '' });
      setTimeout(() => setShowPasswordChange(false), 1500);
    } catch (err) {
      setPasswordMsg({ text: err.message || 'Incorrect current password.', isError: true });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await api.customerAuth.addAddress(newAddress);
      await refreshCustomerProfile();
      setIsAddAddressOpen(false);
      setNewAddress({ addressLine1: '', addressLine2: '', city: '', postcode: '', isDefault: false });
    } catch (err) {
      alert('Failed to save address: ' + err.message);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.customerAuth.deleteAddress(id);
      await refreshCustomerProfile();
    } catch (err) {}
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await api.customerAuth.setDefaultAddress(id);
      await refreshCustomerProfile();
    } catch (err) {}
  };

  const [customerOrders, setCustomerOrders] = useState([]);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [customCancelReason, setCustomCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelToast, setCancelToast] = useState(null);

  const mapOrder = (o) => ({
    id: o.id,
    date: new Date(o.createdAt || o.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    status: o.status || 'Pending',
    cancellation_reason: o.cancellation_reason || (o.notes?.includes('[Cancellation Reason]: ') ? o.notes.split('[Cancellation Reason]: ')[1] : ''),
    total: typeof o.total === 'number' ? `£${o.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : (o.total || '£0.00'),
    product: o.items?.[0],
    productName: o.items?.[0]?.name,
    brand: o.items?.[0]?.brand,
    image: o.items?.[0]?.image,
    quantity: o.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 1,
    specs: o.items?.[0]?.specs || 'Industrial Additive Hardware'
  });

  const fetchOrders = () => {
    if (customer) {
      api.orders.customerList()
        .then(res => {
          const list = Array.isArray(res) ? res : (res?.orders || []);
          if (list.length > 0) {
            setCustomerOrders(list.map(mapOrder));
          } else {
            setCustomerOrders([]);
          }
        })
        .catch(() => {
          setCustomerOrders([]);
        });
    } else {
      setCustomerOrders([]);
    }
  };

  React.useEffect(() => {
    fetchOrders();
    const unsub = api.realtime?.subscribeOrders?.(() => {
      fetchOrders();
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [customer]);

  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    setIsCancelling(true);
    const finalReason = cancelReason === 'Other'
      ? (customCancelReason.trim() || 'Other reason')
      : cancelReason;

    try {
      await api.orders.cancel(cancellingOrder.id, finalReason);
      
      setCustomerOrders(prev => prev.map(o => 
        o.id === cancellingOrder.id 
          ? { ...o, status: 'Cancelled', cancellation_reason: finalReason }
          : o
      ));

      setCancelToast(`Order ${cancellingOrder.id} has been cancelled successfully.`);
      setTimeout(() => setCancelToast(null), 4000);
      setCancellingOrder(null);
      setCancelReason('Ordered by mistake');
      setCustomCancelReason('');
    } catch (err) {
      alert(err.message || 'Failed to cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'delivered' || s === 'completed') {
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    }
    if (s === 'cancelled') {
      return 'bg-red-50 text-red-700 border border-red-200';
    }
    if (s === 'shipped') {
      return 'bg-purple-50 text-purple-700 border border-purple-200';
    }
    if (s === 'processing') {
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    }
    return 'bg-amber-50 text-amber-700 border border-amber-200';
  };

  const displayedOrders = customerOrders || [];

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
            onClick={() => {
              customerLogout();
              onNavigate('home');
            }}
            className="px-4 py-2 bg-surface-100 hover:bg-surface-200 text-surface-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Profile Details Form, Security & Addresses (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Profile Form */}
            <div className="bg-white border border-surface-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
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

            {/* 2. Security & Password Change Card */}
            <div className="bg-white border border-surface-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-surface-200">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-brand-600" />
                  <h3 className="font-display font-bold text-base text-surface-900">
                    Security & Password
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 cursor-pointer"
                >
                  {showPasswordChange ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              {showPasswordChange ? (
                <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
                  {passwordMsg && (
                    <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                      passwordMsg.isError 
                        ? 'bg-red-50 border-red-200 text-red-700' 
                        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}>
                      {passwordMsg.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                      <span>{passwordMsg.text}</span>
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-surface-800 mb-1">Current Password</label>
                    <input
                      required
                      type="password"
                      placeholder="••••••••"
                      value={passwordData.currentPassword}
                      onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-surface-800 mb-1">New Password (min 6 chars)</label>
                    <input
                      required
                      type="password"
                      placeholder="••••••••"
                      value={passwordData.newPassword}
                      onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full py-2.5 bg-surface-900 hover:bg-surface-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {passwordLoading ? 'Updating Password...' : 'Update Password'}
                  </button>
                </form>
              ) : (
                <p className="text-xs text-surface-500">
                  Ensure your account credentials remain secure. Passwords must be at least 6 characters in length.
                </p>
              )}
            </div>

            {/* 3. Saved Delivery Addresses Card */}
            <div className="bg-white border border-surface-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-surface-200">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-600" />
                  <h3 className="font-display font-bold text-base text-surface-900">
                    Saved Delivery Addresses
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddAddressOpen(!isAddAddressOpen)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddAddressOpen ? 'Cancel' : 'Add New'}</span>
                </button>
              </div>

              {isAddAddressOpen && (
                <form onSubmit={handleAddAddress} className="space-y-3 p-4 bg-surface-50 border border-surface-200 rounded-xl text-xs">
                  <h4 className="font-bold text-surface-900">New Delivery Location</h4>
                  <div>
                    <label className="block font-bold text-surface-700 mb-1">Address Line 1 *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Unit 4, St. Andrews Industrial Park"
                      value={newAddress.addressLine1}
                      onChange={e => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                      className="w-full px-3 py-2 border border-surface-300 rounded-lg text-xs focus:outline-none focus:border-brand-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-surface-700 mb-1">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Workshop Bay 3"
                      value={newAddress.addressLine2}
                      onChange={e => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                      className="w-full px-3 py-2 border border-surface-300 rounded-lg text-xs focus:outline-none focus:border-brand-500 bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-surface-700 mb-1">City *</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Birmingham"
                        value={newAddress.city}
                        onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full px-3 py-2 border border-surface-300 rounded-lg text-xs focus:outline-none focus:border-brand-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-surface-700 mb-1">Postcode *</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. B45 9AG"
                        value={newAddress.postcode}
                        onChange={e => setNewAddress({ ...newAddress, postcode: e.target.value })}
                        className="w-full px-3 py-2 border border-surface-300 rounded-lg text-xs focus:outline-none focus:border-brand-500 bg-white uppercase"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-surface-700 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={newAddress.isDefault}
                      onChange={e => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span>Set as default delivery address</span>
                  </label>
                  <button
                    type="submit"
                    className="w-full py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                  >
                    Save Address
                  </button>
                </form>
              )}

              {customerAddresses && customerAddresses.length > 0 ? (
                <div className="space-y-2.5">
                  {customerAddresses.map(addr => (
                    <div 
                      key={addr.id}
                      className="p-3.5 border border-surface-200 rounded-xl flex items-start justify-between gap-3 text-xs bg-surface-50/50 hover:bg-surface-50"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-surface-900">{addr.addressLine1}</span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 bg-brand-100 text-brand-700 rounded text-[10px] font-bold">
                              Default
                            </span>
                          )}
                        </div>
                        {addr.addressLine2 && <p className="text-surface-600">{addr.addressLine2}</p>}
                        <p className="text-surface-600">{addr.city}, {addr.postcode}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-[11px] text-surface-500 hover:text-brand-600 font-semibold cursor-pointer"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-1 text-surface-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-surface-500">
                  No saved delivery addresses yet. Add your warehouse or engineering facility addresses for expedited checkout.
                </p>
              )}
            </div>

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
                {displayedOrders.length} Orders
              </span>
            </div>

            {(!displayedOrders || displayedOrders.length === 0) ? (
              <div className="text-center py-10 text-surface-500 text-xs">
                No recent orders found.
              </div>
            ) : (
              <div className="space-y-4">
                {displayedOrders.map((order) => {
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

                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${getStatusBadgeClass(order.status)}`}>
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
                      <div className="pt-2.5 border-t border-surface-200/60 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          {order.status === 'Cancelled' ? (
                            <div className="flex items-center gap-1.5 text-xs text-red-600 font-bold bg-red-50/80 border border-red-200/70 px-2.5 py-1 rounded-lg">
                              <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                              <span>Cancelled</span>
                              {order.cancellation_reason && (
                                <span className="text-[10px] text-surface-500 font-normal ml-0.5 max-w-[180px] truncate hidden sm:inline">
                                  ({order.cancellation_reason})
                                </span>
                              )}
                            </div>
                          ) : (order.status !== 'Delivered' && order.status !== 'Completed') ? (
                            <button
                              type="button"
                              onClick={() => setCancellingOrder(order)}
                              className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 font-bold text-[11px] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                              title="Cancel this order"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Cancel Order</span>
                            </button>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-2">
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

      {/* Order Cancellation Confirmation Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 bg-surface-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-surface-200 overflow-hidden text-left animate-scale-up">
            {/* Modal Header */}
            <div className="bg-red-600 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-white shrink-0" />
                <h3 className="font-display font-bold text-sm">Cancel Equipment Order</h3>
              </div>
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                disabled={isCancelling}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-red-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-surface-50 border border-surface-200 rounded-xl space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-surface-500 font-semibold">Order Reference:</span>
                  <span className="font-mono font-bold text-surface-900">{cancellingOrder.id}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-surface-500 font-semibold">Item:</span>
                  <span className="font-bold text-surface-800 truncate max-w-[200px]">{cancellingOrder.productName || cancellingOrder.product?.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-surface-500 font-semibold">Order Total:</span>
                  <span className="font-black text-surface-900">{cancellingOrder.total}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-surface-800 text-[11px]">
                  Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-surface-300 rounded-xl text-xs font-medium focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Need to change delivery address or company details">Need to change delivery address or company details</option>
                  <option value="Found alternative equipment or procurement timeline">Found alternative equipment or procurement timeline</option>
                  <option value="Project specifications altered">Project specifications altered</option>
                  <option value="Order placed duplicate">Order placed duplicate</option>
                  <option value="Other">Other reason (specify below)</option>
                </select>

                {cancelReason === 'Other' && (
                  <input
                    type="text"
                    placeholder="Please specify reason..."
                    value={customCancelReason}
                    onChange={(e) => setCustomCancelReason(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 border border-surface-300 rounded-xl text-xs focus:outline-none focus:border-red-500"
                  />
                )}
              </div>

              <p className="text-[11px] text-surface-500 leading-relaxed">
                Are you sure you want to cancel this order? Once confirmed, logistics allocation will be terminated, and your order status will be updated immediately.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-surface-100">
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
                  disabled={isCancelling}
                  className="px-4 py-2.5 bg-surface-100 hover:bg-surface-200 text-surface-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  No, Keep Order
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isCancelling ? (
                    <span>Cancelling...</span>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>Confirm Cancellation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {cancelToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface-900 text-white px-4 py-3 rounded-xl shadow-card-hover flex items-center gap-2.5 text-xs font-semibold animate-fade-in border border-surface-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{cancelToast}</span>
        </div>
      )}
    </div>
  );
}
