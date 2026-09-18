import React from 'react';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  ArrowRight, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { products } from '../data/products';

export default function WishlistPage({ 
  wishlistItems, 
  onToggleWishlist, 
  onAddToCart, 
  onSelectProduct, 
  onNavigate 
}) {
  // Find all wishlisted products
  const savedProducts = products.filter(p => wishlistItems.includes(p.id));

  const handleMoveAllToCart = () => {
    savedProducts.forEach(product => {
      onAddToCart(product, 1);
    });
  };

  return (
    <div className="bg-surface-50 min-h-screen py-8 sm:py-12 text-left">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs Navigation */}
        <nav className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-surface-200">
          <div className="flex items-center gap-2 text-xs text-surface-500">
            <a 
              href="/"
              onClick={(e) => { e.preventDefault(); onNavigate('home'); }} 
              className="hover:text-brand-600 transition-colors cursor-pointer"
            >
              Home
            </a>
            <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
            <span className="font-semibold text-surface-900">Saved Wishlist</span>
          </div>

          <a
            href="/catalog"
            onClick={(e) => { e.preventDefault(); onNavigate('catalog'); }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-surface-600 hover:text-brand-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </a>
        </nav>

        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-1">
              Your Saved Items
            </span>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-surface-900 tracking-tight">
              My Equipment Wishlist
            </h1>
          </div>

          {savedProducts.length > 0 && (
            <div className="w-full sm:w-auto flex items-center gap-3">
              <button
                onClick={handleMoveAllToCart}
                className="w-full sm:w-auto px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Move All to Cart</span>
              </button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {savedProducts.length === 0 ? (
          <div className="bg-white border border-surface-200 rounded-2xl p-12 sm:p-20 text-center max-w-2xl mx-auto shadow-xs space-y-6">
            <div className="w-20 h-20 rounded-full bg-surface-100 flex items-center justify-center mx-auto text-surface-400">
              <Heart className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-display font-black text-2xl text-surface-900">
                Your Wishlist is Empty
              </h2>
              <p className="text-sm text-surface-500 max-w-md mx-auto leading-relaxed">
                You haven't saved any equipment yet. Click the heart icon on any 3D printer, scanner, or engineering material to keep track of machines for your team.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => onNavigate('catalog')}
                className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
              >
                <span>Browse Equipment Catalogue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {savedProducts.map((product) => (
              <div 
                key={product.id}
                className="bg-white border border-surface-200 rounded-2xl p-4 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image & Quick Action */}
                  <div className="relative h-52 sm:h-60 w-full flex items-center justify-center p-4 bg-surface-50 rounded-xl mb-5 overflow-hidden">
                    <img 
                      src={product.images ? product.images[0] : product.image} 
                      alt={product.name}
                      onClick={() => {
                        onSelectProduct(product);
                        onNavigate('product-detail');
                      }}
                      className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform duration-300"
                    />
                    
                    <button
                      onClick={() => onToggleWishlist(product)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-red-500 hover:bg-red-50 transition-colors shadow-xs cursor-pointer"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-brand-600 uppercase tracking-wider">
                        {product.brand}
                      </span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> In Stock (UK Hub)
                      </span>
                    </div>

                    <h3 
                      onClick={() => {
                        onSelectProduct(product);
                        onNavigate('product-detail');
                      }}
                      className="font-display font-bold text-base sm:text-lg text-surface-900 hover:text-brand-600 transition-colors cursor-pointer line-clamp-2 leading-snug break-words"
                    >
                      {product.name}
                    </h3>

                    {product.buildVolume && (
                      <p className="text-xs text-surface-500">
                        Build Envelope: <span className="font-semibold text-surface-700">{product.buildVolume}</span>
                      </p>
                    )}

                    <div className="pt-2">
                      {product.quoteOnly ? (
                        <span className="inline-block px-2.5 py-1 rounded bg-brand-50 text-brand-700 border border-brand-200 text-xs font-bold">
                          Official Quote On Application
                        </span>
                      ) : (
                        <div className="text-lg font-black text-surface-900">
                          £{product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-6 mt-6 border-t border-surface-100 flex items-center gap-3">
                  <button
                    onClick={() => onAddToCart(product, 1)}
                    className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectProduct(product);
                      onNavigate('product-detail');
                    }}
                    className="px-4 py-3 bg-surface-100 hover:bg-surface-200 text-surface-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                  >
                    Details
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
