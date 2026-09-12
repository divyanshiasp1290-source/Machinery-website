import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { products } from '../data/products';

export default function FeaturedProducts({ 
  onSelectProduct, 
  onAddToCart,
  onToggleWishlist,
  wishlistItems = [],
  onViewAllCatalog 
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filterTabs = [
    { id: 'all', label: 'All Featured' },
    { id: 'industrial-fdm', label: 'Industrial 3D Printers' },
    { id: 'large-format', label: 'Large Format (LFAM)' },
    { id: 'scanners', label: '3D Scanners' },
    { id: 'materials', label: 'Materials' },
  ];

  const displayProducts = selectedCategory === 'all'
    ? products.slice(0, 8)
    : products.filter(p => p.category === selectedCategory).slice(0, 8);

  return (
    <section className="py-16 sm:py-20 bg-surface-50 border-b border-surface-200 text-left">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-1">
              Engineered for Production
            </span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-surface-900 tracking-tight">
              Featured Machinery &amp; Hardware
            </h2>
          </div>

          <button
            onClick={onViewAllCatalog}
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 self-start sm:self-auto transition-colors"
          >
            <span>View Full Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Clean Filter Tabs */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 mb-8 text-xs no-scrollbar">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                selectedCategory === tab.id
                  ? 'bg-surface-900 text-white shadow-subtle'
                  : 'bg-white text-surface-700 hover:bg-surface-100 border border-surface-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {displayProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={wishlistItems.includes(product.id)}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
