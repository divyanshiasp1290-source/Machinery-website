import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ShoppingCart, 
  Users, 
  FileText, 
  Star, 
  MessageSquare, 
  Ticket, 
  ShieldAlert, 
  LogOut, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  Eye, 
  EyeOff,
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ExternalLink,
  Download,
  Save,
  Clock,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Building,
  UploadCloud,
  RefreshCw,
  Quote,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { getRatingConfig } from '../ProductDetailPage';

// Status Badge / Select Color Helpers
const getOrderStatusBadge = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'cancelled') {
    return 'bg-red-50 text-red-700 border-red-200';
  }
  if (s === 'delivered' || s === 'completed') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (s === 'shipped') {
    return 'bg-purple-50 text-purple-700 border-purple-200';
  }
  if (s === 'processing') {
    return 'bg-blue-50 text-blue-700 border-blue-200';
  }
  if (s === 'confirmed') {
    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }
  if (s === 'pending') {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  return 'bg-surface-100 text-surface-700 border-surface-200';
};

const getOrderStatusSelectClass = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'cancelled') {
    return 'bg-red-50 text-red-700 border-red-300 focus:ring-red-400';
  }
  if (s === 'delivered' || s === 'completed') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-300 focus:ring-emerald-400';
  }
  if (s === 'shipped') {
    return 'bg-purple-50 text-purple-700 border-purple-300 focus:ring-purple-400';
  }
  if (s === 'processing') {
    return 'bg-blue-50 text-blue-700 border-blue-300 focus:ring-blue-400';
  }
  if (s === 'confirmed') {
    return 'bg-indigo-50 text-indigo-700 border-indigo-300 focus:ring-indigo-400';
  }
  if (s === 'pending') {
    return 'bg-amber-50 text-amber-700 border-amber-300 focus:ring-amber-400';
  }
  return 'bg-white text-surface-800 border-surface-300 focus:ring-brand-500';
};

const getEnquiryStatusBadge = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'new') {
    return 'bg-blue-50 text-blue-700 border-blue-200';
  }
  if (s === 'contacted') {
    return 'bg-purple-50 text-purple-700 border-purple-200';
  }
  if (s === 'in progress' || s === 'in_progress') {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  if (s === 'closed' || s === 'resolved') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (s === 'cancelled' || s === 'rejected') {
    return 'bg-red-50 text-red-700 border-red-200';
  }
  return 'bg-surface-100 text-surface-700 border-surface-200';
};

const getEnquiryStatusSelectClass = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'new') {
    return 'bg-blue-50 text-blue-700 border-blue-300 focus:ring-blue-400';
  }
  if (s === 'contacted') {
    return 'bg-purple-50 text-purple-700 border-purple-300 focus:ring-purple-400';
  }
  if (s === 'in progress' || s === 'in_progress') {
    return 'bg-amber-50 text-amber-700 border-amber-300 focus:ring-amber-400';
  }
  if (s === 'closed' || s === 'resolved') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-300 focus:ring-emerald-400';
  }
  if (s === 'cancelled' || s === 'rejected') {
    return 'bg-red-50 text-red-700 border-red-300 focus:ring-red-400';
  }
  return 'bg-white text-surface-800 border-surface-300 focus:ring-brand-500';
};

