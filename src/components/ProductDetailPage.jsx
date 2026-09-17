import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Phone, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  Star, 
  ChevronRight,
  MessageSquare,
  Lock,
  Check
} from 'lucide-react';
import { products } from '../data/products';
import ProductCard from './ProductCard';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Color and sentiment config based on star rating count
export const getRatingConfig = (rating) => {
  const num = Math.round(Number(rating) || 0);
  switch (num) {
    case 1:
      return {
        label: 'Poor',
        color: 'text-red-500',
        fill: 'fill-red-500',
        bg: 'bg-red-50',
        border: 'border-red-200',
        badge: 'bg-red-100 text-red-700 border-red-200'
      };
    case 2:
      return {
        label: 'Fair',
        color: 'text-orange-500',
        fill: 'fill-orange-500',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        badge: 'bg-orange-100 text-orange-700 border-orange-200'
      };
    case 3:
      return {
        label: 'Good',
        color: 'text-amber-500',
        fill: 'fill-amber-400',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        badge: 'bg-amber-100 text-amber-800 border-amber-200'
      };
    case 4:
      return {
        label: 'Very Good',
        color: 'text-emerald-500',
        fill: 'fill-emerald-500',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        badge: 'bg-emerald-100 text-emerald-700 border-emerald-200'
      };
    case 5:
    default:
      return {
        label: 'Excellent',
        color: 'text-emerald-600',
        fill: 'fill-emerald-600',
        bg: 'bg-emerald-50/80',
        border: 'border-emerald-200',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-200'
      };
  }
};

