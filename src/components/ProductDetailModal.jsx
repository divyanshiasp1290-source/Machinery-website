import React, { useState } from 'react';
import { X, ShoppingCart, Phone, ShieldCheck, Truck } from 'lucide-react';
import { products } from '../data/products';

export default function ProductDetailModal({ 
  product, 
  onClose, 
  onAddToCart, 
  onSelectRelated,
  onOpenConsultation 
}) {
  if (!product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const relatedProducts = products
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-3 sm:p-6 text-left">
      <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-surface-200">
        
        {/* Top bar */}
        <div className="sticky top-0 bg-white z-20 px-6 py-3.5 border-b border-surface-200 flex items-center justify-between">
          <div className="text-xs text-surface-500 flex items-center gap-1.5">
            <span className="font-bold text-surface-900">{product.brand}</span>
            <span>/</span>
            <span>{product.categoryName}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-surface-400 hover:text-surface-700"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Product Area */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Gallery */}
          <div className="space-y-3">
            <div className="h-72 sm:h-80 w-full bg-surface-50 rounded border border-surface-200 p-4 flex items-center justify-center">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-16 w-16 rounded border p-1 bg-surface-50 ${
                      activeImageIndex === idx ? 'border-brand-500' : 'border-surface-200 opacity-70'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Actions */}
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wide block mb-1">
                {product.brand}
              </span>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-surface-900">
                {product.name}
              </h2>
              <span className="text-xs text-surface-400 mt-0.5 block">
                SKU: {product.sku}
              </span>
            </div>

            {/* Price */}
            <div className="p-3 bg-surface-50 rounded border border-surface-200">
              {product.quoteOnly ? (
                <div>
                  <span className="text-sm font-bold text-brand-600 block">
                    Commercial Pricing
                  </span>
                  <span className="text-xs text-surface-500">
                    Contact us for a formal quotation and delivery estimate.
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-2xl font-bold text-surface-900 font-display">
                    {product.currency}{product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            <div className="text-xs text-surface-600">
              <span className="font-semibold text-surface-800">Availability: </span>
              <span>{product.availability}</span>
            </div>

            {/* Key Specs Summary */}
            <div className="space-y-1 text-xs border-t border-b border-surface-100 py-3">
              {Object.entries(product.shortSpecs).slice(0, 4).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-surface-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="font-semibold text-surface-800">{v}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-3">
                {!product.quoteOnly && (
                  <div className="flex items-center border border-surface-300 rounded">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-2.5 py-1.5 text-xs text-surface-700"
                    >
                      -
                    </button>
                    <span className="px-2 py-1.5 text-xs font-bold text-surface-900 min-w-[2rem] text-center">
                      {quantity}
                    </span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-2.5 py-1.5 text-xs text-surface-700"
                    >
                      +
                    </button>
                  </div>
                )}

                <button
                  onClick={() => {
                    onAddToCart(product, quantity);
                    onClose();
                  }}
                  className="flex-1 py-3 px-4 bg-surface-900 hover:bg-brand-500 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors text-center"
                >
                  {product.quoteOnly ? 'Request Quote' : 'Add to Cart'}
                </button>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenConsultation();
                }}
                className="w-full py-2.5 px-4 bg-surface-100 hover:bg-surface-200 text-surface-800 font-semibold text-xs rounded transition-colors text-center"
              >
                Need Advice on this Machine? Contact Us
              </button>
            </div>
          </div>

        </div>

        {/* Specifications & Description */}
        <div className="px-6 sm:px-8 pb-8 pt-4 border-t border-surface-200 space-y-6">
          <div>
            <h3 className="font-display font-bold text-sm text-surface-900 mb-2">
              Product Overview
            </h3>
            <p className="text-xs text-surface-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div>
            <h3 className="font-display font-bold text-sm text-surface-900 mb-3">
              Technical Specifications
            </h3>
            <div className="border border-surface-200 rounded divide-y divide-surface-100 text-xs">
              {Object.entries(product.techSpecs).map(([specKey, specVal], idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 p-2.5 bg-surface-50/50">
                  <span className="font-semibold text-surface-700">{specKey}</span>
                  <span className="sm:col-span-2 text-surface-900 font-mono text-[11px]">{specVal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="pt-4 border-t border-surface-100">
              <h3 className="font-display font-bold text-sm text-surface-900 mb-3">
                Related Products
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedProducts.map(rel => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectRelated(rel)}
                    className="p-3 border border-surface-200 rounded hover:border-surface-400 cursor-pointer flex items-center gap-3 bg-surface-50 transition-colors"
                  >
                    <img src={rel.images[0]} alt={rel.name} className="w-12 h-12 object-contain bg-white rounded border border-surface-200 p-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-brand-600 uppercase">{rel.brand}</span>
                      <h4 className="font-bold text-xs text-surface-900 line-clamp-2 leading-snug break-words">{rel.name}</h4>
                      <span className="text-[11px] text-surface-600">
                        {rel.quoteOnly ? 'Quote' : `${rel.currency}${rel.price.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
