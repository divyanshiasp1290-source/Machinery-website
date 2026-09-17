import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { products as initialProducts } from '../data/products';
import { categories as initialCategories } from '../data/categories';
import { api } from '../services/api';

export default function FeaturedProducts({ 
  onSelectProduct, 
  onAddToCart, 
  onToggleWishlist, 
  wishlistItems = [], 
  onViewAllCatalog 
}) {
  const [featuredProducts, setFeaturedProducts] = useState(initialProducts);
  const [categoriesList, setCategoriesList] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const loadData = () => {
    api.products.list({ limit: 50 })
      .then(res => {
        if (res.products && res.products.length > 0) {
          setFeaturedProducts(res.products);
        }
      })
      .catch(() => {});

    api.categories.list()
      .then(cats => {
        if (Array.isArray(cats) && cats.length > 0) {
          setCategoriesList(cats);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadData();

    // Supabase Realtime live sync for products & categories
    const unsubProducts = api.realtime.subscribeProducts(() => {
      loadData();
    });

    const unsubCategories = api.realtime.subscribeCategories(() => {
      loadData();
    });

    const handleStockUpdate = () => {
      loadData();
    };
    window.addEventListener('forge3d_products_updated', handleStockUpdate);

    return () => {
      if (typeof unsubProducts === 'function') unsubProducts();
      if (typeof unsubCategories === 'function') unsubCategories();
      window.removeEventListener('forge3d_products_updated', handleStockUpdate);
    };
  }, []);

  const formatTabLabel = (name) => {
    if (!name) return '';
    if (name.includes('Large Format')) return 'Large Format (LFAM)';
    if (name.includes('High-Temperature')) return 'High-Temp PEEK';
    if (name.includes('SLS Powder')) return 'SLS Powder Bed';
    if (name.includes('Resin')) return 'Resin (SLA/DLP)';
    if (name.includes('Industrial 3D')) return 'Industrial 3D';
    return name;
  };

  const filterTabs = [
    { id: 'all', label: 'All Featured' },
    ...categoriesList.slice(0, 5).map(c => ({ id: c.id, label: formatTabLabel(c.name) }))
  ];

  const isProductFeatured = (p) => {
    if (p.isFeatured === true || p.is_featured === true) return true;
    if (typeof p.badge === 'string' && p.badge.toLowerCase().includes('featured')) return true;
    if (Array.isArray(p.badges) && p.badges.some(b => String(b).toLowerCase().includes('featured'))) return true;
    return false;
  };

  // Filter exclusively for featured products
  const featuredOnly = featuredProducts.filter(isProductFeatured);
  const activeProductsPool = featuredOnly.length > 0 ? featuredOnly : featuredProducts;

  let displayProducts = [];
  if (selectedCategory === 'all') {
    displayProducts = activeProductsPool.slice(0, 8);
  } else {
    const inCategory = activeProductsPool.filter(p => p.categoryId === selectedCategory || p.category === selectedCategory);
    displayProducts = inCategory.length > 0 
      ? inCategory.slice(0, 8) 
      : featuredProducts.filter(p => p.categoryId === selectedCategory || p.category === selectedCategory).slice(0, 8);
  }

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

        {/* Clean, Compact Filter Tabs - Wraps cleanly on mobile */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-8">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold tracking-tight whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-surface-900 text-white shadow-xs'
                  : 'bg-white text-surface-700 hover:bg-surface-100 border border-surface-200 shadow-2xs'
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
