import React from 'react';
import { ShoppingCart, Heart } from 'lucide-react';

export default function ProductCard({ 
  product, 
  onSelectProduct, 
  onAddToCart, 
  onToggleWishlist,
  isWishlisted = false
}) {
  const imageUrl = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : (typeof product.image === 'string' ? product.image : '/images/products/prod_raise3d_pro3.jpg');

  const rawBadge = product.badges || product.badge || '';
  const badgesList = Array.isArray(rawBadge)
    ? rawBadge.map(b => String(b).trim()).filter(Boolean)
    : (typeof rawBadge === 'string' ? rawBadge.split(',').map(b => b.trim()).filter(Boolean) : []);

  const getBadgeStyle = (badge) => {
    const b = badge.toLowerCase();
    if (b.includes('featured')) return 'bg-surface-900 text-white border border-surface-800 shadow-xs';
    return 'bg-surface-100 text-surface-800 border border-surface-300 shadow-xs';
  };

  // CRITICAL USER RULE: Only mark Out of Stock if stock is 0 (stockQuantity <= 0)
  const isOutOfStock = (product.stockQuantity !== undefined && product.stockQuantity !== null)
    ? Number(product.stockQuantity) <= 0
    : (!product.inStock && (product.stock === 0 || product.stockQuantity === 0));
  const isLowStock = !isOutOfStock && product.stockQuantity !== undefined && Number(product.stockQuantity) > 0 && Number(product.stockQuantity) <= 3;

  return (
    <div 
      onClick={() => onSelectProduct(product)}
      className="group bg-white rounded-2xl border border-surface-200/90 hover:border-surface-300 hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between h-full overflow-hidden cursor-pointer text-left relative"
    >
      <div className="flex flex-col flex-1">
        {/* Uniform Product Image Container */}
        <div className="relative h-56 sm:h-64 w-full bg-surface-50 overflow-hidden shrink-0">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              const fallback = (Array.isArray(product.images) && product.images[1]) || (imageUrl.includes('_v2') 
                ? imageUrl.replace('_v2', '') 
                : imageUrl.replace('.jpg', '_v2.jpg'));
              if (fallback && e.currentTarget.src !== fallback) {
                e.currentTarget.src = fallback;
              }
            }}
          />

          {/* Product Badge Pill(s) */}
          {badgesList.length > 0 && (
            <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 max-w-[85%] items-center">
              {badgesList.map((b, idx) => (
                <span 
                  key={idx} 
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider shadow-sm ${getBadgeStyle(b)}`}
                >
                  {b}
                </span>
              ))}
            </div>
          )}

          {/* Out of stock pill ONLY if stock is actually 0 */}
          {isOutOfStock && (
            <div className="absolute bottom-3 left-3 z-10">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface-900/90 text-white backdrop-blur-xs">
                Out of Stock
              </span>
            </div>
          )}

          {/* Low stock pill */}
          {isLowStock && (
            <div className="absolute bottom-3 left-3 z-10">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-600/90 text-white backdrop-blur-xs">
                Only {product.stockQuantity} left
              </span>
            </div>
          )}

          {/* Wishlist Button */}
          {onToggleWishlist && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product);
              }}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-xs border border-surface-200 shadow-xs hover:scale-110 transition-all z-10"
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-surface-400 hover:text-red-500'}`} />
            </button>
          )}
        </div>

        {/* Product Details */}
        <div className="p-5 pb-3 flex flex-col flex-1">
          {/* Brand */}
          <span className="text-[11px] sm:text-xs font-bold text-surface-400 uppercase tracking-wider block mb-1">
            {product.brand}
          </span>

          {/* Title - uniform 2-line clamp */}
          <h3 className="font-sans font-bold text-surface-900 text-sm sm:text-base leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-brand-600 transition-colors">
            {product.name}
          </h3>
        </div>
      </div>

      {/* Pricing & Add to Cart Action */}
      <div className="px-5 pb-5 pt-0 mt-auto">
        <div className="text-base sm:text-lg font-black text-surface-900 mb-3">
          {product.quoteOnly ? (
            <span className="text-brand-600 font-bold text-sm sm:text-base">Price on Request</span>
          ) : (
            `${product.currency || '£'}${(product.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
          )}
        </div>

        <button
          disabled={isOutOfStock}
          onClick={(e) => {
            e.stopPropagation();
            if (!isOutOfStock && onAddToCart) onAddToCart(product);
          }}
          className={`w-full py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs ${
            !isOutOfStock
              ? 'bg-surface-900 hover:bg-brand-600 text-white cursor-pointer'
              : 'bg-surface-200 text-surface-400 cursor-not-allowed'
          }`}
        >
          <ShoppingCart className={`w-4 h-4 ${!isOutOfStock ? 'text-brand-400' : 'text-surface-400'}`} />
          <span>{!isOutOfStock ? 'Add to Cart' : 'Out of Stock'}</span>
        </button>
      </div>
    </div>
  );
}


