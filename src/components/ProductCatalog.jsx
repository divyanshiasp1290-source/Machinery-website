import React, { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { products, allBrands as initialBrands } from '../data/products';
import { categories as initialCategories } from '../data/categories';
import ProductCard from './ProductCard';
import { api } from '../services/api';

export default function ProductCatalog({ 
  initialCategory, 
  initialBrand, 
  initialSearch, 
  onSelectProduct,
  onAddToCart,
  onToggleWishlist,
  wishlistItems = []
}) {
  const [catalogProducts, setCatalogProducts] = useState(products);
  const [categoriesList, setCategoriesList] = useState(initialCategories);
  const [brandsList, setBrandsList] = useState(initialBrands);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [selectedBrands, setSelectedBrands] = useState(initialBrand ? [initialBrand] : []);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [sortBy, setSortBy] = useState('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    const fetchCatalog = () => {
      api.products.list({ limit: 100 })
        .then(res => {
          if (res.products && res.products.length > 0) {
            setCatalogProducts(res.products);
          }
        })
        .catch(() => {});
    };

    const fetchCategories = () => {
      api.categories.list()
        .then(cats => {
          if (Array.isArray(cats) && cats.length > 0) {
            setCategoriesList(cats);
          }
        })
        .catch(() => {});
    };

    const fetchBrands = () => {
      api.brands.list()
        .then(brs => {
          if (Array.isArray(brs) && brs.length > 0) {
            setBrandsList(brs.map(b => b.name || b.id));
          }
        })
        .catch(() => {});
    };

    fetchCatalog();
    fetchCategories();
    fetchBrands();

    // Supabase Realtime live sync
    const unsubProducts = api.realtime.subscribeProducts(() => {
      fetchCatalog();
    });

    const unsubCategories = api.realtime.subscribeCategories(() => {
      fetchCategories();
    });

    const unsubBrands = api.realtime.subscribeBrands(() => {
      fetchBrands();
    });

    const handleStockUpdate = () => {
      fetchCatalog();
    };
    window.addEventListener('forge3d_products_updated', handleStockUpdate);

    return () => {
      if (typeof unsubProducts === 'function') unsubProducts();
      if (typeof unsubCategories === 'function') unsubCategories();
      if (typeof unsubBrands === 'function') unsubBrands();
      window.removeEventListener('forge3d_products_updated', handleStockUpdate);
    };
  }, []);

  // Sync props
  React.useEffect(() => {
    setSelectedCategory(initialCategory || 'all');
  }, [initialCategory]);

  React.useEffect(() => {
    setSelectedBrands(initialBrand ? [initialBrand] : []);
  }, [initialBrand]);

  React.useEffect(() => {
    setSearchQuery(initialSearch || '');
  }, [initialSearch]);

  const handleToggleBrand = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrands([]);
    setInStockOnly(false);
    setSearchQuery('');
    setSortBy('featured');
  };

  const filteredProducts = useMemo(() => {
    return catalogProducts.filter(product => {
      if (selectedCategory !== 'all') {
        const catObj = categoriesList.find(c => 
          c.id === selectedCategory || 
          c.name?.toLowerCase() === selectedCategory?.toLowerCase() || 
          c.slug?.toLowerCase() === selectedCategory?.toLowerCase()
        );
        const targetValues = [
          selectedCategory,
          catObj?.id,
          catObj?.name,
          catObj?.slug
        ].filter(Boolean).map(x => String(x).toLowerCase());

        const prodCat = String(product.category || '').toLowerCase();
        const prodCatId = String(product.categoryId || '').toLowerCase();
        const prodCatName = String(product.categoryName || '').toLowerCase();

        const isMatch = targetValues.some(t => t === prodCat || t === prodCatId || t === prodCatName);
        if (!isMatch) return false;
      }
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
        return false;
      }
      if (inStockOnly && !product.inStock) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          product.name.toLowerCase().includes(q) ||
          product.brand.toLowerCase().includes(q) ||
          (product.categoryName && product.categoryName.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') {
        const priceA = a.price ?? 999999;
        const priceB = b.price ?? 999999;
        return priceA - priceB;
      }
      if (sortBy === 'price-high') {
        const priceA = a.price ?? -1;
        const priceB = b.price ?? -1;
        return priceB - priceA;
      }
      if (sortBy === 'name-az') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [catalogProducts, selectedCategory, selectedBrands, inStockOnly, searchQuery, sortBy]);

  const activeFiltersCount = 
    (selectedCategory !== 'all' ? 1 : 0) +
    selectedBrands.length +
    (inStockOnly ? 1 : 0) +
    (searchQuery ? 1 : 0);

  return (
    <div className="bg-surface-50 min-h-screen py-8 border-b border-surface-200">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Controls */}
        <div className="mb-6 text-left">
          <div className="text-xs text-surface-400 mb-1 flex items-center gap-1.5">
            <span>Home</span>
            <span>/</span>
            <span className="text-surface-700 font-medium">Products</span>
            {selectedCategory !== 'all' && (
              <>
                <span>/</span>
                <span className="text-brand-600 font-semibold">
                  {categoriesList.find(c => 
                    c.id === selectedCategory || 
                    c.name?.toLowerCase() === selectedCategory?.toLowerCase() || 
                    c.slug?.toLowerCase() === selectedCategory?.toLowerCase()
                  )?.name || selectedCategory}
                </span>
              </>
            )}
            {selectedBrands.length === 1 && (
              <>
                <span>/</span>
                <span className="text-brand-600 font-semibold">{selectedBrands[0]}</span>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="font-display text-2xl font-bold text-surface-900">
              Product Catalogue
            </h1>

            {/* Mobile / Tablet Filter Trigger (Crucial fix: visible on all viewports below lg) */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden py-2 px-3.5 bg-white border border-surface-300 rounded-xl text-xs font-bold text-surface-800 flex items-center justify-center gap-2 hover:bg-surface-50 cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" />
              <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
            </button>
          </div>
        </div>

        {/* Filter Badges Strip */}
        {activeFiltersCount > 0 && (
          <div className="mb-6 p-2.5 bg-white rounded border border-surface-200 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-surface-500 font-medium">Filters:</span>

            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-100 rounded text-surface-800">
                <span>
                  {categoriesList.find(c => 
                    c.id === selectedCategory || 
                    c.name?.toLowerCase() === selectedCategory?.toLowerCase() || 
                    c.slug?.toLowerCase() === selectedCategory?.toLowerCase()
                  )?.name || selectedCategory}
                </span>
                <button onClick={() => setSelectedCategory('all')}><X className="w-3 h-3" /></button>
              </span>
            )}

            {selectedBrands.map(b => (
              <span key={b} className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-100 rounded text-surface-800">
                <span>{b}</span>
                <button onClick={() => handleToggleBrand(b)}><X className="w-3 h-3" /></button>
              </span>
            ))}

            {inStockOnly && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-100 rounded text-surface-800">
                <span>In Stock</span>
                <button onClick={() => setInStockOnly(false)}><X className="w-3 h-3" /></button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="ml-auto text-brand-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        )}

        {/* Main Grid: Sidebar + Products */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:block bg-white p-5 rounded-lg border border-surface-200 text-left space-y-6 sticky top-28">
            {/* Search */}
            <div>
              <label className="text-xs font-bold uppercase text-surface-700 tracking-wider block mb-2">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-8 pr-2 py-1.5 bg-surface-50 border border-surface-300 rounded text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                />
                <Search className="w-3.5 h-3.5 text-surface-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Categories */}
            <div className="pt-4 border-t border-surface-100">
              <h4 className="text-xs font-bold uppercase text-surface-700 tracking-wider mb-2.5">
                Categories
              </h4>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left py-1 px-2 rounded text-xs flex justify-between ${
                    selectedCategory === 'all' ? 'bg-brand-50 font-bold text-brand-700' : 'text-surface-700 hover:bg-surface-50'
                  }`}
                >
                  <span>All Categories</span>
                  <span className="text-surface-400">({catalogProducts.length})</span>
                </button>
                {categoriesList.map(c => {
                  const targetValues = [c.id, c.name, c.slug].filter(Boolean).map(x => String(x).toLowerCase());
                  const count = catalogProducts.filter(p => {
                    const prodCat = String(p.category || '').toLowerCase();
                    const prodCatId = String(p.categoryId || '').toLowerCase();
                    const prodCatName = String(p.categoryName || '').toLowerCase();
                    return targetValues.some(t => t === prodCat || t === prodCatId || t === prodCatName);
                  }).length;
                  const isSelected = selectedCategory === c.id || selectedCategory === c.name || selectedCategory === c.slug;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      className={`w-full text-left py-1 px-2 rounded text-xs flex justify-between ${
                        isSelected ? 'bg-brand-50 font-bold text-brand-700' : 'text-surface-700 hover:bg-surface-50'
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-surface-400">({count || c.count || 0})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brands */}
            <div className="pt-4 border-t border-surface-100">
              <h4 className="text-xs font-bold uppercase text-surface-700 tracking-wider mb-2.5">
                Brands
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {brandsList.map(brand => (
                  <label key={brand} className="flex items-center gap-2 text-xs text-surface-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleToggleBrand(brand)}
                      className="rounded text-brand-500 focus:ring-brand-500 h-3.5 w-3.5"
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="pt-4 border-t border-surface-100">
              <label className="flex items-center gap-2 text-xs font-semibold text-surface-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-brand-500 focus:ring-brand-500 h-3.5 w-3.5"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </aside>

          {/* MAIN PRODUCT GRID */}
          <main className="lg:col-span-3">
            {/* Controls Row */}
            <div className="bg-white p-3.5 rounded-lg border border-surface-200 mb-6 flex items-center justify-between text-xs text-surface-600">
              <span>Showing <strong>{filteredProducts.length}</strong> products</span>

              <div className="flex items-center gap-2">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="py-1 px-2.5 bg-surface-50 border border-surface-300 rounded text-xs text-surface-800 font-medium focus:outline-none"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-az">Name: A to Z</option>
                </select>
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map(prod => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onSelectProduct={onSelectProduct}
                    onAddToCart={onAddToCart}
                    onToggleWishlist={onToggleWishlist}
                    isWishlisted={wishlistItems.includes(prod.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-surface-200 p-12 text-center text-xs text-surface-500">
                <p className="font-semibold text-sm text-surface-800 mb-2">No products found</p>
                <p className="mb-4">Try clearing your filters or search term.</p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-surface-900 text-white font-bold rounded uppercase tracking-wider text-xs"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </main>

        </div>

      </div>

      {/* MOBILE / TABLET FILTER DRAWER */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-5 overflow-y-auto flex flex-col justify-between text-left shadow-2xl">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-surface-200">
                <h3 className="font-bold text-sm text-surface-900">Filter Products</h3>
                <button 
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-surface-400 hover:text-surface-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search */}
              <div>
                <label className="text-xs font-bold uppercase text-surface-700 tracking-wider block mb-2">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search machines..."
                    className="w-full pl-8 pr-3 py-2 bg-surface-50 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                  />
                  <Search className="w-3.5 h-3.5 text-surface-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* In Stock Only */}
              <div className="pt-2 border-t border-surface-100">
                <label className="flex items-center gap-2 text-xs text-surface-700 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded text-brand-500 focus:ring-brand-500 h-4 w-4"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>

              {/* Category */}
              <div className="pt-2 border-t border-surface-100">
                <h4 className="text-xs font-bold uppercase text-surface-700 tracking-wider mb-2">Category</h4>
                <div className="space-y-1 text-xs max-h-48 overflow-y-auto pr-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left py-1.5 px-2.5 rounded-lg ${selectedCategory === 'all' ? 'bg-brand-50 text-brand-700 font-bold' : 'text-surface-700 hover:bg-surface-50'}`}
                  >
                    All Categories
                  </button>
                  {categoriesList.map(c => {
                    const isSelected = selectedCategory === c.id || selectedCategory === c.name || selectedCategory === c.slug;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCategory(c.id)}
                        className={`w-full text-left py-1.5 px-2.5 rounded-lg ${isSelected ? 'bg-brand-50 text-brand-700 font-bold' : 'text-surface-700 hover:bg-surface-50'}`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brands */}
              <div className="pt-2 border-t border-surface-100">
                <h4 className="text-xs font-bold uppercase text-surface-700 tracking-wider mb-2">Brands</h4>
                <div className="space-y-1.5 text-xs max-h-48 overflow-y-auto pr-1">
                  {brandsList.map(brand => (
                    <label key={brand} className="flex items-center gap-2 text-xs text-surface-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleToggleBrand(brand)}
                        className="rounded text-brand-500 focus:ring-brand-500 h-3.5 w-3.5"
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-surface-200 space-y-2 mt-4">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs"
              >
                Apply Filters ({filteredProducts.length})
              </button>

              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="w-full py-2 text-center text-xs font-semibold text-surface-500 hover:text-surface-800"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
