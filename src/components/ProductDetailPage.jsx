import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Phone, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  Star,
  ChevronRight
} from 'lucide-react';
import { products } from '../data/products';
import ProductCard from './ProductCard';

export default function ProductDetailPage({ 
  product, 
  onBack,
  onNavigate,
  onAddToCart, 
  onSelectProduct,
  onOpenConsultation,
  onToggleWishlist,
  isWishlisted = false
}) {
  if (!product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'specs' | 'features'

  // Guarantee 4 related products by scoring category/brand relevance with fallback
  const relatedProducts = products
    .filter(p => p.id !== product.id)
    .sort((a, b) => {
      const aScore = (a.category === product.category ? 3 : 0) + (a.brand === product.brand ? 2 : 0);
      const bScore = (b.category === product.category ? 3 : 0) + (b.brand === product.brand ? 2 : 0);
      return bScore - aScore;
    })
    .slice(0, 4);

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
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-2">
                {product.brand}
              </span>

              <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-surface-900 tracking-tight leading-tight mb-3">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-surface-500">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-surface-900">{product.rating || 4.9}</span>
                  <span className="text-surface-400">({product.reviewsCount || 24} reviews)</span>
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

                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{product.availability || 'In Stock - Dispatched within 24h'}</span>
                </div>
              </div>

              {/* Quantity Counter right beside Price */}
              {!product.quoteOnly && (
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
                    onClick={() => setQuantity(quantity + 1)}
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
                {Object.entries(product.shortSpecs).slice(0, 4).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center py-1">
                    <span className="text-surface-500 capitalize font-medium">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="font-bold text-surface-900">
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Purchasing Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 w-full">
                {/* Add to Cart Button */}
                <button
                  onClick={() => onAddToCart(product, quantity)}
                  className="flex-1 min-h-[52px] sm:min-h-[56px] py-3.5 sm:py-4 bg-surface-900 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98 px-4"
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-brand-400 shrink-0" />
                  <span>Add to Cart • {product.currency}{((product.price || 0) * quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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
          {/* Tabs Navigation */}
          <div className="flex items-center gap-4 border-b border-surface-200 pb-3 mb-8 overflow-x-auto no-scrollbar">
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
