import React from 'react';
import { 
  ShoppingCart, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  ChevronRight
} from 'lucide-react';

export default function CartPage({ 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart, 
  onNavigate,
  onSelectProduct 
}) {
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate subtotal for direct priced items
  const directSubtotal = cartItems.reduce((sum, item) => {
    if (!item.quoteOnly && item.price) {
      return sum + (item.price * item.quantity);
    }
    return sum;
  }, 0);

  const total = directSubtotal;

  return (
    <div className="bg-surface-50 min-h-screen py-8 sm:py-12 text-left">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-surface-200">
          <div className="flex items-center gap-2 text-xs text-surface-500">
            <button 
              onClick={() => onNavigate('home')} 
              className="hover:text-brand-600 transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
            <span className="font-semibold text-surface-900">Cart</span>
          </div>

          <button
            onClick={() => onNavigate('catalog')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-surface-600 hover:text-brand-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display font-black text-3xl sm:text-4xl text-surface-900 tracking-tight">
                Shopping Cart
              </h1>
            </div>
            {cartItems.length > 0 && (
              <span className="px-3.5 py-1.5 bg-surface-200 text-surface-800 rounded-full text-xs font-bold">
                {totalItemCount} {totalItemCount === 1 ? 'Item' : 'Items'}
              </span>
            )}
          </div>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white border border-surface-200 rounded-2xl p-12 sm:p-20 text-center max-w-2xl mx-auto shadow-xs space-y-6">
            <div className="w-20 h-20 rounded-full bg-surface-100 flex items-center justify-center mx-auto text-surface-400">
              <ShoppingCart className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-display font-black text-2xl text-surface-900">
                Your Cart is Empty
              </h2>
              <p className="text-sm text-surface-500 max-w-md mx-auto leading-relaxed">
                You currently have no items in your cart.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => onNavigate('catalog')}
                className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Active Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* Left Column: Cart Items List (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="bg-white border border-surface-200 rounded-2xl p-4 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-surface-200">
                  <h3 className="font-display font-bold text-lg text-surface-900">
                    Items ({totalItemCount})
                  </h3>
                  <button
                    onClick={onClearCart}
                    className="text-xs text-surface-500 hover:text-red-600 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                </div>

                <div className="divide-y divide-surface-100">
                  {cartItems.map((item) => (
                    <div key={item.id} className="py-5 sm:py-6 first:pt-3 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 w-full">
                      
                      {/* Product Thumbnail */}
                      <div 
                        onClick={() => {
                          if (onSelectProduct) onSelectProduct(item);
                          onNavigate('product-detail');
                        }}
                        className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl bg-surface-50 p-2 border border-surface-200 flex items-center justify-center shrink-0 cursor-pointer hover:border-brand-500 transition-colors"
                      >
                        <img 
                          src={item.images ? item.images[0] : item.image} 
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0 w-full sm:w-auto">
                        <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block mb-1">
                          {item.brand}
                        </span>
                        
                        <h4 
                          onClick={() => {
                            if (onSelectProduct) onSelectProduct(item);
                            onNavigate('product-detail');
                          }}
                          className="font-display font-bold text-base sm:text-lg text-surface-900 hover:text-brand-600 transition-colors cursor-pointer line-clamp-2 leading-snug break-words mb-1.5"
                        >
                          {item.name}
                        </h4>

                        <div className="text-sm font-bold">
                          {item.quoteOnly ? (
                            <span className="inline-block px-2.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200 text-xs font-bold">
                              Quote on Application
                            </span>
                          ) : (
                            <div className="flex items-baseline gap-2">
                              <span className="text-surface-900">
                                £{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                              {item.quantity > 1 && (
                                <span className="text-xs text-surface-400 font-normal">
                                  (£{(item.price * item.quantity).toLocaleString()} total)
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quantity & Delete Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                        <div className="flex items-center border border-surface-300 rounded-xl bg-surface-50">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) {
                                onUpdateQuantity(item.id, item.quantity - 1);
                              } else {
                                onRemoveItem(item.id);
                              }
                            }}
                            className="px-3 py-1.5 text-surface-600 hover:bg-surface-200 rounded-l-xl font-bold text-xs transition-colors cursor-pointer"
                            title="Decrease"
                          >
                            -
                          </button>
                          <span className="px-3.5 py-1.5 font-bold text-xs text-surface-900 bg-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1.5 text-surface-600 hover:bg-surface-200 rounded-r-xl font-bold text-xs transition-colors cursor-pointer"
                            title="Increase"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-xs text-surface-400 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Bottom Card Actions */}
                <div className="pt-6 mt-6 border-t border-surface-100 flex items-center justify-between">
                  <button
                    onClick={() => onNavigate('catalog')}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Continue Shopping</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Order Summary & Checkout Option (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Financial Breakdown Card with Checkout Button */}
              <div className="bg-white border border-surface-200 rounded-2xl p-4 sm:p-7 shadow-xs space-y-5">
                <h3 className="font-display font-bold text-lg text-surface-900 pb-3 border-b border-surface-200">
                  Order Summary
                </h3>

                <div className="space-y-3 text-xs">
                  {directSubtotal > 0 && (
                    <div className="flex justify-between text-base font-black text-surface-900">
                      <span>Total:</span>
                      <span className="text-brand-600">
                        £{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Primary Checkout Button */}
                <div className="pt-2">
                  <button
                    onClick={() => onNavigate('checkout')}
                    className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