export default function ProductDetailPage({ 
  product: initialProduct, 
  onBack,
  onNavigate,
  onAddToCart, 
  onSelectProduct,
  onOpenConsultation,
  onToggleWishlist,
  onOpenCustomerAuth,
  isWishlisted = false
}) {
  if (!initialProduct) return null;

  const [product, setProduct] = useState(initialProduct);

  useEffect(() => {
    setProduct(initialProduct);
  }, [initialProduct]);

  useEffect(() => {
    const handleStockUpdate = async () => {
      if (initialProduct?.id) {
        try {
          const fresh = await api.products.get(initialProduct.id);
          if (fresh) setProduct(fresh);
        } catch (e) {}
      }
    };
    window.addEventListener('forge3d_products_updated', handleStockUpdate);
    return () => window.removeEventListener('forge3d_products_updated', handleStockUpdate);
  }, [initialProduct?.id]);

  const { customer } = useAuth();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'specs' | 'features' | 'reviews'

  // CRITICAL USER RULE: Only mark Out of Stock if stock is 0 (stockQuantity <= 0)
  const isOutOfStock = (product.stockQuantity !== undefined && product.stockQuantity !== null)
    ? Number(product.stockQuantity) <= 0
    : (!product.inStock && (product.stock === 0 || product.stockQuantity === 0));
  const maxAvailableQuantity = Math.max(1, product.stockQuantity || 99);

  // Dynamic Reviews State
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewNotice, setReviewNotice] = useState(null);

  const loadReviews = async () => {
    if (!product?.id) return;
    try {
      const res = await api.reviews.list(product.id);
      setReviewsList(res || []);
    } catch (err) {
      console.warn('Could not load reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    setReviewsLoading(true);
    loadReviews();

    // Subscribe to real-time review changes
    const unsub = api.realtime.subscribeReviews(() => {
      loadReviews();
    });

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [product?.id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!customer) return;
    setReviewSubmitting(true);
    try {
      await api.reviews.submit({
        productId: product.id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment
      });
      setReviewNotice('Thank you! Your verified equipment review has been published.');
      setReviewTitle('');
      setReviewComment('');
      await loadReviews();
    } catch (err) {
      setReviewNotice('Failed to submit review: ' + (err.message || 'Please try again.'));
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Real-time calculated overall rating
  const reviewsCount = reviewsList.length;
  const averageRating = reviewsCount > 0
    ? (reviewsList.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviewsCount).toFixed(1)
    : null;

  // Guarantee 4 related products by scoring category/brand relevance with fallback
  const relatedProducts = products
    .filter(p => p.id !== product.id)
    .sort((a, b) => {
      const aScore = (a.category === product.category ? 3 : 0) + (a.brand === product.brand ? 2 : 0);
      const bScore = (b.category === product.category ? 3 : 0) + (b.brand === product.brand ? 2 : 0);
      return bScore - aScore;
    })
    .slice(0, 4);

  const rawBadge = product.badges || product.badge || '';
  const badgesList = Array.isArray(rawBadge)
    ? rawBadge.map(b => String(b).trim()).filter(Boolean)
    : (typeof rawBadge === 'string' ? rawBadge.split(',').map(b => b.trim()).filter(Boolean) : []);

  const getProductBadgeStyle = (badge) => {
    const b = badge.toLowerCase();
    if (b.includes('featured')) return 'bg-surface-900 text-white border border-surface-800 shadow-xs';
    return 'bg-surface-100 text-surface-800 border border-surface-300 shadow-xs';
  };

  return (
    <div className="min-h-screen bg-white text-left py-6 sm:py-10">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-surface-200/80">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-surface-500">
            <button 
              onClick={() => onNavigate('home')} 
              className="hover:text-brand-600 transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
            <button 
              onClick={() => onNavigate('catalog')} 
              className="hover:text-brand-600 transition-colors cursor-pointer"
            >
              Catalogue
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
            <span className="font-semibold text-surface-700">{product.brand}</span>
            <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
            <span className="text-surface-900 font-bold max-w-[160px] sm:max-w-none break-words line-clamp-1">
              {product.name}
            </span>
          </div>

          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-surface-600 hover:text-brand-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Catalogue</span>
          </button>
        </div>

        {/* Main Product Showcase (Clean open layout, NOT wrapped in cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start pb-16">
          
          {/* Gallery Column (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Primary Large Image - Clean, no card format */}
            <div className="relative h-64 sm:h-80 md:h-[420px] lg:h-[460px] w-full flex items-center justify-center overflow-hidden">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-16 w-16 rounded-xl border p-1.5 bg-white flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                      activeImageIndex === idx 
                        ? 'border-brand-500 shadow-xs ring-1 ring-brand-500' 
                        : 'border-surface-200 opacity-70 hover:opacity-100 hover:border-surface-300'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Badges - clean inline row without card boxes */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-surface-100">
              <div className="flex items-center gap-2.5 text-left">
                <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-surface-900">Official Warranty</div>
                  <div className="text-[10px] text-surface-500">Certified Hardware</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-left">
                <Phone className="w-5 h-5 text-brand-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-surface-900">Technical Support</div>
                  <div className="text-[10px] text-surface-500">Application Engineers</div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Meta & Purchase Column (6 cols) - Clean open layout without nested cards */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block">
                  {product.brand}
                </span>
                {badgesList.map((b, idx) => (
                  <span 
                    key={idx} 
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-2xs ${getProductBadgeStyle(b)}`}
                  >
                    {b}
                  </span>
                ))}
              </div>

              <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-surface-900 tracking-tight leading-tight mb-3">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-surface-500">
                <div className="flex items-center gap-1.5">
                  {reviewsCount > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => {
                          const cfg = getRatingConfig(averageRating);
                          return (
                            <Star
                              key={s}
                              className={`w-4 h-4 ${
                                s <= Math.round(Number(averageRating))
                                  ? `${cfg.fill} ${cfg.color}`
                                  : 'text-surface-200 stroke-1'
                              }`}
                            />
                          );
                        })}
                      </div>
                      <span className={`font-bold text-sm ${getRatingConfig(averageRating).color}`}>
                        {averageRating}
                      </span>
                      <span className="text-surface-400 font-medium">
                        ({reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-surface-400">
                      <Star className="w-4 h-4 text-surface-300 stroke-1" />
                      <span className="font-medium text-surface-500">No ratings yet</span>
                    </div>
                  )}
                </div>
                <span>•</span>
                <span>SKU: <strong className="text-surface-800 font-mono">{product.sku}</strong></span>
                <span>•</span>
                <span>Category: <strong className="text-surface-800">{product.categoryName}</strong></span>
              </div>
            </div>

            {/* Pricing Section with Quantity Selector */}
            <div className="py-2 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-display text-3xl sm:text-4xl font-black text-surface-900">
                    {product.currency}{(product.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold mt-1">
                  {!isOutOfStock ? (
                    <div className="flex items-center gap-2 text-emerald-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>
                        {product.stockQuantity !== undefined
                          ? (product.stockQuantity <= 3
                              ? `Low Stock: Only ${product.stockQuantity} units left - Dispatched within 24h`
                              : `${product.stockQuantity} units in stock - Dispatched within 24h`)
                          : (product.availability || 'In Stock - Dispatched within 24h')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <span>Out of Stock (0 units available)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity Counter right beside Price */}
              {!product.quoteOnly && !isOutOfStock && (
                <div className="flex items-center border border-surface-300 rounded-xl bg-white overflow-hidden h-11 sm:h-12 shadow-xs shrink-0">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 h-full text-surface-700 hover:bg-surface-100 transition-colors font-bold text-base cursor-pointer select-none"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-3 min-w-[2.25rem] text-center font-bold text-surface-900 text-sm">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => setQuantity(Math.min(maxAvailableQuantity, quantity + 1))}
                    className="px-3.5 h-full text-surface-700 hover:bg-surface-100 transition-colors font-bold text-base cursor-pointer select-none"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            {/* Key Specs Matrix - clean row dividers, NO card boxes */}
            {product.shortSpecs && (
              <div className="py-4 border-t border-b border-surface-200 space-y-2.5 text-xs">
                {Object.entries(product.shortSpecs).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center py-0.5">
                    <span className="text-surface-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className="font-semibold text-surface-900 text-right">{val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Purchasing Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 w-full">
                {/* Add to Cart Button */}
                <button
                  disabled={isOutOfStock}
                  onClick={() => !isOutOfStock && onAddToCart(product, quantity)}
                  className={`flex-1 min-h-[52px] sm:min-h-[56px] py-3.5 sm:py-4 font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 px-4 ${
                    !isOutOfStock 
                      ? 'bg-surface-900 hover:bg-brand-600 text-white cursor-pointer active:scale-98' 
                      : 'bg-surface-200 text-surface-400 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className={`w-4 h-4 sm:w-5 sm:h-5 ${!isOutOfStock ? 'text-brand-400' : 'text-surface-400'} shrink-0`} />
                  <span>{!isOutOfStock ? `Add to Cart • ${product.currency}${((product.price || 0) * quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'Currently Out of Stock'}</span>
                </button>

                {/* Wishlist Button right beside Add to Cart */}
                {onToggleWishlist && (
                  <button
                    onClick={() => onToggleWishlist(product)}
                    className={`min-h-[52px] w-[52px] sm:min-h-[56px] sm:w-[56px] rounded-xl border flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-xs ${
                      isWishlisted 
                        ? 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100' 
                        : 'border-surface-300 bg-white text-surface-500 hover:text-red-500 hover:border-red-300 hover:bg-red-50/30'
                    }`}
                    title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                )}
              </div>

              {/* Consultation / Expert Advice CTA */}
              <button
                onClick={onOpenConsultation}
                className="w-full min-h-[46px] py-3 px-4 bg-surface-50 hover:bg-surface-100 border border-surface-200 text-surface-800 hover:text-brand-600 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone className="w-4 h-4 text-brand-600" />
                <span>Request Engineering Advice on this Machine</span>
              </button>
            </div>

          </div>

        </div>

        {/* Detailed Tabs: Overview, Specs, Key Features - Clean page section */}
        <div className="py-12 border-t border-surface-200">
          {/* Mobile Tab Switcher (sm:hidden) - Fits full screen, zero horizontal scroll */}
          <div className="sm:hidden mb-6">
            <div className="grid grid-cols-2 gap-1.5 bg-surface-100 p-1.5 rounded-xl border border-surface-200">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-white text-brand-600 shadow-xs'
                    : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                  activeTab === 'specs'
                    ? 'bg-white text-brand-600 shadow-xs'
                    : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('features')}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                  activeTab === 'features'
                    ? 'bg-white text-brand-600 shadow-xs'
                    : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                Key Features
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'bg-white text-brand-600 shadow-xs'
                    : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                <span>Reviews</span>
                <span className="px-1.5 py-0.2 rounded-full bg-brand-50 text-brand-700 text-[10px] font-bold">
                  {reviewsList.length}
                </span>
              </button>
            </div>
          </div>

          {/* Desktop Tabs Navigation (hidden sm:flex) - Exactly unchanged */}
          <div className="hidden sm:flex items-center gap-4 border-b border-surface-200 pb-3 mb-8 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2.5 px-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-surface-500 hover:text-surface-900'
              }`}
            >
              Product Overview
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-2.5 px-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'specs'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-surface-500 hover:text-surface-900'
              }`}
            >
              Technical Specifications
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`pb-2.5 px-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'features'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-surface-500 hover:text-surface-900'
              }`}
            >
              Key Features
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-2.5 px-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-surface-500 hover:text-surface-900'
              }`}
            >
              <span>Client Reviews</span>
              <span className="px-2 py-0.5 rounded-full bg-surface-100 text-surface-700 text-xs font-bold">
                {reviewsList.length}
              </span>
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-4xl text-left">
              <p className="text-sm sm:text-base text-surface-700 leading-relaxed font-normal">
                {product.description}
              </p>

              {product.suitableMaterials && product.suitableMaterials.length > 0 && (
                <div className="pt-4">
                  <h4 className="text-xs font-bold text-surface-900 uppercase tracking-wider mb-3">
                    Validated Compatible Materials
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {product.suitableMaterials.map((mat, i) => (
                      <span key={i} className="px-3 py-1 bg-surface-100 text-surface-800 rounded-lg text-xs font-semibold">
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product.warranty && (
                <div className="p-4 bg-surface-50 rounded-xl border border-surface-200 text-xs text-surface-700">
                  <span className="font-bold text-surface-900">Warranty Coverage: </span>
                  {product.warranty}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Technical Specifications */}
          {activeTab === 'specs' && (
            <div className="max-w-4xl text-left">
              {product.techSpecs ? (
                <div className="border border-surface-200 rounded-2xl overflow-hidden divide-y divide-surface-100 text-xs">
                  {Object.entries(product.techSpecs).map(([specKey, specVal], idx) => (
                    <div key={idx} className={`grid grid-cols-1 sm:grid-cols-3 p-3.5 ${idx % 2 === 0 ? 'bg-surface-50/60' : 'bg-white'}`}>
                      <span className="font-bold text-surface-700">{specKey}</span>
                      <span className="sm:col-span-2 text-surface-900 font-mono text-xs">{specVal}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-surface-500">Contact engineering support for full datasheet specifications.</p>
              )}
            </div>
          )}

          {/* Tab 3: Key Features */}
          {activeTab === 'features' && (
            <div className="space-y-3 max-w-4xl text-left">
              {product.keyFeatures && product.keyFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-surface-50/60 rounded-xl border border-surface-100">
                  <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-surface-800 font-medium">{feat}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: Verified Client Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-8 max-w-4xl text-left">
              
              {/* Existing Reviews List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-surface-200">
                  <h3 className="font-display font-bold text-base text-surface-900">
                    Client Evaluations &amp; Field Reports ({reviewsCount})
                  </h3>
                  {reviewsCount > 0 ? (
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${getRatingConfig(averageRating).bg} ${getRatingConfig(averageRating).border}`}>
                      <Star className={`w-3.5 h-3.5 ${getRatingConfig(averageRating).fill} ${getRatingConfig(averageRating).color}`} />
                      <span className={`font-bold ${getRatingConfig(averageRating).color}`}>
                        {averageRating} / 5.0
                      </span>
                      <span className="text-surface-500 text-[11px] font-medium hidden sm:inline">
                        Overall Rating
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-surface-400 text-xs font-medium">
                      <Star className="w-3.5 h-3.5 text-surface-300 stroke-1" />
                      <span>No ratings yet</span>
                    </div>
                  )}
                </div>

                {reviewsCount === 0 ? (
                  <div className="py-8 px-4 text-center bg-surface-50/60 rounded-2xl border border-dashed border-surface-200 space-y-1.5 my-2">
                    <Star className="w-6 h-6 text-surface-300 mx-auto stroke-1" />
                    <p className="text-xs font-bold text-surface-700">No ratings yet</p>
                    <p className="text-[11px] text-surface-400 max-w-sm mx-auto">
                      No field evaluations published yet for this hardware. Be the first manufacturing client to submit verified feedback.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 divide-y divide-surface-100">
                    {reviewsList.map((rev) => (
                      <div key={rev.id} className="pt-4 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-surface-900">{rev.user_name}</span>
                            {rev.user_company && (
                              <span className="text-surface-500 font-medium">• {rev.user_company}</span>
                            )}
                          </div>
                          <div className={`flex items-center text-xs sm:text-sm font-bold tracking-widest ${getRatingConfig(rev.rating).color}`}>
                            {'★'.repeat(rev.rating)}<span className="opacity-30">{'☆'.repeat(5 - rev.rating)}</span>
                          </div>
                        </div>

                        {rev.title && (
                          <h5 className="font-bold text-surface-800">{rev.title}</h5>
                        )}

                        <p className="text-surface-700 leading-relaxed">
                          {rev.comment}
                        </p>

                        <span className="text-[10px] text-surface-400 block pt-1">
                          Verified Engineering Deployment
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Review Box */}
              <div className="bg-surface-50 rounded-2xl border border-surface-200 p-6 space-y-4">
                <div className="border-b border-surface-200/80 pb-2">
                  <h4 className="font-display font-bold text-sm text-surface-900">
                    Submit a Technical Equipment Review
                  </h4>
                  <p className="text-[11px] text-surface-500">
                    Evaluations are moderated to ensure genuine manufacturing feedback.
                  </p>
                </div>

                {reviewNotice && (
                  <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-xs font-semibold text-brand-900">
                    {reviewNotice}
                  </div>
                )}

                {customer ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-bold text-surface-800 mb-1">Equipment Rating *</label>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const isSelected = star <= reviewRating;
                            const currentCfg = getRatingConfig(reviewRating);
                            return (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRating(star)}
                                className="p-1 cursor-pointer focus:outline-none transition-transform hover:scale-115"
                                title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                              >
                                <Star
                                  className={`w-5 h-5 transition-colors ${
                                    isSelected
                                      ? `${currentCfg.fill} ${currentCfg.color}`
                                      : 'text-surface-300 stroke-1'
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                        <span className={`text-xs font-bold ml-1 ${getRatingConfig(reviewRating).color}`}>
                          ({reviewRating} / 5 Stars • {getRatingConfig(reviewRating).label})
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-surface-800 mb-1">Review Headline</label>
                      <input
                        type="text"
                        placeholder="e.g. Excellent dimensional repeatability on nylon"
                        value={reviewTitle}
                        onChange={e => setReviewTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-surface-300 rounded-xl focus:outline-none bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-surface-800 mb-1">Detailed Technical Feedback *</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Describe tolerances, surface finish, uptime, and application suitability..."
                        value={reviewComment}
                        onChange={e => setReviewComment(e.target.value)}
                        className="w-full px-3 py-2 border border-surface-300 rounded-xl focus:outline-none bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="px-5 py-2.5 bg-surface-900 hover:bg-brand-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      {reviewSubmitting ? 'Submitting Review...' : 'Submit Verified Evaluation'}
                    </button>
                  </form>
                ) : (
                  <div className="py-4 text-center space-y-2">
                    <p className="text-xs text-surface-600">
                      Sign in to your registered corporate or personal customer account to submit equipment reviews.
                    </p>
                    <button
                      type="button"
                      onClick={() => onOpenCustomerAuth ? onOpenCustomerAuth() : onNavigate('account')}
                      className="px-4 py-2 bg-surface-900 hover:bg-brand-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Sign In to Review</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* ALWAYS VISIBLE: Related Machinery & Consumables */}
        <div className="py-12 border-t border-surface-200 text-left">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-1">
              Complete Production Ecosystem
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-surface-900 tracking-tight">
              Related Machinery &amp; Materials
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {relatedProducts.map(rel => (
              <ProductCard
                key={rel.id}
                product={rel}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={false}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
