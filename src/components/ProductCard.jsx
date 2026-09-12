import React from 'react';
import { ShoppingCart, Heart } from 'lucide-react';

export default function ProductCard({ 
  product, 
  onSelectProduct, 
  onAddToCart, 
  onToggleWishlist,
  isWishlisted = false
}) {
  return (
    <div 
      onClick={() => onSelectProduct(product)}
      className="group bg-white rounded-2xl border border-surface-200/90 hover:border-surface-300 hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between h-full overflow-hidden cursor-pointer text-left relative"
    >
      <div className="flex flex-col flex-1">
        {/* Uniform Product Image Container */}
        <div className="relative h-56 sm:h-64 w-full bg-surface-50 overflow-hidden shrink-0">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              const fallback = product.images[1] || (product.images[0].includes('_v2') 
                ? product.images[0].replace('_v2', '') 
                : product.images[0].replace('.jpg', '_v2.jpg'));
              if (fallback && e.currentTarget.src !== fallback) {
                e.currentTarget.src = fallback;
              }
            }}
          />

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
          {product.currency}{(product.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart && onAddToCart(product);
          }}
          className="w-full py-2.5 bg-surface-900 hover:bg-brand-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <ShoppingCart className="w-4 h-4 text-brand-400" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}