export default function AdminDashboard({ onNavigateStore }) {
  const { admin, adminLogout } = useAuth();
  const [currentTab, setCurrentTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3000);
  };

  // State caches
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [testimonialsList, setTestimonialsList] = useState([]);

  // Active Modals
  const [editingProduct, setEditingProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingBlog, setEditingBlog] = useState(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [enquiryNotes, setEnquiryNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isAdminUserModalOpen, setIsAdminUserModalOpen] = useState(false);
  const [editingAdminUser, setEditingAdminUser] = useState(null);
  const [isEditAdminModalOpen, setIsEditAdminModalOpen] = useState(false);
  const [showNewAdminPassword, setShowNewAdminPassword] = useState(false);
  const [showEditAdminPassword, setShowEditAdminPassword] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [customBadgeInput, setCustomBadgeInput] = useState('');

  // Reusable Delete Confirmation Modal
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    title: 'Confirm Deletion',
    message: '',
    itemName: '',
    onConfirm: null,
    isProcessing: false
  });

  const openDeleteConfirm = ({ title, message, itemName, onConfirm }) => {
    setDeleteConfirm({
      isOpen: true,
      title: title || 'Confirm Deletion',
      message: message || 'Are you sure you want to delete this item? This action cannot be undone.',
      itemName: itemName || '',
      onConfirm,
      isProcessing: false
    });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm(prev => ({ ...prev, isOpen: false, isProcessing: false, onConfirm: null }));
  };

  const executeConfirmedDelete = async () => {
    if (!deleteConfirm.onConfirm) return;
    setDeleteConfirm(prev => ({ ...prev, isProcessing: true }));
    try {
      await deleteConfirm.onConfirm();
      closeDeleteConfirm();
    } catch (err) {
      setDeleteConfirm(prev => ({ ...prev, isProcessing: false }));
      showToast(err.message || 'Failed to delete item', true);
    }
  };

  // Search & Filter local states
  const [productSearch, setProductSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [customerSearch, setCustomerSearch] = useState('');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('all');
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState('all');
  const [testimonialFilter, setTestimonialFilter] = useState('all');
  const [testimonialSearch, setTestimonialSearch] = useState('');

  // Load Overview Data
  const loadOverview = async () => {
    try {
      setLoading(true);
      const data = await api.dashboard.getStats();
      setStats(data);
    } catch (e) {
      showToast('Failed to load dashboard stats', true);
    } finally {
      setLoading(false);
    }
  };

  // Tab Loaders
  useEffect(() => {
    if (currentTab === 'overview') {
      loadOverview();
      loadEnquiries();
    }
    if (currentTab === 'products') { loadProducts(); loadCategories(); loadBrands(); }
    if (currentTab === 'categories') { loadCategories(); loadBrands(); }
    if (currentTab === 'orders') loadOrders();
    if (currentTab === 'customers') loadCustomers();
    if (currentTab === 'blogs') loadBlogs();
    if (currentTab === 'reviews') loadReviews();
    if (currentTab === 'testimonials') loadTestimonials();
    if (currentTab === 'enquiries') loadEnquiries();
    if (currentTab === 'coupons') loadCoupons();
    if (currentTab === 'admins') loadAdminUsers();
  }, [currentTab]);

  // Supabase Realtime Subscriptions for live updates across all sections
  useEffect(() => {
    const unsubOrders = api.realtime.subscribeOrders(() => {
      loadOverview();
      if (currentTab === 'orders') loadOrders();
    });

    const unsubEnquiries = api.realtime.subscribeEnquiries(() => {
      loadOverview();
      loadEnquiries();
    });

    const unsubReviews = api.realtime.subscribeReviews(() => {
      loadOverview();
      if (currentTab === 'reviews') loadReviews();
    });

    const unsubTestimonials = api.realtime.subscribeTestimonials(() => {
      loadOverview();
      if (currentTab === 'testimonials') loadTestimonials();
    });

    const unsubProducts = api.realtime.subscribeProducts(() => {
      loadOverview();
      if (currentTab === 'products') loadProducts();
    });

    const unsubCategories = api.realtime.subscribeCategories(() => {
      if (currentTab === 'categories' || currentTab === 'products') loadCategories();
    });

    const unsubBrands = api.realtime.subscribeBrands(() => {
      if (currentTab === 'categories' || currentTab === 'products') loadBrands();
    });

    const unsubCoupons = api.realtime.subscribeCoupons(() => {
      if (currentTab === 'coupons') loadCoupons();
    });

    const unsubBlogs = api.realtime.subscribeBlogs(() => {
      if (currentTab === 'blogs') loadBlogs();
    });

    const unsubProfiles = api.realtime.subscribeProfiles(() => {
      loadOverview();
      if (currentTab === 'customers') loadCustomers();
      if (currentTab === 'admins') loadAdminUsers();
    });

    return () => {
      if (typeof unsubOrders === 'function') unsubOrders();
      if (typeof unsubEnquiries === 'function') unsubEnquiries();
      if (typeof unsubReviews === 'function') unsubReviews();
      if (typeof unsubTestimonials === 'function') unsubTestimonials();
      if (typeof unsubProducts === 'function') unsubProducts();
      if (typeof unsubCategories === 'function') unsubCategories();
      if (typeof unsubBrands === 'function') unsubBrands();
      if (typeof unsubCoupons === 'function') unsubCoupons();
      if (typeof unsubBlogs === 'function') unsubBlogs();
      if (typeof unsubProfiles === 'function') unsubProfiles();
    };
  }, [currentTab]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.products.adminList();
      setProducts(res.products || (Array.isArray(res) ? res : []));
    } catch (e) {
      showToast('Failed to load products', true);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.categories.adminList();
      setCategories(res.categories || (Array.isArray(res) ? res : []));
    } catch (e) {}
  };

  const loadBrands = async () => {
    try {
      const res = await api.brands.adminList();
      setBrands(res.brands || (Array.isArray(res) ? res : []));
    } catch (e) {}
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.orders.adminList({ status: orderStatusFilter });
      setOrders(res.orders || (Array.isArray(res) ? res : []));
    } catch (e) {
      showToast('Failed to load orders', true);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.customers.adminList();
      setCustomers(res.customers || (Array.isArray(res) ? res : []));
    } catch (e) {
      showToast('Failed to load customers', true);
    } finally {
      setLoading(false);
    }
  };

  const loadBlogs = async () => {
    try {
      const res = await api.blogs.adminList();
      setBlogs(res.blogs || (Array.isArray(res) ? res : []));
    } catch (e) {}
  };

  const loadReviews = async () => {
    try {
      const res = await api.reviews.adminList({ status: reviewStatusFilter });
      setReviews(res.reviews || (Array.isArray(res) ? res : []));
    } catch (e) {}
  };

  const loadEnquiries = async () => {
    try {
      const res = await api.enquiries.adminList({ status: enquiryStatusFilter });
      setEnquiries(res.enquiries || (Array.isArray(res) ? res : []));
    } catch (e) {}
  };

  const loadCoupons = async () => {
    try {
      const res = await api.coupons.adminList();
      setCoupons(res.coupons || (Array.isArray(res) ? res : []));
    } catch (e) {}
  };

  const loadAdminUsers = async () => {
    try {
      const res = await api.adminAuth.getUsers();
      setAdminUsers(res.users || (Array.isArray(res) ? res : []));
    } catch (e) {}
  };

  // Handle Order Status Change
  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await api.orders.adminUpdateStatus(orderId, { status });
      showToast(`Order ${orderId} marked as ${status}`);
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status }));
      }
    } catch (e) {
      showToast('Failed to update status', true);
    }
  };

  // Handle Review Moderation
  const handleModerateReview = async (reviewId, status) => {
    try {
      await api.reviews.adminModerate(reviewId, { status });
      showToast(`Review ${status}`);
      loadReviews();
    } catch (e) {
      showToast('Failed to moderate review', true);
    }
  };

  const handleDeleteReview = (reviewId) => {
    openDeleteConfirm({
      title: 'Delete Customer Review',
      message: 'Are you sure you want to permanently delete this customer review? It will be removed from product listings and the database.',
      onConfirm: async () => {
        await api.reviews.adminDelete(reviewId);
        showToast('Review permanently deleted');
        loadReviews();
      }
    });
  };

  // ---------------------------------------------------------------------------
  // Customer Testimonials Management
  // ---------------------------------------------------------------------------
  const loadTestimonials = async () => {
    try {
      const res = await api.testimonials.adminList({ status: testimonialFilter });
      setTestimonialsList(res.testimonials || (Array.isArray(res) ? res : []));
    } catch (e) {
      console.error('Failed to load testimonials:', e);
    }
  };

  const handleModerateTestimonial = async (id, status) => {
    try {
      const current = testimonialsList.find(t => t.id === id);
      const updates = { status };
      if (status === 'approved' && (!current?.display_order || Number(current.display_order) <= 0)) {
        const maxOrder = testimonialsList.reduce((max, t) => Math.max(max, Number(t.display_order) || 0), 0);
        updates.display_order = maxOrder + 1;
      }
      await api.testimonials.adminModerate(id, updates);
      showToast(`Testimonial ${status}`);
      loadTestimonials();
      loadOverview();
    } catch (e) {
      showToast('Failed to moderate testimonial', true);
    }
  };

  const handleAutoSequenceOrders = async () => {
    try {
      let currentMax = testimonialsList.reduce((max, t) => Math.max(max, Number(t.display_order) || 0), 0);
      const zeroOrders = testimonialsList
        .filter(t => !t.display_order || Number(t.display_order) <= 0)
        .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));

      for (const t of zeroOrders) {
        currentMax += 1;
        await api.testimonials.adminUpdate(t.id, { display_order: currentMax });
      }
      showToast('Display orders auto-sequenced');
      loadTestimonials();
    } catch (e) {
      showToast('Failed to auto-sequence orders', true);
    }
  };

  const handleUpdateTestimonialOrder = async (id, display_order) => {
    try {
      await api.testimonials.adminUpdate(id, { display_order: Number(display_order) || 0 });
      showToast('Display order updated');
      loadTestimonials();
    } catch (e) {
      showToast('Failed to update display order', true);
    }
  };

  const handleDeleteTestimonial = (testimonial) => {
    openDeleteConfirm({
      title: 'Delete Customer Testimonial',
      itemName: testimonial.name,
      message: `Are you sure you want to permanently delete the testimonial from "${testimonial.name}"? This cannot be undone.`,
      onConfirm: async () => {
        await api.testimonials.adminDelete(testimonial.id);
        showToast('Testimonial permanently deleted');
        loadTestimonials();
        loadOverview();
      }
    });
  };

  // Handle Delete Product
  const handleDeleteProduct = (id, name) => {
    openDeleteConfirm({
      title: 'Delete Product',
      itemName: name,
      message: `Are you sure you want to permanently delete "${name}"? All product specifications, images, and inventory data will be removed.`,
      onConfirm: async () => {
        await api.products.delete(id);
        showToast(`Product deleted`);
        loadProducts();
      }
    });
  };

  // Handle Toggle Product Stock
  const handleToggleProductStock = async (id, currentStock) => {
    try {
      await api.products.toggleStock(id, !currentStock);
      showToast(`Product stock status updated`);
      loadProducts();
    } catch (e) {
      showToast('Failed to toggle stock', true);
    }
  };

  // Export Enquiries (Client-side CSV generator)
  const handleExportEnquiries = () => {
    if (!enquiries.length) {
      showToast('No inquiries to export', true);
      return;
    }
    const headers = ['ID', 'Type', 'Name', 'Email', 'Phone', 'Company', 'Status', 'Message', 'Internal Notes', 'Date'];
    const rows = enquiries.map(e => [
      `"${e.id}"`,
      `"${e.type || ''}"`,
      `"${(e.name || '').replace(/"/g, '""')}"`,
      `"${e.email || ''}"`,
      `"${e.phone || ''}"`,
      `"${(e.company || '').replace(/"/g, '""')}"`,
      `"${e.status || ''}"`,
      `"${(e.message || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${(e.internal_notes || e.internalNotes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${e.created_at || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `enquiries_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Technical inquiries exported to CSV');
  };

  return (
    <div className="h-screen flex flex-col bg-surface-100 text-left font-sans overflow-hidden">
      
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl text-xs font-bold text-white transition-all ${
          toast.isError ? 'bg-red-600' : 'bg-surface-900 border border-surface-700'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Top Header Bar */}
      <header className="shrink-0 bg-surface-950 border-b border-surface-800 text-white px-4 sm:px-8 py-3.5 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white font-black text-sm shadow-md">
            S3D
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-lg tracking-tight">
                SOFT <span className="text-brand-500">3D</span> <span className="text-xs font-semibold text-surface-400 font-sans tracking-normal ml-0.5">Spółka z o.o.</span>
              </span>
              <span className="px-2 py-0.5 bg-surface-800 border border-surface-700 rounded text-[10px] font-mono font-semibold text-brand-400">
                ADMIN CONSOLE
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border hidden sm:inline-flex items-center gap-1 ${
                isSupabaseConfigured
                  ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-400'
                  : 'bg-amber-950/60 border-amber-600/60 text-amber-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                {isSupabaseConfigured ? 'Supabase Live DB' : 'Supabase Pending (.env.local)'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateStore}
            className="px-3 py-1.5 bg-surface-800 hover:bg-surface-700 text-surface-200 hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">View Storefront</span>
          </button>

          <div className="h-6 w-px bg-surface-800" />

          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-white">{admin?.firstName} {admin?.lastName}</div>
            <div className="text-[10px] text-surface-400 capitalize">{admin?.role?.replace('_', ' ') || 'Admin'}</div>
          </div>

          <button
            onClick={() => {
              adminLogout();
              onNavigateStore();
            }}
            className="p-2 text-surface-400 hover:text-red-400 hover:bg-surface-800 rounded-lg transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Layout: Sidebar & Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Sidebar Nav - Fixed on desktop with independent scroll */}
        <aside className="w-full md:w-72 bg-surface-900 border-r border-surface-800 text-surface-300 p-4 pt-3.5 sm:pt-4 shrink-0 overflow-y-auto h-auto md:h-full">
          <div className="px-3 pb-2.5 text-[11px] font-black uppercase tracking-wider text-surface-500 font-mono">
            Navigation Menu
          </div>
          <nav className="space-y-1.5 font-medium">
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
              { id: 'products', label: 'Machinery & Products', icon: Package, badge: products.length || stats?.totalProducts || null },
              { id: 'categories', label: 'Categories & Brands', icon: Tags },
              { id: 'orders', label: 'Customer Orders', icon: ShoppingCart, badge: stats?.pendingOrders ? `${stats.pendingOrders} new` : null },
              { id: 'customers', label: 'Registered Clients', icon: Users, badge: customers.length || stats?.totalCustomers || null },
              { id: 'blogs', label: 'Blog & Case Studies', icon: FileText },
              { id: 'reviews', label: 'Reviews Moderation', icon: Star, badge: stats?.pendingReviewsCount ? `${stats.pendingReviewsCount} pend` : null },
              { 
                id: 'testimonials', 
                label: 'Customer Testimonials', 
                icon: Quote, 
                badge: testimonialsList.filter(t => t.status === 'pending').length || stats?.pendingTestimonialsCount 
                  ? `${testimonialsList.filter(t => t.status === 'pending').length || stats?.pendingTestimonialsCount} new` 
                  : null 
              },
              { id: 'enquiries', label: 'Inquiries & RFQ tray', icon: MessageSquare, badge: enquiries.filter(e => e.status === 'New').length ? `${enquiries.filter(e => e.status === 'New').length} new` : null },
              { id: 'coupons', label: 'Promotions & Coupons', icon: Ticket, badge: coupons.length || null },
              { id: 'admins', label: 'Admin Staff & Roles', icon: ShieldAlert, badge: adminUsers.length || null }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-brand-500 text-white font-bold shadow-md' 
                      : 'hover:bg-surface-800 hover:text-white text-surface-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-[13.5px]">{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isActive ? 'bg-black/35 text-white' : 'bg-surface-800 text-surface-300 border border-surface-700/60'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Dynamic Tab Body */}
        <main className="flex-1 px-4 sm:px-8 pb-12 pt-3 sm:pt-4 overflow-y-auto h-full max-w-full">
          
          {/* TAB 1: OVERVIEW */}
          {currentTab === 'overview' && (
            <div className="space-y-0">
              <div className="sticky top-0 z-20 bg-surface-100/95 backdrop-blur-md -mt-3 sm:-mt-4 pt-3 sm:pt-4 pb-3.5 -mx-4 sm:-mx-8 px-4 sm:px-8 border-b border-surface-200/80 mb-0 shadow-xs flex items-center justify-between">
                <div>
                  <h1 className="font-display font-black text-2xl sm:text-3xl text-surface-900 tracking-tight">
                    Operational Performance
                  </h1>
                  <p className="text-xs text-surface-500 mt-1">
                    Real-time ecommerce, hardware procurement, and leads overview.
                  </p>
                </div>
                <button
                  onClick={loadOverview}
                  className="px-3.5 py-2 bg-white hover:bg-surface-50 border border-surface-300 rounded-xl text-xs font-bold text-surface-700 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Data</span>
                </button>
              </div>

              {/* KPI Metric Cards - generous spacing above cards */}
              <div className="pt-6 sm:pt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-8 sm:mb-10">
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-surface-200 shadow-xs space-y-3">
                  <div className="flex justify-between items-center text-xs text-surface-500 font-bold">
                    <span>Total Sales Volume</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="font-display text-2xl font-black text-surface-900">
                    £{(stats?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[11px] text-surface-400">All completed &amp; active transactions</p>
                </div>

                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-surface-200 shadow-xs space-y-3">
                  <div className="flex justify-between items-center text-xs text-surface-500 font-bold">
                    <span>Active Orders</span>
                    <ShoppingCart className="w-4 h-4 text-brand-600" />
                  </div>
                  <div className="font-display text-2xl font-black text-surface-900">
                    {stats?.activeOrders ?? 0}
                  </div>
                  <p className="text-[11px] text-amber-600 font-semibold">{stats?.pendingOrders || 0} requiring fulfillment</p>
                </div>

                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-surface-200 shadow-xs space-y-3">
                  <div className="flex justify-between items-center text-xs text-surface-500 font-bold">
                    <span>Enterprise Clients</span>
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="font-display text-2xl font-black text-surface-900">
                    {stats?.totalCustomers || 0}
                  </div>
                  <p className="text-[11px] text-surface-400">Registered manufacturing accounts</p>
                </div>

                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-surface-200 shadow-xs space-y-3">
                  <div className="flex justify-between items-center text-xs text-surface-500 font-bold">
                    <span>Equipment Inventory</span>
                    <Package className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="font-display text-2xl font-black text-surface-900">
                    {stats?.totalProducts || 0}
                  </div>
                  <p className="text-[11px] text-surface-400">{stats?.lowStockCount || 0} low stock items</p>
                </div>
              </div>

              {/* Generous Space Divider & Section Header for Recent Activity */}
              <div className="mt-14 sm:mt-20 pt-8 sm:pt-10 border-t border-surface-200/90">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display font-black text-lg sm:text-xl text-surface-900 tracking-tight">
                      Recent Activity &amp; Inquiries
                    </h2>
                    <p className="text-xs text-surface-500 mt-0.5">
                      Live equipment procurement orders and inbound customer inquiries
                    </p>
                  </div>
                </div>

                {/* Recent Orders & Recent Enquiries Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  
                  {/* Recent Orders Card */}
                  <div className="bg-white rounded-2xl border border-surface-200 shadow-xs p-5">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-surface-100">
                      <h3 className="font-display font-bold text-sm text-surface-900">Recent Equipment Orders</h3>
                      <button onClick={() => setCurrentTab('orders')} className="text-xs font-bold text-brand-600 hover:underline">
                        View all orders →
                      </button>
                    </div>

                    <div className="divide-y divide-surface-100 text-xs">
                      {(!stats?.recentOrders || stats.recentOrders.length === 0) ? (
                        <p className="py-6 text-center text-surface-400">No orders recorded yet.</p>
                      ) : (
                        stats.recentOrders.map(o => (
                          <div key={o.id} className="py-2.5 flex justify-between items-center">
                            <div>
                              <div className="font-mono font-bold text-surface-900">{o.id}</div>
                              <div className="text-[11px] text-surface-500">{o.customer_name} ({o.customer_email})</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-surface-900">£{o.total?.toLocaleString()}</div>
                              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${getOrderStatusBadge(o.status)}`}>
                                {o.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Recent Inquiries Card */}
                  <div className="bg-white rounded-2xl border border-surface-200 shadow-xs p-5">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-surface-100">
                      <h3 className="font-display font-bold text-sm text-surface-900">Recent Technical Inquiries</h3>
                      <button onClick={() => setCurrentTab('enquiries')} className="text-xs font-bold text-brand-600 hover:underline">
                        View all inquiries →
                      </button>
                    </div>

                    <div className="divide-y divide-surface-100 text-xs">
                      {(!stats?.recentEnquiries || stats.recentEnquiries.length === 0) ? (
                        <p className="py-6 text-center text-surface-400">No inquiries recorded yet.</p>
                      ) : (
                        stats.recentEnquiries.map(e => (
                          <div key={e.id} className="py-2.5 flex justify-between items-center">
                            <div>
                              <div className="font-bold text-surface-900">{e.name} <span className="text-surface-400 font-normal">({e.company || 'Private'})</span></div>
                              <div className="text-[11px] text-surface-500 capitalize">{e.type.replace('_', ' ')} • {e.email}</div>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${getEnquiryStatusBadge(e.status)}`}>
                              {e.status}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS MANAGEMENT */}
          {currentTab === 'products' && (
            <div className="space-y-0">
              <div className="sticky top-0 z-20 bg-surface-100/95 backdrop-blur-md -mt-3 sm:-mt-4 pt-3 sm:pt-4 pb-3.5 -mx-4 sm:-mx-8 px-4 sm:px-8 border-b border-surface-200/80 mb-0 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="font-display font-black text-2xl text-surface-900">Products &amp; Machinery</h1>
                    <p className="text-xs text-surface-500">Manage 3D printers, scanners, engineering materials, and accessories.</p>
                  </div>

                  <button
                    onClick={() => {
                      setIsCustomBrand(false);
                      const defaultCat = (categories && categories.length > 0) ? categories[0] : { id: 'industrial-fdm', name: 'Industrial 3D Printers' };
                      const defaultBrand = (brands && brands.length > 0 && brands[0]?.name) ? brands[0].name : 'Raise3D';
                      setEditingProduct({
                        name: '',
                        brand: defaultBrand,
                        categoryId: defaultCat.id,
                        categoryName: defaultCat.name,
                        price: 0,
                        sku: '',
                        availability: 'In Stock',
                        inStock: true,
                        stockQuantity: 10,
                        minStock: 5,
                        badge: '',
                        images: ['/images/products/prod_raise3d_pro3.jpg'],
                        description: ''
                      });
                      setIsProductModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </button>
                </div>

                {/* Search Bar */}
                <div className="bg-white p-2.5 rounded-xl border border-surface-300 flex items-center gap-2 shadow-2xs">
                  <Search className="w-4 h-4 text-surface-400 ml-1" />
                  <input
                    type="text"
                    placeholder="Filter by name, brand, or SKU..."
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="w-full text-xs text-surface-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Products Table */}
              <div className="pt-6 sm:pt-8">
                <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-50 border-b border-surface-200 text-surface-600 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3.5">Product</th>
                        <th className="p-3.5">Brand</th>
                        <th className="p-3.5">Category</th>
                        <th className="p-3.5">Price</th>
                        <th className="p-3.5">Stock</th>
                        <th className="p-3.5">Badge</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100">
                      {products
                        .filter(p => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase()))
                        .length === 0 ? (
                          <tr>
                            <td colSpan="7" className="p-8 text-center text-surface-400 font-medium">
                              No products found in the database.
                            </td>
                          </tr>
                        ) : (
                          products
                            .filter(p => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase()))
                            .map(p => (
                              <tr key={p.id} className="hover:bg-surface-50/60">
                                <td className="p-3.5">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={p.images?.[0] || '/images/hero/hero_industrial_3d.jpg'}
                                      alt=""
                                      className="w-10 h-10 object-contain rounded-lg border border-surface-200 bg-white p-1 shrink-0"
                                    />
                                    <div>
                                      <div className="font-bold text-surface-900 max-w-xs truncate">{p.name}</div>
                                      <div className="text-[10px] text-surface-400 font-mono">SKU: {p.sku}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3.5 font-semibold text-surface-700">{p.brand}</td>
                                <td className="p-3.5 text-surface-600">{p.categoryName}</td>
                                <td className="p-3.5 font-bold text-surface-900">
                                  {p.quoteOnly ? (
                                    <span className="text-brand-600">Quote</span>
                                  ) : (
                                    `£${(p.price || 0).toLocaleString()}`
                                  )}
                                </td>
                                <td className="p-3.5">
                                  <div className="flex flex-col gap-1 items-start">
                                    <button
                                      onClick={() => handleToggleProductStock(p.id, p.inStock)}
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                        p.inStock ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-red-50 text-red-700 hover:bg-red-100'
                                      }`}
                                      title="Click to toggle stock status"
                                    >
                                      {p.inStock ? `${p.stockQuantity ?? 10} in stock` : 'Out of stock'}
                                    </button>
                                    {p.inStock && (p.stockQuantity ?? 10) <= (p.minStock ?? 5) && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                        <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                                        Low Stock (≤{p.minStock ?? 5})
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3.5">
                                  {p.badge ? (
                                    <div className="flex flex-wrap gap-1 max-w-[170px]">
                                      {String(p.badge).split(',').map(b => b.trim()).filter(Boolean).map((b, idx) => {
                                        const lower = b.toLowerCase();
                                        const isFeat = lower.includes('featured');
                                        const colorClass = isFeat
                                          ? 'bg-surface-900 text-white border-surface-800'
                                          : 'bg-surface-100 text-surface-700 border-surface-300';
                                        return (
                                          <span key={idx} className={`px-2 py-0.5 border rounded text-[9.5px] font-bold whitespace-nowrap ${colorClass}`}>
                                            {b}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <span className="text-surface-400 text-[10px]">—</span>
                                  )}
                                </td>
                                <td className="p-3.5 text-right space-x-1">
                                  <button
                                    onClick={() => {
                                      setIsCustomBrand(false);
                                      setEditingProduct({
                                        ...p,
                                        inStock: p.inStock !== false && (p.stockQuantity == null || p.stockQuantity > 0)
                                      });
                                      setIsProductModalOpen(true);
                                    }}
                                    className="p-1.5 hover:bg-surface-100 rounded text-surface-600 hover:text-brand-600 cursor-pointer"
                                    title="Edit Product"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(p.id, p.name)}
                                    className="p-1.5 hover:bg-red-50 rounded text-surface-600 hover:text-red-600 cursor-pointer"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                        )}
                    </tbody>
                  </table>
                </div>
              </div>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES & BRANDS */}
          {currentTab === 'categories' && (
            <div className="space-y-0">
              <div className="sticky top-0 z-20 bg-surface-100/95 backdrop-blur-md -mt-3 sm:-mt-4 pt-3 sm:pt-4 pb-3.5 -mx-4 sm:-mx-8 px-4 sm:px-8 border-b border-surface-200/80 mb-0 shadow-xs flex justify-between items-center">
                <div>
                  <h1 className="font-display font-black text-2xl text-surface-900">Categories &amp; Brands</h1>
                  <p className="text-xs text-surface-500">Manage store equipment taxonomy, brands, and product classifications.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingCategory({
                        name: '',
                        slug: '',
                        description: '',
                        badge: 'Active',
                        image: '/images/categories/category_printers.jpg'
                      });
                      setIsCategoryModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Category</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingBrand(null);
                      setIsBrandModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-surface-900 hover:bg-surface-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Brand</span>
                  </button>
                </div>
              </div>

              {/* Categories & Brands Content Wrapper */}
              <div className="pt-6 sm:pt-8 space-y-8">
                {/* Categories Section */}
                <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-display font-black text-lg text-surface-800">Product Categories</h2>
                    <p className="text-xs text-surface-500">Classification tags and equipment departments.</p>
                  </div>
                </div>

                {categories.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-surface-200 text-center text-surface-400 text-xs font-medium">
                    No categories found in the database. Click "Add Category" to create one.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map(c => (
                      <div key={c.id} className="bg-white p-4 rounded-2xl border border-surface-200 shadow-xs flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={c.image || '/images/categories/category_printers.jpg'} alt="" className="w-12 h-12 rounded-xl object-cover border border-surface-200" />
                          <div>
                            <h4 className="font-bold text-surface-900 text-xs">{c.name}</h4>
                            <span className="text-[10px] text-surface-500">{c.badge || 'Active'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingCategory(c);
                              setIsCategoryModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-surface-100 rounded text-surface-500 hover:text-brand-600"
                            title="Edit Category"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              openDeleteConfirm({
                                title: 'Delete Category',
                                itemName: c.name,
                                message: `Are you sure you want to delete category "${c.name}"? This category will be removed from the store navigation.`,
                                onConfirm: async () => {
                                  await api.categories.delete(c.id);
                                  showToast('Category deleted');
                                  loadCategories();
                                }
                              });
                            }}
                            className="p-1.5 hover:bg-red-50 rounded text-surface-500 hover:text-red-600"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Brands Section */}
              <div className="space-y-4 pt-4 border-t border-surface-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-display font-black text-xl text-surface-900">Partner Brands</h2>
                    <p className="text-xs text-surface-500">Official OEM hardware &amp; material distribution partners.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingBrand(null);
                      setIsBrandModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Brand</span>
                  </button>
                </div>

                {brands.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-surface-200 text-center text-surface-400 text-xs font-medium">
                    No partner brands found in the database. Click "Add Brand" to register an OEM.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {brands.map(b => (
                      <div key={b.id} className="bg-white p-4 rounded-2xl border border-surface-200 shadow-xs space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-surface-900 text-sm">{b.name}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-brand-600 font-bold mr-1">{b.status}</span>
                            <button
                              onClick={() => {
                                setEditingBrand(b);
                                setIsBrandModalOpen(true);
                              }}
                              className="p-1 hover:bg-surface-100 rounded text-surface-500 hover:text-brand-600"
                              title="Edit Brand"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                openDeleteConfirm({
                                  title: 'Delete Brand',
                                  itemName: b.name,
                                  message: `Are you sure you want to delete brand "${b.name}"? It will be removed from the store and marquee.`,
                                  onConfirm: async () => {
                                    await api.brands.delete(b.id);
                                    showToast('Brand deleted');
                                    loadBrands();
                                  }
                                });
                              }}
                              className="p-1 hover:bg-red-50 rounded text-surface-500 hover:text-red-600"
                              title="Delete Brand"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-surface-500 line-clamp-2">{b.description || b.tagline || 'Industrial manufacturer'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS */}
          {currentTab === 'orders' && (
            <div className="space-y-0">
              <div className="sticky top-0 z-20 bg-surface-100/95 backdrop-blur-md -mt-3 sm:-mt-4 pt-3 sm:pt-4 pb-3.5 -mx-4 sm:-mx-8 px-4 sm:px-8 border-b border-surface-200/80 mb-0 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="font-display font-black text-2xl text-surface-900">Orders &amp; Invoices</h1>
                  <p className="text-xs text-surface-500">Live order fulfillment, statuses, and customer shipping details.</p>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-surface-600 font-bold">Status:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => {
                      setOrderStatusFilter(e.target.value);
                      setTimeout(loadOrders, 50);
                    }}
                    className="px-3 py-2 bg-white border border-surface-300 rounded-xl text-xs font-bold text-surface-800 focus:outline-none shadow-2xs cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 sm:pt-8">
                <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-50 border-b border-surface-200 text-surface-600 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3.5">Order Ref</th>
                        <th className="p-3.5">Date</th>
                        <th className="p-3.5">Customer &amp; Company</th>
                        <th className="p-3.5">Items</th>
                        <th className="p-3.5">Total</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100">
                      {orders.map(o => (
                        <tr key={o.id} className="hover:bg-surface-50/60">
                          <td className="p-3.5 font-mono font-bold text-surface-900">{o.id}</td>
                          <td className="p-3.5 text-surface-500 text-[11px]">
                            {new Date(o.createdAt).toLocaleDateString('en-GB')}
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-surface-900">{o.customerName}</div>
                            <div className="text-[10px] text-surface-500">{o.company || o.customerEmail}</div>
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-surface-800">{o.items?.length || 1} item(s)</span>
                          </td>
                          <td className="p-3.5 font-black text-surface-900">
                            £{(o.total || 0).toLocaleString()}
                          </td>
                          <td className="p-3.5">
                            <select
                              value={o.status}
                              onChange={e => handleUpdateOrderStatus(o.id, e.target.value)}
                              className={`px-2.5 py-1 border rounded-lg text-[11px] font-bold cursor-pointer transition-colors shadow-2xs ${getOrderStatusSelectClass(o.status)}`}
                            >
                              <option value="Pending" className="bg-white text-surface-900">Pending</option>
                              <option value="Confirmed" className="bg-white text-surface-900">Confirmed</option>
                              <option value="Processing" className="bg-white text-surface-900">Processing</option>
                              <option value="Shipped" className="bg-white text-surface-900">Shipped</option>
                              <option value="Delivered" className="bg-white text-surface-900">Delivered</option>
                              <option value="Cancelled" className="bg-white text-surface-900">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => setSelectedOrder(o)}
                              className="px-2.5 py-1 bg-surface-100 hover:bg-surface-200 text-surface-700 font-bold rounded-lg text-[11px] cursor-pointer"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              </div>
            </div>
          )}

          {/* TAB 5: REGISTERED CLIENTS */}
          {currentTab === 'customers' && (
            <div className="space-y-0">
              <div className="sticky top-0 z-20 bg-surface-100/95 backdrop-blur-md -mt-3 sm:-mt-4 pt-3 sm:pt-4 pb-3.5 -mx-4 sm:-mx-8 px-4 sm:px-8 border-b border-surface-200/80 mb-0 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h1 className="font-display font-black text-2xl text-surface-900">Registered Clients</h1>
                  <p className="text-xs text-surface-500">Registered client accounts and customer profiles.</p>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by client name or email..."
                    value={customerSearch}
                    onChange={e => setCustomerSearch(e.target.value)}
                    className="pl-9 pr-3 py-2 border border-surface-300 rounded-xl text-xs w-72 bg-white focus:outline-none focus:border-brand-500 shadow-2xs"
                  />
                </div>
              </div>

              <div className="pt-6 sm:pt-8">
                <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-xs">
                {(() => {
                  const filteredCustomers = customers.filter(c => {
                    if (!customerSearch) return true;
                    const q = customerSearch.toLowerCase();
                    return (
                      (c.name && c.name.toLowerCase().includes(q)) ||
                      (c.email && c.email.toLowerCase().includes(q))
                    );
                  });

                  if (filteredCustomers.length === 0) {
                    return (
                      <div className="p-12 text-center text-surface-400">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="font-bold text-surface-600">No registered clients found</p>
                        <p className="text-xs mt-1">Client accounts will appear here automatically when users register or checkout.</p>
                      </div>
                    );
                  }

                  return (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface-50 border-b border-surface-200 text-surface-600 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-3.5">Client</th>
                          <th className="p-3.5">Email</th>
                          <th className="p-3.5">Orders</th>
                          <th className="p-3.5">Total Spend</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-100">
                        {filteredCustomers.map(c => (
                          <tr key={c.id || c.email} className="hover:bg-surface-50/60">
                            <td className="p-3.5 font-bold text-surface-900">{c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || '—'}</td>
                            <td className="p-3.5 text-surface-600 font-mono text-[11px]">{c.email}</td>
                            <td className="p-3.5 font-bold text-surface-900">{c.orderCount || c.order_count || 0}</td>
                            <td className="p-3.5 font-black text-emerald-700">£{(c.totalSpend || c.total_spend || 0).toLocaleString()}</td>
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                {c.isActive !== false ? 'Active' : 'Suspended'}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => setSelectedCustomer(c)}
                                className="px-2.5 py-1 bg-surface-100 hover:bg-surface-200 text-surface-700 font-bold rounded-lg text-[11px] cursor-pointer"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
              </div>
            </div>
          )}

          {/* TAB 6: BLOG CMS */}
          {currentTab === 'blogs' && (
            <div className="space-y-0">
              <div className="sticky top-0 z-20 bg-surface-100/95 backdrop-blur-md -mt-3 sm:-mt-4 pt-3 sm:pt-4 pb-3.5 -mx-4 sm:-mx-8 px-4 sm:px-8 border-b border-surface-200/80 mb-0 shadow-xs flex justify-between items-center">
                <div>
                  <h1 className="font-display font-black text-2xl text-surface-900">Knowledge Centre CMS</h1>
                  <p className="text-xs text-surface-500">Publish engineering whitepapers, case studies, and material tutorials.</p>
                </div>

                <button
                  onClick={() => {
                    setEditingBlog({
                      title: '',
                      category: 'Case Studies',
                      tag: 'Large Format (LFAM)',
                      author: admin ? `${admin.firstName || 'Admin'} ${admin.lastName || ''}`.trim() : 'Additive Specialist',
                      authorRole: 'Senior Additive Applications Specialist',
                      image: '/images/spotlight/lfam_pellet_extrusion.jpg',
                      summary: '',
                      content: '',
                      status: 'published'
                    });
                    setIsBlogModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Article</span>
                </button>
              </div>

              <div className="pt-6 sm:pt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {blogs.length === 0 ? (
                  <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-surface-200 text-surface-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-bold text-surface-600">No articles found in Knowledge Centre</p>
                    <p className="text-xs mt-1">Click "New Article" above to publish whitepapers and technical guides to Supabase.</p>
                  </div>
                ) : (
                  blogs.map(b => (
                    <div key={b.id} className="bg-white p-5 rounded-2xl border border-surface-200 shadow-xs flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-center text-[10px] text-surface-400 font-bold mb-1">
                          <span className="uppercase text-brand-600 font-mono tracking-wider">{b.category}</span>
                          <span className={`px-2 py-0.5 rounded font-bold uppercase ${b.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-surface-100 text-surface-600'}`}>
                            {b.status}
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-sm text-surface-900 line-clamp-2">{b.title}</h3>
                        <p className="text-xs text-surface-500 mt-1 line-clamp-2">{b.summary}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-surface-100 text-xs">
                        <span className="text-[11px] text-surface-400">By {b.author}</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setEditingBlog(b);
                              setIsBlogModalOpen(true);
                            }}
                            className="text-brand-600 hover:text-brand-700 font-bold text-[11px] cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              openDeleteConfirm({
                                title: 'Delete Article',
                                itemName: b.title,
                                message: `Are you sure you want to delete article "${b.title}"? It will be removed from the blog and case studies section.`,
                                onConfirm: async () => {
                                  await api.blogs.adminDelete(b.id);
                                  showToast('Article removed');
                                  loadBlogs();
                                }
                              });
                            }}
                            className="text-red-500 hover:text-red-700 font-bold text-[11px] cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 7: REVIEWS MODERATION */}
          {currentTab === 'reviews' && (
            <div className="space-y-0">
              <div className="sticky top-0 z-20 bg-surface-100/95 backdrop-blur-md -mt-3 sm:-mt-4 pt-3 sm:pt-4 pb-3.5 -mx-4 sm:-mx-8 px-4 sm:px-8 border-b border-surface-200/80 mb-0 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h1 className="font-display font-black text-2xl text-surface-900">Reviews &amp; Ratings Moderation</h1>
                  <p className="text-xs text-surface-500">Approve or reject customer verified reviews before public display.</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-surface-600">Filter:</span>
                  <select
                    value={reviewStatusFilter}
                    onChange={async (e) => {
                      const newFilter = e.target.value;
                      setReviewStatusFilter(newFilter);
                      const res = await api.reviews.adminList({ status: newFilter });
                      setReviews(res.reviews || (Array.isArray(res) ? res : []));
                    }}
                    className="px-3 py-2 border border-surface-300 rounded-xl text-xs bg-white font-bold text-surface-800 cursor-pointer shadow-2xs"
                  >
                    <option value="all">All Reviews</option>
                    <option value="pending">Pending Moderation</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 sm:pt-8">
                <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-xs">
                {reviews.length === 0 ? (
                  <div className="p-12 text-center text-surface-400">
                    <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-bold text-surface-600">No reviews found</p>
                    <p className="text-xs mt-1">Customer verified equipment reviews will appear here for moderation.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-50 border-b border-surface-200 text-surface-600 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3.5">Product</th>
                        <th className="p-3.5">Customer</th>
                        <th className="p-3.5">Rating</th>
                        <th className="p-3.5">Review</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100">
                      {reviews.map(r => (
                        <tr key={r.id} className="hover:bg-surface-50/60">
                          <td className="p-3.5 font-bold text-surface-900">{r.product_name || r.productId}</td>
                          <td className="p-3.5">
                            <div className="font-semibold text-surface-800">{r.user_name || r.userName || 'Client'}</div>
                            <div className="text-[10px] text-surface-400">{r.user_company || r.userCompany || '—'}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => {
                                  const cfg = getRatingConfig(r.rating);
                                  return (
                                    <Star
                                      key={s}
                                      className={`w-3.5 h-3.5 ${s <= r.rating ? `${cfg.fill} ${cfg.color}` : 'text-surface-200 stroke-1'}`}
                                    />
                                  );
                                })}
                              </div>
                              <span className={`font-bold text-xs ${getRatingConfig(r.rating).color}`}>
                                {r.rating}/5
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5 max-w-sm">
                            <div className="font-bold text-surface-900">{r.title}</div>
                            <p className="text-[11px] text-surface-600 line-clamp-2">{r.comment}</p>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                              r.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-1.5">
                            {r.status !== 'approved' && (
                              <button
                                onClick={() => handleModerateReview(r.id, 'approved')}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px] cursor-pointer"
                              >
                                Approve
                              </button>
                            )}
                            {r.status !== 'rejected' && (
                              <button
                                onClick={() => handleModerateReview(r.id, 'rejected')}
                                className="px-2 py-1 bg-surface-200 hover:bg-surface-300 text-surface-700 rounded font-bold text-[10px] cursor-pointer"
                              >
                                Reject
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteReview(r.id)}
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded font-bold text-[10px] cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              </div>
            </div>
          )}

          {/* TAB: CUSTOMER TESTIMONIALS */}
          {currentTab === 'testimonials' && (
            <div className="space-y-0">
              <div className="sticky top-0 z-20 bg-surface-100/95 backdrop-blur-md -mt-3 sm:-mt-4 pt-3 sm:pt-4 pb-3.5 -mx-4 sm:-mx-8 px-4 sm:px-8 border-b border-surface-200/80 mb-0 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h1 className="font-display font-black text-2xl text-surface-900">Customer Testimonials</h1>
                  <p className="text-xs text-surface-500">Review, approve, or reject verified client quotes displayed on the homepage.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={testimonialSearch}
                      onChange={(e) => setTestimonialSearch(e.target.value)}
                      placeholder="Search testimonials..."
                      className="pl-8 pr-3 py-1.5 border border-surface-300 rounded-xl text-xs bg-white text-surface-800 placeholder:text-surface-400 focus:outline-none focus:border-brand-500 shadow-2xs w-44 sm:w-56"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-surface-600">Filter:</span>
                    <select
                      value={testimonialFilter}
                      onChange={async (e) => {
                        const newFilter = e.target.value;
                        setTestimonialFilter(newFilter);
                        const res = await api.testimonials.adminList({ status: newFilter });
                        setTestimonialsList(res.testimonials || (Array.isArray(res) ? res : []));
                      }}
                      className="px-3 py-2 border border-surface-300 rounded-xl text-xs bg-white font-bold text-surface-800 cursor-pointer shadow-2xs"
                    >
                      <option value="all">All Testimonials</option>
                      <option value="pending">Pending Review</option>
                      <option value="approved">Approved (Live)</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {testimonialsList.some(t => !t.display_order || Number(t.display_order) <= 0) && (
                    <button
                      onClick={handleAutoSequenceOrders}
                      className="px-3 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                      title="Automatically assign sequential order numbers (7, 8, 9...) to testimonials with order 0"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                      <span>Auto-Sequence (Fix 0 Orders)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status Counters Strip */}
              <div className="pt-8 sm:pt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-surface-200/90 shadow-2xs">
                  <div className="text-[11px] font-bold text-surface-500 uppercase tracking-wider">Total Testimonials</div>
                  <div className="text-xl font-black text-surface-900 mt-0.5">{testimonialsList.length}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-amber-200/90 bg-amber-50/20 shadow-2xs">
                  <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Pending Review</div>
                  <div className="text-xl font-black text-amber-700 mt-0.5">
                    {testimonialsList.filter(t => t.status === 'pending').length}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-emerald-200/90 bg-emerald-50/20 shadow-2xs">
                  <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Approved / Live</div>
                  <div className="text-xl font-black text-emerald-700 mt-0.5">
                    {testimonialsList.filter(t => t.status === 'approved').length}
                  </div>
                </div>
              </div>

              {/* Testimonials Table */}
              <div className="pt-6 sm:pt-8">
                <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-xs">
                  {(() => {
                    const filtered = testimonialsList.filter(t => {
                      if (!testimonialSearch.trim()) return true;
                      const q = testimonialSearch.toLowerCase();
                      return (
                        (t.name || '').toLowerCase().includes(q) ||
                        (t.content || '').toLowerCase().includes(q)
                      );
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="p-12 text-center text-surface-400">
                          <Quote className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p className="font-bold text-surface-600">No testimonials found</p>
                          <p className="text-xs mt-1">
                            {testimonialSearch ? 'Try a different search query.' : 'Submitted client testimonials will appear here for moderation.'}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-surface-50 border-b border-surface-200 text-surface-600 font-bold uppercase tracking-wider text-[10px]">
                            <tr>
                              <th className="p-3.5 w-16 text-center">Order</th>
                              <th className="p-3.5">Client Name</th>
                              <th className="p-3.5">Rating</th>
                              <th className="p-3.5 min-w-[280px]">Testimonial Quote</th>
                              <th className="p-3.5">Status</th>
                              <th className="p-3.5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-surface-100">
                            {filtered.map((t) => {
                              return (
                                <tr key={t.id} className="hover:bg-surface-50/60 transition-colors">
                                  {/* Order Column */}
                                  <td className="p-3.5 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      max="999"
                                      value={t.display_order ?? 0}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setTestimonialsList(prev => prev.map(item => item.id === t.id ? { ...item, display_order: val } : item));
                                      }}
                                      onBlur={(e) => handleUpdateTestimonialOrder(t.id, e.target.value)}
                                      className="w-12 px-1.5 py-1 text-center font-mono font-bold bg-surface-50 border border-surface-200 rounded-lg text-xs focus:bg-white focus:border-brand-500 outline-none"
                                      title="Display order (lower numbers appear first)"
                                    />
                                  </td>

                                  {/* Client Name Column */}
                                  <td className="p-3.5">
                                    <div className="font-bold text-surface-900 text-[13px]">{t.name}</div>
                                  </td>

                                  {/* Rating Column */}
                                  <td className="p-3.5 whitespace-nowrap">
                                    <div className="flex items-center gap-1">
                                      {[...Array(Number(t.rating) || 5)].map((_, i) => (
                                        <Star 
                                          key={i} 
                                          className="w-3.5 h-3.5 fill-amber-400 text-amber-400" 
                                        />
                                      ))}
                                      <span className="font-bold text-xs ml-1 text-surface-800">
                                        {t.rating}/5
                                      </span>
                                    </div>
                                  </td>

                                  {/* Quote Column */}
                                  <td className="p-3.5">
                                    <p className="text-surface-700 leading-relaxed text-xs italic line-clamp-3">
                                      “{t.content}”
                                    </p>
                                  </td>

                                  {/* Status Column */}
                                  <td className="p-3.5 whitespace-nowrap">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize inline-flex items-center gap-1 ${
                                      t.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                      t.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-200' : 
                                      'bg-amber-50 text-amber-700 border border-amber-200'
                                    }`}>
                                      {t.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                                      {t.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                      {t.status === 'pending' && <Clock className="w-3 h-3" />}
                                      {t.status}
                                    </span>
                                  </td>

                                  {/* Actions Column */}
                                  <td className="p-3.5 text-right whitespace-nowrap space-x-1.5">
                                    {t.status !== 'approved' && (
                                      <button
                                        onClick={() => handleModerateTestimonial(t.id, 'approved')}
                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-all cursor-pointer shadow-2xs"
                                      >
                                        Approve
                                      </button>
                                    )}
                                    {t.status !== 'rejected' && (
                                      <button
                                        onClick={() => handleModerateTestimonial(t.id, 'rejected')}
                                        className="px-2.5 py-1 bg-surface-200 hover:bg-surface-300 text-surface-700 rounded-lg font-bold text-[11px] transition-all cursor-pointer"
                                      >
                                        Reject
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDeleteTestimonial(t)}
                                      className="p-1.5 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                                      title="Delete Testimonial"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: ENQUIRIES & LEADS */}
          {currentTab === 'enquiries' && (
            <div className="space-y-0">
              <div className="sticky top-0 z-20 bg-surface-100/95 backdrop-blur-md -mt-3 sm:-mt-4 pt-3 sm:pt-4 pb-3.5 -mx-4 sm:-mx-8 px-4 sm:px-8 border-b border-surface-200/80 mb-0 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h1 className="font-display font-black text-2xl text-surface-900">Technical Inquiries &amp; Leads</h1>
                  <p className="text-xs text-surface-500">Direct inquiries from the contact form, quotation tray, and sample requests.</p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={enquiryStatusFilter}
                    onChange={async (e) => {
                      const newFilter = e.target.value;
                      setEnquiryStatusFilter(newFilter);
                      const res = await api.enquiries.adminList({ status: newFilter });
                      setEnquiries(res.enquiries || (Array.isArray(res) ? res : []));
                    }}
                    className="px-3 py-2 border border-surface-300 rounded-xl text-xs bg-white font-bold text-surface-800 cursor-pointer shadow-2xs"
                  >
                    <option value="all">All Statuses</option>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>

                  <button
                    onClick={handleExportEnquiries}
                    className="px-3.5 py-2 bg-surface-900 hover:bg-surface-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              <div className="pt-6 sm:pt-8">
                <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-xs">
                {enquiries.length === 0 ? (
                  <div className="p-12 text-center text-surface-400">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-bold text-surface-600">No technical inquiries found</p>
                    <p className="text-xs mt-1">Quotations, sample print submissions, and support requests will appear here.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-50 border-b border-surface-200 text-surface-600 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3.5">ID</th>
                        <th className="p-3.5">Type</th>
                        <th className="p-3.5">Contact</th>
                        <th className="p-3.5">Message / Requirements</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100">
                      {enquiries.map(e => (
                        <tr key={e.id} className="hover:bg-surface-50/60">
                          <td className="p-3.5 font-mono font-bold text-surface-900">{e.id}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 bg-brand-50 text-brand-700 font-bold rounded text-[10px] uppercase">
                              {(e.type || 'general').replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-surface-900">{e.name}</div>
                            <div className="text-[10px] text-surface-500">{e.company || '—'} • {e.email}</div>
                          </td>
                          <td className="p-3.5 max-w-sm">
                            <p className="text-[11px] text-surface-600 line-clamp-2">{e.message || 'Consultation booking'}</p>
                            {e.internal_notes && (
                              <p className="text-[10px] text-amber-700 italic mt-0.5 line-clamp-1">Note: {e.internal_notes}</p>
                            )}
                          </td>
                          <td className="p-3.5">
                            <select
                              value={e.status || 'New'}
                              onChange={async (evt) => {
                                await api.enquiries.adminUpdate(e.id, { status: evt.target.value });
                                showToast(`Inquiry status set to ${evt.target.value}`);
                                loadEnquiries();
                              }}
                              className={`px-2.5 py-1 border rounded-lg text-[11px] font-bold cursor-pointer transition-colors shadow-2xs ${getEnquiryStatusSelectClass(e.status)}`}
                            >
                              <option value="New" className="bg-white text-surface-900">New</option>
                              <option value="Contacted" className="bg-white text-surface-900">Contacted</option>
                              <option value="In Progress" className="bg-white text-surface-900">In Progress</option>
                              <option value="Closed" className="bg-white text-surface-900">Closed</option>
                            </select>
                          </td>
                          <td className="p-3.5 text-right space-x-1.5">
                            <button
                              onClick={() => {
                                setSelectedEnquiry(e);
                                setEnquiryNotes(e.internal_notes || e.internalNotes || '');
                              }}
                              className="px-2.5 py-1 bg-surface-100 hover:bg-surface-200 text-surface-700 font-bold rounded text-[11px] cursor-pointer"
                            >
                              View &amp; Notes
                            </button>
                            <button
                              onClick={() => {
                                openDeleteConfirm({
                                  title: 'Delete Inquiry',
                                  itemName: `${e.name || 'Client'} (${e.email})`,
                                  message: `Are you sure you want to delete this technical inquiry? This action cannot be undone.`,
                                  onConfirm: async () => {
                                    await api.enquiries.adminDelete(e.id);
                                    showToast('Inquiry deleted');
                                    loadEnquiries();
                                  }
                                });
                              }}
                              className="px-2 py-1 text-red-500 hover:text-red-700 font-bold rounded text-[11px] cursor-pointer"
                              title="Delete Inquiry"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              </div>
            </div>
          )}

          {/* TAB 9: COUPONS */}
          {currentTab === 'coupons' && (
            <div className="space-y-0">
              <div className="sticky top-0 z-20 bg-surface-100/95 backdrop-blur-md -mt-3 sm:-mt-4 pt-3 sm:pt-4 pb-3.5 -mx-4 sm:-mx-8 px-4 sm:px-8 border-b border-surface-200/80 mb-0 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h1 className="font-display font-black text-2xl text-surface-900">Discount Coupons</h1>
                  <p className="text-xs text-surface-500">Manage promotional codes, trade discounts, and checkout vouchers.</p>
                </div>

                <button
                  onClick={() => {
                    setEditingCoupon(null);
                    setIsCouponModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="pt-6 sm:pt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {coupons.length === 0 ? (
                  <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-surface-200 text-surface-400">
                    <Ticket className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-bold text-surface-600">No promotional coupons found</p>
                    <p className="text-xs mt-1">Click "Create Coupon" above to configure your first discount voucher.</p>
                  </div>
                ) : (
                  coupons.map(cp => (
                    <div key={cp.id} className="bg-white p-5 rounded-2xl border border-surface-200 shadow-xs space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-black text-lg text-brand-600 tracking-wider">{cp.code}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cp.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-surface-200 text-surface-600'}`}>
                          {cp.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="text-surface-700 font-semibold">
                          Discount: <strong className="text-surface-900">{cp.discountType === 'percentage' ? `${cp.discountValue}%` : `£${cp.discountValue}`}</strong>
                        </div>
                        <div className="text-surface-500">Min. Spend: £{(cp.minOrderAmount || 0).toLocaleString()}</div>
                        <div className="text-surface-500">Uses: {cp.usesCount || 0} {cp.maxUses ? `/ ${cp.maxUses}` : ''}</div>
                      </div>

                      <div className="pt-2 border-t border-surface-100 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              await api.coupons.adminUpdate(cp.id, { isActive: !cp.isActive });
                              showToast(`Coupon ${cp.isActive ? 'deactivated' : 'activated'}`);
                              loadCoupons();
                            }}
                            className="text-xs font-bold text-surface-600 hover:text-surface-900 cursor-pointer"
                          >
                            {cp.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingCoupon(cp);
                              setIsCouponModalOpen(true);
                            }}
                            className="text-xs font-bold text-brand-600 hover:text-brand-800 cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            openDeleteConfirm({
                              title: 'Delete Coupon',
                              itemName: cp.code,
                              message: `Are you sure you want to delete promo coupon "${cp.code}"? Customers will no longer be able to use it at checkout.`,
                              onConfirm: async () => {
                                await api.coupons.adminDelete(cp.id);
                                showToast('Coupon deleted');
                                loadCoupons();
                              }
                            });
                          }}
                          className="text-xs font-bold text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 12: ADMIN STAFF */}
          {currentTab === 'admins' && (
            <div className="space-y-0">
              <div className="sticky top-0 z-20 bg-surface-100/95 backdrop-blur-md -mt-3 sm:-mt-4 pt-3 sm:pt-4 pb-3.5 -mx-4 sm:-mx-8 px-4 sm:px-8 border-b border-surface-200/80 mb-0 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h1 className="font-display font-black text-2xl text-surface-900">Administrative Staff &amp; Roles</h1>
                  <p className="text-xs text-surface-500">Manage administrator accounts and team permissions stored in Supabase profiles.</p>
                </div>

                <button
                  onClick={() => setIsAdminUserModalOpen(true)}
                  className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Admin User</span>
                </button>
              </div>

              <div className="pt-6 sm:pt-8">
                <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-xs">
                {adminUsers.length === 0 ? (
                  <div className="p-12 text-center text-surface-400">
                    <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-bold text-surface-600">No staff members found</p>
                    <p className="text-xs mt-1">Click "Add Admin User" above to grant administrative portal access.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-50 border-b border-surface-200 text-surface-600 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3.5">Name</th>
                        <th className="p-3.5">Email</th>
                        <th className="p-3.5">Role</th>
                        <th className="p-3.5">Created</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100">
                      {adminUsers.map(u => (
                        <tr key={u.id} className="hover:bg-surface-50/60">
                          <td className="p-3.5 font-bold text-surface-900">{u.firstName || u.first_name} {u.lastName || u.last_name}</td>
                          <td className="p-3.5 text-surface-600 font-mono">{u.email}</td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-purple-600" />
                              Administrator
                            </span>
                          </td>
                          <td className="p-3.5 text-surface-500">{u.created_at || u.createdAt ? new Date(u.created_at || u.createdAt).toLocaleDateString('en-GB') : '—'}</td>
                          <td className="p-3.5 text-right whitespace-nowrap space-x-2">
                            <button
                              onClick={() => {
                                setEditingAdminUser(u);
                                setIsEditAdminModalOpen(true);
                              }}
                              className="px-2.5 py-1 text-xs font-bold text-surface-700 hover:text-surface-900 bg-surface-100 hover:bg-surface-200 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                              title="Edit Administrator Details"
                            >
                              <Edit className="w-3.5 h-3.5 text-surface-500" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => {
                                const isSelf = u.id === admin?.id || u.email === admin?.email;
                                openDeleteConfirm({
                                  title: 'Remove Administrator',
                                  itemName: u.email,
                                  message: isSelf
                                    ? `Warning: You are deleting your own currently active administrator account ("${u.email}"). You will be logged out immediately upon deletion.`
                                    : `Are you sure you want to permanently remove administrator access for "${u.email}"? They will no longer be able to log in to the admin panel.`,
                                  onConfirm: async () => {
                                    await api.adminAuth.deleteUser(u.id);
                                    showToast('Admin user deleted and access revoked');
                                    if (isSelf) {
                                      adminLogout();
                                    } else {
                                      loadAdminUsers();
                                    }
                                  }
                                });
                              }}
                              className="px-2.5 py-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                              title="Delete Administrator"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL: ORDER DETAILS */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-surface-200 p-6 text-left space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-surface-200">
              <div>
                <h3 className="font-display font-black text-lg text-surface-900">Order {selectedOrder.id}</h3>
                <span className="text-xs text-surface-500">Placed on {selectedOrder.createdAt}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-surface-100 rounded">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-surface-50 p-4 rounded-xl">
              <div>
                <span className="text-surface-400 font-bold block mb-1">Customer Details</span>
                <div className="font-bold text-surface-900">{selectedOrder.customerName}</div>
                <div className="text-surface-600">{selectedOrder.company}</div>
                <div className="text-surface-600">{selectedOrder.customerEmail}</div>
                <div className="text-surface-600">{selectedOrder.customerPhone}</div>
              </div>
              <div>
                <span className="text-surface-400 font-bold block mb-1">Delivery Address</span>
                <div className="text-surface-800">{selectedOrder.shippingAddress?.addressLine1 || selectedOrder.shippingAddress?.address}</div>
                <div className="text-surface-800">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postcode}</div>
                <div className="text-surface-800">{selectedOrder.shippingAddress?.country || 'United Kingdom'}</div>
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-surface-100 text-xs">
              <span className="font-bold text-surface-800 block mb-2">Ordered Hardware &amp; Materials</span>
              {selectedOrder.items?.map((item, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={item.image} alt="" className="w-10 h-10 object-contain rounded border p-0.5" />
                    <div>
                      <div className="font-bold text-surface-900">{item.name}</div>
                      <div className="text-[11px] text-surface-500">Qty: {item.quantity} • SKU: {item.sku}</div>
                    </div>
                  </div>
                  <div className="font-bold text-surface-900">
                    £{((item.price || 0) * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-surface-200 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-surface-500">Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getOrderStatusBadge(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div className="text-base font-display font-black text-surface-900">
                Total: £{(selectedOrder.total || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-surface-200 p-6 text-left max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-surface-200">
              <h3 className="font-display font-black text-lg text-surface-900">
                {editingProduct.id ? 'Edit Equipment' : 'Add New Hardware'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-1 hover:bg-surface-100 rounded">✕</button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                if (editingProduct.id) {
                  await api.products.update(editingProduct.id, editingProduct);
                  showToast('Product updated');
                } else {
                  await api.products.create(editingProduct);
                  showToast('Product created');
                }
                setIsProductModalOpen(false);
                loadProducts();
              } catch (err) {
                showToast(err.message, true);
              }
            }} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-surface-800 mb-1">Product Title *</label>
                <input
                  required
                  type="text"
                  value={editingProduct.name || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-surface-300 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block font-bold text-surface-800">Brand *</label>
                    {isCustomBrand && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomBrand(false);
                          setEditingProduct({ ...editingProduct, brand: 'Raise3D' });
                        }}
                        className="text-[10px] text-brand-600 font-bold hover:underline cursor-pointer"
                      >
                        ← Choose from list
                      </button>
                    )}
                  </div>

                  {!isCustomBrand ? (
                    <select
                      required
                      value={editingProduct.brand || 'Raise3D'}
                      onChange={e => {
                        if (e.target.value === '__custom__') {
                          setIsCustomBrand(true);
                          setEditingProduct({ ...editingProduct, brand: '' });
                        } else {
                          setEditingProduct({ ...editingProduct, brand: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 border border-surface-300 rounded-xl bg-white focus:outline-none cursor-pointer"
                    >
                      {Array.from(new Set([
                        ...(brands && brands.length > 0 
                            ? brands.map(b => b.name || b.id).filter(Boolean)
                            : ['Raise3D', 'INTAMSYS', 'Modix', 'Formlabs', 'Shining 3D', 'CreatBot', 'BASF Forward AM', 'Polymaker', 'Drywise']),
                        ...(editingProduct.brand ? [editingProduct.brand] : [])
                      ])).sort().map(bName => (
                        <option key={bName} value={bName}>{bName}</option>
                      ))}
                      <option value="__custom__">+ Add Custom / Other Brand...</option>
                    </select>
                  ) : (
                    <input
                      required
                      type="text"
                      placeholder="Type custom brand name..."
                      value={editingProduct.brand || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                      className="w-full px-3 py-2 border border-brand-400 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 bg-brand-50/20 font-medium"
                      autoFocus
                    />
                  )}
                </div>

                <div>
                  <label className="block font-bold text-surface-800 mb-1">Category *</label>
                  <select
                    value={editingProduct.categoryId || 'industrial-fdm'}
                    onChange={e => setEditingProduct({ 
                      ...editingProduct, 
                      categoryId: e.target.value,
                      categoryName: e.target.options[e.target.selectedIndex].text
                    })}
                    className="w-full px-3 py-2 border border-surface-300 rounded-xl bg-white focus:outline-none cursor-pointer"
                  >
                    {categories && categories.length > 0 ? (
                      categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="industrial-fdm">Industrial 3D Printers</option>
                        <option value="large-format">Large Format (LFAM) &amp; Pellet</option>
                        <option value="high-temp">High-Temperature PEEK / Ultem</option>
                        <option value="sls-powder">SLS Powder Bed Fusion</option>
                        <option value="resin-sla">Resin (SLA / DLP / LCD)</option>
                        <option value="scanners">Industrial 3D Scanners</option>
                        <option value="materials">Engineering Filaments &amp; Resins</option>
                        <option value="accessories">Ancillaries &amp; Post-Processing</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block font-bold text-surface-800 mb-1">Price (£) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.price ?? 0}
                    onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-surface-300 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-surface-800 mb-1">Stock Status *</label>
                  <select
                    value={editingProduct.inStock !== false ? 'in_stock' : 'out_of_stock'}
                    onChange={e => {
                      const isNowInStock = e.target.value === 'in_stock';
                      setEditingProduct({
                        ...editingProduct,
                        inStock: isNowInStock,
                        stockQuantity: isNowInStock ? (editingProduct.stockQuantity > 0 ? editingProduct.stockQuantity : 10) : 0
                      });
                    }}
                    className={`w-full px-3 py-2 border rounded-xl font-bold cursor-pointer focus:outline-none text-xs ${
                      editingProduct.inStock !== false
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                        : 'border-red-300 bg-red-50 text-red-800'
                    }`}
                  >
                    <option value="in_stock">✓ In Stock</option>
                    <option value="out_of_stock">✕ Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-surface-800 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.stockQuantity ?? 10}
                    onChange={e => {
                      const qty = parseInt(e.target.value) || 0;
                      setEditingProduct({ 
                        ...editingProduct, 
                        stockQuantity: qty,
                        inStock: qty > 0 ? true : false
                      });
                    }}
                    className="w-full px-3 py-2 border border-surface-300 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-surface-800 mb-1">Min. Stock Alert</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 5"
                    value={editingProduct.minStock ?? 5}
                    onChange={e => setEditingProduct({ ...editingProduct, minStock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-surface-300 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-surface-800 mb-1">SKU</label>
                  <input
                    type="text"
                    value={editingProduct.sku || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-300 rounded-xl focus:outline-none uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                {(() => {
                  const currentBadges = editingProduct.badge
                    ? String(editingProduct.badge).split(',').map(b => b.trim()).filter(Boolean)
                    : [];

                  const toggleBadge = (badgeName) => {
                    let updated;
                    if (currentBadges.includes(badgeName)) {
                      updated = currentBadges.filter(b => b !== badgeName);
                    } else {
                      updated = [...currentBadges, badgeName];
                    }
                    const badgeStr = updated.join(', ');
                    setEditingProduct({
                      ...editingProduct,
                      badge: badgeStr,
                      isFeatured: updated.includes('Featured')
                    });
                  };

                  const handleAddCustomBadge = () => {
                    const trimmed = customBadgeInput.trim();
                    if (!trimmed) return;
                    if (!currentBadges.includes(trimmed)) {
                      const updated = [...currentBadges, trimmed];
                      const badgeStr = updated.join(', ');
                      setEditingProduct({
                        ...editingProduct,
                        badge: badgeStr,
                        isFeatured: updated.includes('Featured')
                      });
                    }
                    setCustomBadgeInput('');
                  };

                  const badgePresets = [
                    'Featured',
                    'Best Seller',
                    'New Arrival',
                    'Industrial Grade',
                    'Hot Deal',
                    'On Sale',
                    'Top Rated'
                  ];

                  const customBadges = currentBadges.filter(
                    b => !badgePresets.some(p => p.toLowerCase() === b.toLowerCase())
                  );

                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-surface-800">
                          Product Badges <span className="text-surface-500 font-normal text-[11px]">(Click to select multiple)</span>
                        </label>
                        {currentBadges.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-surface-700 bg-surface-100 px-2 py-0.5 rounded-full border border-surface-300">
                              {currentBadges.length} selected
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditingProduct({ ...editingProduct, badge: '', isFeatured: false })}
                              className="text-[10px] text-surface-400 hover:text-red-600 cursor-pointer font-semibold underline"
                            >
                              Clear all
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Preset Badges Toggle Buttons */}
                      <div className="flex flex-wrap gap-1.5">
                        {badgePresets.map(name => {
                          const isSelected = currentBadges.includes(name);
                          return (
                            <button
                              key={name}
                              type="button"
                              onClick={() => toggleBadge(name)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                                isSelected
                                  ? 'bg-surface-900 text-white border-surface-900 shadow-xs'
                                  : 'bg-white hover:bg-surface-50 text-surface-700 border-surface-300 shadow-2xs'
                              }`}
                            >
                              <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] font-black border ${
                                isSelected ? 'bg-white/20 border-white/40 text-white' : 'border-surface-300 text-transparent'
                              }`}>
                                ✓
                              </span>
                              <span>{name}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Badges Chips */}
                      {customBadges.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] text-surface-500 font-bold uppercase mr-1">Custom:</span>
                          {customBadges.map(b => (
                            <span key={b} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-surface-100 text-surface-800 border border-surface-300 rounded-lg text-xs font-bold">
                              <span>{b}</span>
                              <button
                                type="button"
                                onClick={() => toggleBadge(b)}
                                className="hover:text-red-600 text-surface-400 font-bold ml-1 cursor-pointer"
                                title="Remove badge"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Add Custom Badge Field */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Add custom badge (e.g. High Precision, Fast Dispatch)..."
                          value={customBadgeInput}
                          onChange={e => setCustomBadgeInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomBadge();
                            }
                          }}
                          className="flex-1 px-3 py-1.5 border border-surface-300 rounded-xl text-xs bg-white focus:outline-none focus:border-brand-500 shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomBadge}
                          className="px-3 py-1.5 bg-surface-900 hover:bg-surface-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer transition-all shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Badge</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="block font-bold text-surface-800 mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 border border-surface-300 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-surface-800 mb-1">Equipment Image</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={editingProduct.images?.[0] || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, images: [e.target.value] })}
                    placeholder="https://... or upload a photo"
                    className="flex-1 px-3 py-2 border border-surface-300 rounded-xl focus:outline-none text-xs"
                  />
                  <label className="px-3 py-2 bg-surface-800 hover:bg-surface-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0">
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingImage}
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingImage(true);
                        try {
                          const res = await api.products.uploadImage(file);
                          setEditingProduct(prev => ({
                            ...prev,
                            images: [res.url, ...(prev.images || []).slice(1)]
                          }));
                          showToast('Image uploaded to Supabase Storage');
                        } catch (err) {
                          showToast('Upload failed: ' + err.message, true);
                        } finally {
                          setUploadingImage(false);
                        }
                      }}
                    />
                  </label>
                </div>
                {editingProduct.images?.[0] && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={editingProduct.images[0]} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-surface-200" />
                    <span className="text-[10px] text-surface-400 truncate max-w-xs">{editingProduct.images[0]}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-surface-200">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-surface-100 hover:bg-surface-200 text-surface-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-sm"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT COUPON */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-surface-200 p-6 text-left space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-surface-200">
              <h3 className="font-display font-black text-lg text-surface-900">
                {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'New Promo Code'}
              </h3>
              <button onClick={() => { setIsCouponModalOpen(false); setEditingCoupon(null); }} className="p-1 hover:bg-surface-100 rounded">✕</button>
            </div>

            <form key={editingCoupon?.id || 'new_coupon'} onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const payload = {
                code: (fd.get('code') || '').toUpperCase().trim(),
                discountType: fd.get('discountType'),
                discountValue: parseFloat(fd.get('discountValue')) || 0,
                minOrderAmount: parseFloat(fd.get('minOrderAmount')) || 0,
                maxUses: fd.get('maxUses') ? parseInt(fd.get('maxUses')) : null,
                isActive: fd.get('isActive') === 'true'
              };
              try {
                if (editingCoupon?.id) {
                  await api.coupons.adminUpdate(editingCoupon.id, payload);
                  showToast('Coupon updated successfully');
                } else {
                  await api.coupons.adminCreate(payload);
                  showToast('Coupon created successfully');
                }
                setIsCouponModalOpen(false);
                setEditingCoupon(null);
                loadCoupons();
              } catch (err) {
                showToast(err.message, true);
              }
            }} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-surface-800 mb-1">Coupon Code *</label>
                <input
                  required
                  name="code"
                  defaultValue={editingCoupon?.code || ''}
                  placeholder="e.g. SPECIAL20"
                  className="w-full px-3 py-2 border border-surface-300 rounded-xl uppercase font-mono font-bold focus:outline-none focus:border-brand-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-surface-800 mb-1">Type</label>
                  <select
                    name="discountType"
                    defaultValue={editingCoupon?.discountType || 'percentage'}
                    className="w-full px-3 py-2 border border-surface-300 rounded-xl bg-white focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (£)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-surface-800 mb-1">Value *</label>
                  <input
                    required
                    name="discountValue"
                    type="number"
                    step="0.1"
                    defaultValue={editingCoupon?.discountValue ?? 10}
                    placeholder="10"
                    className="w-full px-3 py-2 border border-surface-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-surface-800 mb-1">Min. Order Spend (£)</label>
                  <input
                    name="minOrderAmount"
                    type="number"
                    defaultValue={editingCoupon?.minOrderAmount || 0}
                    placeholder="500"
                    className="w-full px-3 py-2 border border-surface-300 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-surface-800 mb-1">Max Redemptions</label>
                  <input
                    name="maxUses"
                    type="number"
                    defaultValue={editingCoupon?.maxUses || ''}
                    placeholder="Unlimited"
                    className="w-full px-3 py-2 border border-surface-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-surface-800 mb-1">Status</label>
                <select
                  name="isActive"
                  defaultValue={editingCoupon?.isActive !== false ? 'true' : 'false'}
                  className="w-full px-3 py-2 border border-surface-300 rounded-xl bg-white focus:outline-none"
                >
                  <option value="true">Active &amp; Redeemable</option>
                  <option value="false">Disabled / Paused</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-surface-200">
                <button
                  type="button"
                  onClick={() => { setIsCouponModalOpen(false); setEditingCoupon(null); }}
                  className="px-4 py-2 bg-surface-100 hover:bg-surface-200 text-surface-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ADMIN USER */}
      {isAdminUserModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-surface-200 p-6 text-left space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-surface-200">
              <h3 className="font-display font-black text-lg text-surface-900">New Admin Staff</h3>
              <button onClick={() => setIsAdminUserModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              try {
                await api.adminAuth.createUser({
                  firstName: fd.get('firstName'),
                  lastName: fd.get('lastName'),
                  email: fd.get('email'),
                  password: fd.get('password'),
                  role: fd.get('role')
                });
                showToast('Admin staff member added to Supabase profiles');
                setIsAdminUserModalOpen(false);
                loadAdminUsers();
              } catch (err) {
                showToast(err.message, true);
              }
            }} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <input required name="firstName" placeholder="First Name *" className="px-3 py-2 border rounded-xl" />
                <input required name="lastName" placeholder="Last Name *" className="px-3 py-2 border rounded-xl" />
              </div>
              <input required type="email" name="email" placeholder="Staff Email *" className="w-full px-3 py-2 border rounded-xl" />
              
              <div>
                <div className="relative">
                  <input 
                    required 
                    type={showNewAdminPassword ? "text" : "password"} 
                    name="password" 
                    placeholder="Set Passphrase / Password *" 
                    className="w-full px-3 py-2.5 pr-10 border border-surface-200 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewAdminPassword(prev => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-700 p-1 cursor-pointer"
                    title={showNewAdminPassword ? "Hide password" : "Show password"}
                  >
                    {showNewAdminPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-surface-400 mt-1">This password will be used by the new administrator to log in.</p>
              </div>

              <input type="hidden" name="role" value="admin" />
              <div className="flex items-center justify-between p-2.5 bg-surface-50 rounded-xl border border-surface-200">
                <span className="text-xs font-bold text-surface-600">Assigned Role:</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-purple-600" />
                  Administrator
                </span>
              </div>
              <button type="submit" className="w-full py-2.5 bg-surface-900 text-white font-bold rounded-xl cursor-pointer">
                Add Staff Member
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ADMIN USER */}
      {isEditAdminModalOpen && editingAdminUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-surface-200 p-6 text-left space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-surface-200">
              <div>
                <h3 className="font-display font-black text-lg text-surface-900">Edit Administrator</h3>
                <p className="text-xs text-surface-500">Update staff details and security credentials</p>
              </div>
              <button 
                onClick={() => {
                  setIsEditAdminModalOpen(false);
                  setEditingAdminUser(null);
                }}
                className="p-1 hover:bg-surface-100 rounded-lg text-surface-400 hover:text-surface-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              try {
                const firstName = fd.get('firstName');
                const lastName = fd.get('lastName');
                const password = fd.get('password');

                await api.adminAuth.updateUser(editingAdminUser.id, {
                  firstName,
                  lastName,
                  password: password ? String(password).trim() : undefined
                });
                showToast('Administrator updated successfully');
                setIsEditAdminModalOpen(false);
                setEditingAdminUser(null);
                loadAdminUsers();
                if (editingAdminUser.id === admin?.id || editingAdminUser.email === admin?.email) {
                  api.adminAuth.getProfile().then(res => {
                    if (res?.admin) setAdmin(res.admin);
                  });
                }
              } catch (err) {
                showToast(err.message, true);
              }
            }} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-surface-700 mb-1">First Name *</label>
                  <input 
                    required 
                    name="firstName" 
                    defaultValue={editingAdminUser.firstName || editingAdminUser.first_name || ''} 
                    placeholder="First Name" 
                    className="w-full px-3 py-2 border border-surface-200 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-surface-700 mb-1">Last Name</label>
                  <input 
                    name="lastName" 
                    defaultValue={editingAdminUser.lastName || editingAdminUser.last_name || ''} 
                    placeholder="Last Name" 
                    className="w-full px-3 py-2 border border-surface-200 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-surface-700 mb-1">Email Address</label>
                <input 
                  disabled
                  value={editingAdminUser.email || ''} 
                  className="w-full px-3 py-2 bg-surface-100 border border-surface-200 rounded-xl text-xs font-mono text-surface-600 cursor-not-allowed" 
                />
                <span className="text-[10px] text-surface-400 mt-0.5 block">Email address is permanently bound to authentication ID.</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-surface-700 mb-1">New Passphrase (Optional)</label>
                <div className="relative">
                  <input 
                    type={showEditAdminPassword ? "text" : "password"} 
                    name="password" 
                    placeholder="Leave blank to keep existing password" 
                    className="w-full px-3 py-2 pr-10 border border-surface-200 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditAdminPassword(prev => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-700 p-1 cursor-pointer"
                    title={showEditAdminPassword ? "Hide password" : "Show password"}
                  >
                    {showEditAdminPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-surface-50 rounded-xl border border-surface-200">
                <span className="text-xs font-bold text-surface-600">Assigned Role:</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-purple-600" />
                  Administrator
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditAdminModalOpen(false);
                    setEditingAdminUser(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-surface-600 hover:bg-surface-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW ENQUIRY & INTERNAL NOTES */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-surface-200 p-6 text-left space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-surface-200">
              <div>
                <h3 className="font-display font-black text-lg text-surface-900">Inquiry #{selectedEnquiry.id}</h3>
                <span className="text-[11px] text-surface-500">
                  Received on {selectedEnquiry.created_at ? new Date(selectedEnquiry.created_at).toLocaleString('en-GB') : 'Direct Lead'}
                </span>
              </div>
              <button onClick={() => setSelectedEnquiry(null)} className="p-1 hover:bg-surface-100 rounded">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-surface-50 p-4 rounded-xl border border-surface-200">
              <div>
                <span className="text-surface-400 font-bold block mb-1">Contact Details</span>
                <div className="font-bold text-surface-900">{selectedEnquiry.name}</div>
                <div className="text-surface-600 font-mono text-[11px]">{selectedEnquiry.email}</div>
                <div className="text-surface-600">{selectedEnquiry.phone || 'No phone provided'}</div>
                <div className="text-surface-700 font-semibold mt-1">{selectedEnquiry.company || 'Private Client'}</div>
              </div>
              <div>
                <span className="text-surface-400 font-bold block mb-1">Submission Context</span>
                <div className="font-bold text-surface-900 uppercase font-mono">{(selectedEnquiry.type || 'general').replace('_', ' ')}</div>
                <div className="mt-2">
                  <label className="block text-[10px] font-bold text-surface-500 mb-1">Inquiry Status</label>
                  <select
                    value={selectedEnquiry.status || 'New'}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      setSelectedEnquiry(prev => ({ ...prev, status: newStatus }));
                      await api.enquiries.adminUpdate(selectedEnquiry.id, { status: newStatus });
                      showToast(`Status updated to ${newStatus}`);
                      loadEnquiries();
                    }}
                    className={`px-2.5 py-1.5 border rounded-lg text-xs font-bold cursor-pointer w-full transition-colors shadow-2xs ${getEnquiryStatusSelectClass(selectedEnquiry.status)}`}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-surface-700 block">Message / Technical Requirements:</span>
              <div className="bg-surface-50 p-3.5 rounded-xl border border-surface-200 text-surface-800 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                {selectedEnquiry.message || 'Consultation request for industrial additive equipment.'}
              </div>
            </div>

            {selectedEnquiry.details && typeof selectedEnquiry.details === 'object' && Object.keys(selectedEnquiry.details).some(k => selectedEnquiry.details[k]) && (
              <div className="bg-surface-50 p-3.5 rounded-xl border border-surface-200 space-y-1.5 text-xs">
                <span className="font-bold text-surface-700 block">Service &amp; Specification Parameters:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {selectedEnquiry.details.serviceType && (
                    <div><span className="text-surface-500 font-medium">Service / Solution:</span> <span className="font-bold text-surface-900">{selectedEnquiry.details.serviceType}</span></div>
                  )}
                  {selectedEnquiry.details.timeframe && (
                    <div><span className="text-surface-500 font-medium">Target Timeframe:</span> <span className="font-semibold text-surface-800">{selectedEnquiry.details.timeframe}</span></div>
                  )}
                  {selectedEnquiry.details.specs && (
                    <div className="col-span-full"><span className="text-surface-500 font-medium">Project Scope:</span> <span className="text-surface-800">{selectedEnquiry.details.specs}</span></div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-surface-200">
              <label className="font-bold text-surface-800 block">Internal Staff Notes &amp; Follow-up Logs</label>
              <textarea
                rows={3}
                value={enquiryNotes}
                onChange={e => setEnquiryNotes(e.target.value)}
                placeholder="Log internal follow-up, pricing quoted, or sales engineer assigned..."
                className="w-full px-3 py-2 border border-surface-300 rounded-xl focus:outline-none focus:border-brand-500 text-xs"
              />
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-surface-400">Notes are synced live to Supabase and visible to admin staff.</span>
                <button
                  disabled={savingNotes}
                  onClick={async () => {
                    setSavingNotes(true);
                    try {
                      await api.enquiries.adminUpdate(selectedEnquiry.id, { 
                        internalNotes: enquiryNotes,
                        status: selectedEnquiry.status
                      });
                      showToast('Internal notes saved to Supabase');
                      loadEnquiries();
                    } catch (err) {
                      showToast('Failed to save notes', true);
                    } finally {
                      setSavingNotes(false);
                    }
                  }}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  {savingNotes ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CUSTOMER DETAILS & ORDER HISTORY */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-surface-200 p-6 text-left space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-surface-200">
              <div>
                <h3 className="font-display font-black text-lg text-surface-900">
                  {selectedCustomer.name || `${selectedCustomer.firstName || ''} ${selectedCustomer.lastName || ''}`.trim() || 'Client Account'}
                </h3>
                <span className="text-[11px] text-surface-500 font-mono">{selectedCustomer.email}</span>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-1 hover:bg-surface-100 rounded">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-surface-50 p-4 rounded-xl border border-surface-200">
              <div>
                <span className="text-[10px] text-surface-400 font-bold block uppercase tracking-wider">Orders Placed</span>
                <div className="font-bold text-surface-900 mt-0.5">{selectedCustomer.orderCount || selectedCustomer.order_count || selectedCustomer.orders?.length || 0}</div>
              </div>
              <div>
                <span className="text-[10px] text-surface-400 font-bold block uppercase tracking-wider">Total Spend</span>
                <div className="font-black text-emerald-700 text-sm mt-0.5">
                  £{(selectedCustomer.totalSpend || selectedCustomer.total_spend || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Customer Status & Account Role */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-surface-200">
              <div>
                <span className="font-bold text-surface-800">Account Status: </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedCustomer.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {selectedCustomer.isActive !== false ? 'Active' : 'Suspended'}
                </span>
              </div>
              <button
                onClick={async () => {
                  const newStatus = selectedCustomer.isActive === false;
                  try {
                    await api.customers.adminUpdate(selectedCustomer.id, { isActive: newStatus });
                    setSelectedCustomer(prev => ({ ...prev, isActive: newStatus }));
                    showToast(`Account ${newStatus ? 'activated' : 'suspended'}`);
                    loadCustomers();
                  } catch (e) {
                    showToast('Failed to update account status', true);
                  }
                }}
                className="px-3 py-1.5 bg-white border border-surface-300 hover:bg-surface-100 rounded-lg font-bold text-surface-700 cursor-pointer"
              >
                {selectedCustomer.isActive !== false ? 'Suspend Account' : 'Reactivate Account'}
              </button>
            </div>

            {/* Orders History */}
            <div className="space-y-2">
              <h4 className="font-bold text-surface-800">Order History ({selectedCustomer.orders?.length || 0})</h4>
              {(!selectedCustomer.orders || selectedCustomer.orders.length === 0) ? (
                <div className="p-6 text-center text-surface-400 bg-surface-50 rounded-xl border border-surface-100">
                  No orders placed by this customer yet.
                </div>
              ) : (
                <div className="border border-surface-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-50 text-surface-600 font-bold text-[10px] uppercase">
                      <tr>
                        <th className="p-2.5">Order ID</th>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Items</th>
                        <th className="p-2.5">Total</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100">
                      {selectedCustomer.orders.map(ord => (
                        <tr key={ord.id}>
                          <td className="p-2.5 font-mono font-bold text-surface-900">{ord.id}</td>
                          <td className="p-2.5 text-surface-500">{new Date(ord.createdAt).toLocaleDateString('en-GB')}</td>
                          <td className="p-2.5">{ord.items?.length || 1} item(s)</td>
                          <td className="p-2.5 font-black text-surface-900">£{(ord.total || 0).toLocaleString()}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-100 text-surface-700">
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-surface-200">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-surface-100 hover:bg-surface-200 text-surface-700 font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CATEGORY */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-surface-200 p-6 text-left space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-surface-200">
              <h3 className="font-display font-black text-lg text-surface-900">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'New Hardware Category'}
              </h3>
              <button onClick={() => { setIsCategoryModalOpen(false); setEditingCategory(null); }} className="p-1 hover:bg-surface-100 rounded">✕</button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const payload = {
                name: fd.get('name'),
                id: fd.get('slug') || fd.get('name').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                description: fd.get('description'),
                badge: fd.get('badge'),
                image: fd.get('image')
              };
              try {
                if (editingCategory?.id) {
                  await api.categories.update(editingCategory.id, payload);
                  showToast('Category updated in Supabase');
                } else {
                  await api.categories.create(payload);
                  showToast('Category created in Supabase');
                }
                setIsCategoryModalOpen(false);
                setEditingCategory(null);
                loadCategories();
              } catch (err) {
                showToast(err.message, true);
              }
            }} className="space-y-3">
              <div>
                <label className="block font-bold text-surface-800 mb-1">Category Name *</label>
                <input
                  required
                  name="name"
                  defaultValue={editingCategory?.name || ''}
                  placeholder="e.g. Industrial 3D Printers"
                  className="w-full px-3 py-2 border border-surface-300 rounded-xl focus:outline-none focus:border-brand-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-surface-800 mb-1">Slug / Identifier</label>
                <input
                  name="slug"
                  defaultValue={editingCategory?.id || ''}
                  placeholder="e.g. industrial-fdm"
                  className="w-full px-3 py-2 border border-surface-300 rounded-xl focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-surface-800 mb-1">Description</label>
                <textarea
                  rows={3}
                  name="description"
                  defaultValue={editingCategory?.description || ''}
                  placeholder="Summary of this hardware category..."
                  className="w-full px-3 py-2 border border-surface-300 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-surface-800 mb-1">Category Badge / Tagline</label>
                <input
                  name="badge"
                  defaultValue={editingCategory?.badge || ''}
                  placeholder="e.g. Meter Scale, Aerospace Class, Support-Free, Production Grade"
                  className="w-full px-3 py-2 border border-surface-300 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-surface-800 mb-1">Category Image URL</label>
                <div className="flex gap-2">
                  <input
                    name="image"
                    id="cat_image_input"
                    defaultValue={editingCategory?.image || ''}
                    placeholder="https://... or upload photo"
                    className="flex-1 px-3 py-2 border border-surface-300 rounded-xl focus:outline-none"
                  />
                  <label className="px-3 py-2 bg-surface-800 hover:bg-surface-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0">
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const res = await api.categories.uploadImage(file);
                          const el = document.getElementById('cat_image_input');
                          if (el) el.value = res.url;
                          showToast('Image uploaded');
                        } catch (err) {
                          showToast('Upload failed: ' + err.message, true);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-surface-200">
                <button
                  type="button"
                  onClick={() => { setIsCategoryModalOpen(false); setEditingCategory(null); }}
                  className="px-4 py-2 bg-surface-100 hover:bg-surface-200 text-surface-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT BRAND */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-surface-200 p-6 text-left space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-surface-200">
              <h3 className="font-display font-black text-lg text-surface-900">
                {editingBrand ? `Edit Manufacturer: ${editingBrand.name}` : 'New Manufacturer / Brand'}
              </h3>
              <button onClick={() => { setIsBrandModalOpen(false); setEditingBrand(null); }} className="p-1 hover:bg-surface-100 rounded">✕</button>
            </div>

            <form key={editingBrand?.id || 'new_brand'} onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const brandName = (fd.get('name') || '').trim();
              if (!brandName) {
                showToast('Brand name is required', true);
                return;
              }
              const brandSlug = editingBrand?.id || brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `brand-${Date.now()}`;
              const payload = {
                name: brandName,
                id: brandSlug,
                category: fd.get('category') || 'Industrial 3D Printers',
                origin: fd.get('origin') || 'International',
                status: fd.get('status') || 'Active Partner',
                tagline: fd.get('tagline') || '',
                description: fd.get('description') || '',
                website: fd.get('website') || '',
                logoImage: fd.get('logoImage') || ''
              };
              try {
                if (editingBrand?.id) {
                  await api.brands.update(editingBrand.id, payload);
                  showToast('Brand updated successfully');
                } else {
                  await api.brands.create(payload);
                  showToast('Brand created successfully');
                }
                setIsBrandModalOpen(false);
                setEditingBrand(null);
                loadBrands();
              } catch (err) {
                showToast(err.message || 'Failed to save brand', true);
              }
            }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-surface-800 mb-1">Brand Name *</label>
                  <input
                    required
                    name="name"
                    defaultValue={editingBrand?.name || ''}
                    placeholder="e.g. Stratasys"
                    className="w-full px-3 py-2 border border-surface-300 rounded-xl focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-surface-800 mb-1">Country of Origin</label>
                  <input
                    name="origin"
                    defaultValue={editingBrand?.origin || 'United Kingdom'}
                    placeholder="e.g. Germany"
                    className="w-full px-3 py-2 border border-surface-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-surface-800 mb-1">Partnership Status</label>
                  <input
                    name="status"
                    defaultValue={editingBrand?.status || 'Official UK Distributor'}
                    placeholder="e.g. Certified Partner"
                    className="w-full px-3 py-2 border border-surface-300 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-surface-800 mb-1">Category</label>
                  <input
                    name="category"
                    defaultValue={editingBrand?.category || 'Industrial 3D Printers'}
                    placeholder="e.g. Industrial 3D Printers"
                    className="w-full px-3 py-2 border border-surface-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-surface-800 mb-1">Tagline</label>
                <input
                  name="tagline"
                  defaultValue={editingBrand?.tagline || ''}
                  placeholder="e.g. Pioneering polymer additive technology"
                  className="w-full px-3 py-2 border border-surface-300 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-surface-800 mb-1">Website URL</label>
                <input
                  name="website"
                  defaultValue={editingBrand?.website || ''}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-surface-300 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-surface-800 mb-1">Logo Image URL</label>
                <div className="flex gap-2">
                  <input
                    name="logoImage"
                    id="brand_logo_input"
                    defaultValue={editingBrand?.logoImage || ''}
                    placeholder="https://... or upload brand logo"
                    className="flex-1 px-3 py-2 border border-surface-300 rounded-xl focus:outline-none"
                  />
                  <label className="px-3 py-2 bg-surface-800 hover:bg-surface-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0">
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const res = await api.brands.uploadLogo(file);
                          const el = document.getElementById('brand_logo_input');
                          if (el) el.value = res.url;
                          showToast('Logo uploaded');
                        } catch (err) {
                          showToast('Upload failed: ' + err.message, true);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-surface-200">
                <button
                  type="button"
                  onClick={() => { setIsBrandModalOpen(false); setEditingBrand(null); }}
                  className="px-4 py-2 bg-surface-100 hover:bg-surface-200 text-surface-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  Save Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT BLOG */}
      {isBlogModalOpen && editingBlog && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-surface-200 p-6 text-left max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-surface-200">
              <h3 className="font-display font-black text-lg text-surface-900">
                {editingBlog.id ? 'Edit Article' : 'Publish Technical Article'}
              </h3>
              <button onClick={() => setIsBlogModalOpen(false)} className="p-1 hover:bg-surface-100 rounded">✕</button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                if (editingBlog.id) {
                  await api.blogs.adminUpdate(editingBlog.id, editingBlog);
                  showToast('Article updated');
                } else {
                  await api.blogs.adminCreate(editingBlog);
                  showToast('Article published');
                }
                setIsBlogModalOpen(false);
                loadBlogs();
              } catch (err) {
                showToast(err.message, true);
              }
            }} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-surface-800 mb-1">Title *</label>
                <input
                  required
                  type="text"
                  value={editingBlog.title || ''}
                  onChange={e => setEditingBlog({ ...editingBlog, title: e.target.value })}
                  className="w-full px-3 py-2 border border-surface-300 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-surface-800 mb-1">Category</label>
                  <select
                    value={editingBlog.category || 'Case Studies'}
                    onChange={e => setEditingBlog({ ...editingBlog, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="Case Studies">Case Studies</option>
                    <option value="Technical Guides">Technical Guides</option>
                    <option value="Material Science">Material Science</option>
                    <option value="Industry Insights">Industry Insights</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-surface-800 mb-1">Tag</label>
                  <input
                    type="text"
                    value={editingBlog.tag || ''}
                    onChange={e => setEditingBlog({ ...editingBlog, tag: e.target.value })}
                    placeholder="e.g. LFAM Pellet"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-surface-800 mb-1">Author Name</label>
                  <input
                    type="text"
                    value={editingBlog.author || ''}
                    onChange={e => setEditingBlog({ ...editingBlog, author: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-surface-800 mb-1">Author Role</label>
                  <input
                    type="text"
                    value={editingBlog.authorRole || ''}
                    onChange={e => setEditingBlog({ ...editingBlog, authorRole: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-surface-800 mb-1">Featured Image URL</label>
                <input
                  type="text"
                  value={editingBlog.image || ''}
                  onChange={e => setEditingBlog({ ...editingBlog, image: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-surface-800 mb-1">Summary</label>
                <textarea
                  rows={2}
                  value={editingBlog.summary || ''}
                  onChange={e => setEditingBlog({ ...editingBlog, summary: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-surface-800 mb-1">Content (Markdown / HTML)</label>
                <textarea
                  rows={6}
                  required
                  value={editingBlog.content || ''}
                  onChange={e => setEditingBlog({ ...editingBlog, content: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-surface-200">
                <button
                  type="button"
                  onClick={() => setIsBlogModalOpen(false)}
                  className="px-4 py-2 bg-surface-100 hover:bg-surface-200 text-surface-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-sm"
                >
                  Save Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Universal Delete Confirmation Popup Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-surface-900">
                  {deleteConfirm.title}
                </h3>
                <p className="text-sm text-surface-600 mt-1">
                  {deleteConfirm.message}
                </p>
                {deleteConfirm.itemName && (
                  <div className="mt-3 px-3 py-2 bg-red-50/70 border border-red-200 rounded-xl text-xs font-semibold text-red-800 break-all">
                    {deleteConfirm.itemName}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-100">
              <button
                type="button"
                onClick={closeDeleteConfirm}
                disabled={deleteConfirm.isProcessing}
                className="px-4 py-2 text-sm font-semibold text-surface-700 bg-surface-100 hover:bg-surface-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeConfirmedDelete}
                disabled={deleteConfirm.isProcessing}
                className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl transition-colors shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {deleteConfirm.isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Permanently
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
