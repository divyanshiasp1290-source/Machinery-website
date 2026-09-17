import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Mail, 
  Menu, 
  X, 
  ChevronDown, 
  Heart, 
  User, 
  Layers,
  Clock,
  MapPin
} from 'lucide-react';
import { products, allBrands } from '../data/products';
import { categories as defaultCategories } from '../data/categories';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { businessHoursConfig } from '../config/businessHours';

export default function Header({ 
  onNavigate, 
  currentPage, 
  cartItems = [], 
  wishlistCount = 0,
  onOpenCart, 
  onSelectCategory, 
  onSelectBrand,
  onSelectProduct,
  onOpenConsultation,
  onAccountClick,
  customer,
  onOpenCustomerAuth
}) {
  const { customer: authCustomer } = useAuth();
  const currentCustomer = customer || authCustomer;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [headerCategories, setHeaderCategories] = useState(defaultCategories);
  const [headerBrands, setHeaderBrands] = useState(() => allBrands.map(name => ({ id: name.toLowerCase(), name })));
  const [searchCategory, setSearchCategory] = useState('All');
  const [searchCategoryOpen, setSearchCategoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const fetchCats = () => {
      api.categories.list()
        .then(cats => {
          if (Array.isArray(cats) && cats.length > 0) {
            setHeaderCategories(cats);
          }
        })
        .catch(() => {});
    };
    fetchCats();

    const fetchBrands = () => {
      api.brands.list()
        .then(brs => {
          if (Array.isArray(brs) && brs.length > 0) {
            setHeaderBrands(brs);
          }
        })
        .catch(() => {});
    };
    fetchBrands();

    const unsubCats = api.realtime.subscribeCategories(() => {
      fetchCats();
    });

    const unsubBrands = api.realtime.subscribeBrands(() => {
      fetchBrands();
    });

    return () => {
      if (typeof unsubCats === 'function') unsubCats();
      if (typeof unsubBrands === 'function') unsubBrands();
    };
  }, []);

  // Search results
  const matchingProducts = searchQuery.trim().length > 1
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchDropdownOpen(false);
        setSearchCategoryOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchDropdownOpen(false);
      onNavigate('catalog', { search: searchQuery });
    }
  };

  const handleSelectSearchResult = (prod) => {
    setSearchDropdownOpen(false);
    setSearchQuery('');
    onSelectProduct(prod);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-surface-200 shadow-subtle">
      
      {/* 1. TOP UTILITY ANNOUNCEMENT BAR */}
      <div className="bg-surface-900 text-surface-300 text-xs py-1.5 sm:py-2 px-3 sm:px-6 lg:px-8 border-b border-surface-800">
        <div className="max-w-page mx-auto flex justify-between items-center gap-2 text-[11px] sm:text-xs">
          <div className="flex items-center space-x-3 sm:space-x-6 min-w-0">
            <span className="hidden md:inline-flex items-center gap-1.5 text-surface-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>SOFT 3D Spółka z o.o. • Authorized 3D Systems Distributor</span>
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-surface-300 shrink-0 text-[11px] sm:text-xs">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-brand-500 shrink-0" />
              <span>
                <span className="hidden xs:inline">{businessHoursConfig?.days ? `${businessHoursConfig.days}: ` : 'Mon - Fri: '}</span>
                {businessHoursConfig?.startTime && businessHoursConfig?.endTime 
                  ? `${businessHoursConfig.startTime.replace(/^0/, '')} - ${businessHoursConfig.endTime} ${businessHoursConfig?.timezone || 'CET'}`
                  : '8:30 - 17:30 CET'}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-brand-500 shrink-0" />
              <span>Warsaw, Poland</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (Brand Logo, Search Bar, Account, Wishlist, Cart) */}
      <div className="max-w-page mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-8">
        
        {/* Left: Mobile hamburger & SOFT 3D Logo */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 text-surface-700 hover:bg-surface-100 rounded-lg shrink-0"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          {/* Brand Logo: SOFT 3D */}
          <button 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-2 sm:gap-3 text-left focus:outline-none shrink-0 group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-surface-900 flex items-center justify-center text-brand-500 shadow-sm group-hover:bg-brand-600 group-hover:text-white transition-colors shrink-0">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-lg sm:text-2xl font-black tracking-tight text-surface-900 group-hover:text-brand-600 transition-colors">
                  SOFT <span className="text-brand-500 font-extrabold">3D</span>
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-surface-500 font-semibold tracking-wider uppercase -mt-0.5">
                Spółka z o.o.
              </p>
            </div>
          </button>
        </div>

        {/* Center: Search Bar with "All ⌵" category dropdown */}
        <div 
          ref={searchContainerRef} 
          className="relative flex-1 max-w-xl hidden md:block"
        >
          <form onSubmit={handleSearchSubmit} className="flex items-center border border-surface-300 rounded-xl overflow-hidden focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100 transition-all bg-surface-50">
            {/* Category Select Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSearchCategoryOpen(!searchCategoryOpen)}
                className="h-10 px-3.5 bg-surface-100/70 hover:bg-surface-200/80 border-r border-surface-300 text-xs font-bold text-surface-700 flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <span>{searchCategory}</span>
                <ChevronDown className="w-3.5 h-3.5 text-surface-500" />
              </button>

              {searchCategoryOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-52 bg-white border border-surface-200 rounded-xl shadow-card-hover z-50 py-1 text-xs font-medium text-surface-700 text-left max-h-64 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchCategory('All');
                      setSearchCategoryOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-surface-50 hover:text-brand-600 transition-colors font-bold border-b border-surface-100"
                  >
                    All Categories
                  </button>
                  {headerCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSearchCategory(cat.name);
                        setSearchCategoryOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-surface-50 hover:text-brand-600 transition-colors"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchDropdownOpen(true);
              }}
              onFocus={() => setSearchDropdownOpen(true)}
              placeholder="Search printers, materials, scanners..."
              className="flex-1 h-10 px-3 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none bg-transparent"
            />

            {/* Search Button in Brand Color */}
            <button
              type="submit"
              className="h-10 px-4 bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Autocomplete Results */}
          {searchDropdownOpen && searchQuery.trim().length > 1 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-surface-200 rounded-xl shadow-card-hover overflow-hidden z-50 text-left">
              {matchingProducts.length > 0 ? (
                <div className="divide-y divide-surface-100 max-h-72 overflow-y-auto">
                  {matchingProducts.map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => handleSelectSearchResult(prod)}
                      className="w-full text-left p-3 hover:bg-surface-50 flex items-center gap-3 transition-colors"
                    >
                      <img 
                        src={prod.images[0]} 
                        alt={prod.name} 
                        className="w-10 h-10 object-contain rounded bg-white p-1 border border-surface-200 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-brand-600 uppercase block">
                          {prod.brand}
                        </span>
                        <p className="text-xs font-semibold text-surface-900 truncate">
                          {prod.name}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {prod.quoteOnly ? (
                          <span className="text-xs font-bold text-brand-600">Quote</span>
                        ) : (
                          <span className="text-xs font-bold text-surface-900">
                            {prod.currency}{prod.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full py-2 bg-surface-50 hover:bg-surface-100 text-center text-xs font-bold text-brand-600"
                  >
                    View all matching results →
                  </button>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-surface-500">
                  No matching products found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Account, Wishlist, Cart Actions */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          
          {/* Account Button / Pill */}
          <button
            onClick={() => {
              if (currentCustomer) {
                onNavigate('account');
              } else if (onAccountClick) {
                onAccountClick();
              } else if (onOpenCustomerAuth) {
                onOpenCustomerAuth();
              } else {
                onNavigate('account');
              }
            }}
            className="px-2.5 py-1.5 text-surface-700 hover:text-surface-900 hover:bg-surface-100 rounded-lg transition-colors hidden sm:flex items-center gap-1.5 cursor-pointer text-xs font-bold"
            title={currentCustomer ? `Signed in as ${currentCustomer.firstName || currentCustomer.email}` : "Customer Sign In"}
          >
            {currentCustomer ? (
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center font-black text-[10px]">
                  {(currentCustomer.firstName?.[0] || currentCustomer.email?.[0] || 'U').toUpperCase()}
                </div>
                <span className="max-w-[110px] truncate text-surface-900 font-bold">
                  {currentCustomer.firstName || 'My Account'}
                </span>
              </div>
            ) : (
              <>
                <User className="w-4 h-4 text-brand-600" />
                <span>Sign In</span>
              </>
            )}
          </button>

          {/* Wishlist */}
          <button
            onClick={() => onNavigate('wishlist')}
            className="relative p-2 text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-lg transition-colors hidden sm:flex items-center justify-center cursor-pointer"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Icon with Counter */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-surface-900 hover:bg-brand-600 text-white rounded-lg sm:rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-subtle cursor-pointer shrink-0"
            title="Cart Tray"
          >
            <ShoppingCart className="w-4 h-4 text-brand-400 shrink-0" />
            <span className="hidden xs:inline">Cart</span>
            {totalCartCount > 0 && (
              <span className="bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>

      </div>

      {/* 3. NAVIGATION BAR (Exact Reference Categories & Clean Dropdowns) */}
      <nav className="bg-white border-t border-surface-100 hidden lg:block">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center justify-center gap-8 xl:gap-10 text-xs font-bold tracking-wide uppercase text-surface-700">
            
            {/* 1. Shop ⌵ */}
            <li 
              className="relative"
              onMouseEnter={() => setOpenDropdown('shop')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button 
                onClick={() => onNavigate('catalog')}
                className={`py-3.5 flex items-center gap-1 hover:text-brand-600 transition-colors ${
                  currentPage === 'catalog' ? 'text-brand-600 border-b-2 border-brand-500' : ''
                }`}
              >
                <span>Shop</span>
                <ChevronDown className="w-3.5 h-3.5 text-surface-400" />
              </button>

              {openDropdown === 'shop' && (
                <div className="absolute top-full left-0 w-72 bg-white border border-surface-200 shadow-card-hover rounded-b-xl p-2.5 z-50 text-left animate-fade-in font-normal normal-case text-xs max-h-96 overflow-y-auto">
                  <button
                    onClick={() => { setOpenDropdown(null); onNavigate('catalog'); }}
                    className="w-full text-left p-2 rounded-lg hover:bg-surface-50 text-brand-600 font-bold border-b border-surface-100 mb-1"
                  >
                    View All Products →
                  </button>
                  {headerCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => { setOpenDropdown(null); onSelectCategory(cat.id); }}
                      className="w-full text-left p-2 rounded-lg hover:bg-surface-50 text-surface-800 hover:text-brand-600 font-medium flex items-center justify-between"
                    >
                      <span>{cat.name}</span>
                      {cat.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-brand-50 text-brand-700 font-bold rounded">
                          {cat.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </li>

            {/* 2. Brands ⌵ */}
            <li 
              className="relative"
              onMouseEnter={() => setOpenDropdown('brands')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button 
                onClick={() => onNavigate('brands')}
                className={`py-3.5 flex items-center gap-1 hover:text-brand-600 transition-colors ${
                  currentPage === 'brands' ? 'text-brand-600 border-b-2 border-brand-500' : ''
                }`}
              >
                <span>Brands</span>
                <ChevronDown className="w-3.5 h-3.5 text-surface-400" />
              </button>

              {openDropdown === 'brands' && (
                <div className="absolute top-full left-0 w-60 bg-white border border-surface-200 shadow-card-hover rounded-b-xl p-3 z-50 text-left animate-fade-in font-normal normal-case text-xs">
                  <div className="text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-2 px-1">
                    Official Brands
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {headerBrands.map(b => {
                      const brandName = typeof b === 'string' ? b : (b.name || b.id);
                      return (
                        <button
                          key={brandName}
                          onClick={() => { setOpenDropdown(null); onSelectBrand(brandName); }}
                          className="w-full text-left p-1.5 rounded hover:bg-surface-50 text-surface-800 hover:text-brand-600 font-medium transition-colors"
                        >
                          {brandName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </li>

            {/* 3. Services ⌵ */}
            <li 
              className="relative"
              onMouseEnter={() => setOpenDropdown('services')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button 
                onClick={() => onNavigate('services')}
                className={`py-3.5 flex items-center gap-1 hover:text-brand-600 transition-colors ${
                  currentPage === 'services' ? 'text-brand-600 border-b-2 border-brand-500' : ''
                }`}
              >
                <span>Services</span>
                <ChevronDown className="w-3.5 h-3.5 text-surface-400" />
              </button>

              {openDropdown === 'services' && (
                <div className="absolute top-full left-0 w-64 bg-white border border-surface-200 shadow-card-hover rounded-b-xl p-2.5 z-50 text-left animate-fade-in font-normal normal-case text-xs">
                  <button
                    onClick={() => { setOpenDropdown(null); onNavigate('services'); }}
                    className="w-full text-left p-2 rounded-lg hover:bg-surface-50 text-brand-600 font-bold border-b border-surface-100 mb-1"
                  >
                    360° Additive Solutions →
                  </button>
                  <button
                    onClick={() => { setOpenDropdown(null); onNavigate('services'); }}
                    className="w-full text-left p-2 rounded-lg hover:bg-surface-50 text-surface-800 hover:text-brand-600 font-medium"
                  >
                    AM Audits &amp; Feasibility
                  </button>
                  <button
                    onClick={() => { setOpenDropdown(null); onNavigate('services'); }}
                    className="w-full text-left p-2 rounded-lg hover:bg-surface-50 text-surface-800 hover:text-brand-600 font-medium"
                  >
                    3D Scanning &amp; Metrology Inspection
                  </button>
                  <button
                    onClick={() => { setOpenDropdown(null); onNavigate('services'); }}
                    className="w-full text-left p-2 rounded-lg hover:bg-surface-50 text-surface-800 hover:text-brand-600 font-medium"
                  >
                    On-Demand 3D Print Farm
                  </button>
                  <button
                    onClick={() => { setOpenDropdown(null); onNavigate('services'); }}
                    className="w-full text-left p-2 rounded-lg hover:bg-surface-50 text-surface-800 hover:text-brand-600 font-medium"
                  >
                    Maintenance SLAs &amp; Training
                  </button>
                </div>
              )}
            </li>

            {/* 4. More ⌵ */}
            <li 
              className="relative"
              onMouseEnter={() => setOpenDropdown('more')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button 
                className="py-3.5 flex items-center gap-1 hover:text-brand-600 transition-colors"
              >
                <span>More</span>
                <ChevronDown className="w-3.5 h-3.5 text-surface-400" />
              </button>

              {openDropdown === 'more' && (
                <div className="absolute top-full left-0 w-56 bg-white border border-surface-200 shadow-card-hover rounded-b-xl p-2.5 z-50 text-left animate-fade-in font-normal normal-case text-xs">
                  <button
                    onClick={() => { setOpenDropdown(null); onNavigate('blogs'); }}
                    className="w-full text-left p-2 rounded-lg hover:bg-surface-50 text-surface-800 hover:text-brand-600 font-medium"
                  >
                    Case Studies &amp; Blog
                  </button>
                  <button
                    onClick={() => { setOpenDropdown(null); onNavigate('about'); }}
                    className="w-full text-left p-2 rounded-lg hover:bg-surface-50 text-surface-800 hover:text-brand-600 font-medium"
                  >
                    About Us
                  </button>
                </div>
              )}
            </li>

            {/* 5. Contact Us */}
            <li>
              <button 
                onClick={() => onNavigate('contact')}
                className={`py-3.5 hover:text-brand-600 transition-colors ${
                  currentPage === 'contact' ? 'text-brand-600 border-b-2 border-brand-500' : ''
                }`}
              >
                Contact Us
              </button>
            </li>

            {/* 6. Request a Sample */}
            <li>
              <button 
                onClick={() => onNavigate('request-sample')}
                className={`py-3.5 hover:text-brand-600 font-bold transition-colors cursor-pointer ${
                  currentPage === 'request-sample' ? 'text-brand-600 border-b-2 border-brand-500' : 'text-brand-600'
                }`}
              >
                Request a Sample
              </button>
            </li>

          </ul>
        </div>
      </nav>

      {/* 4. MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-surface-200 px-5 py-5 space-y-4 shadow-2xl text-left max-h-[85vh] overflow-y-auto text-xs">
          <form onSubmit={(e) => {
            e.preventDefault();
            setMobileMenuOpen(false);
            onNavigate('catalog', { search: searchQuery });
          }} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search printers, materials, scanners..."
              className="w-full pl-4 pr-10 py-3 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500 bg-surface-50"
            />
            <button type="submit" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-brand-600">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <div className="font-bold text-surface-800 divide-y divide-surface-100">
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('catalog'); }}
              className="w-full text-left py-3 min-h-[44px] flex items-center hover:text-brand-600"
            >
              Shop All Products
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('brands'); }}
              className="w-full text-left py-3 min-h-[44px] flex items-center hover:text-brand-600"
            >
              Shop By Brand
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('services'); }}
              className="w-full text-left py-3 min-h-[44px] flex items-center hover:text-brand-600"
            >
              Services &amp; 360 Solutions
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('blogs'); }}
              className="w-full text-left py-3 min-h-[44px] flex items-center hover:text-brand-600"
            >
              Case Studies &amp; Blog
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('about'); }}
              className="w-full text-left py-3 min-h-[44px] flex items-center hover:text-brand-600"
            >
              About Us
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('contact'); }}
              className="w-full text-left py-3 min-h-[44px] flex items-center hover:text-brand-600"
            >
              Contact Us
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('request-sample'); }}
              className="w-full text-left py-3 min-h-[44px] flex items-center text-brand-600 font-bold"
            >
              Request a Sample →
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('cart'); }}
              className="w-full text-left py-3 min-h-[44px] flex items-center justify-between font-bold text-surface-900 hover:text-brand-600"
            >
              <span>View Cart / Quotation Tray</span>
              {totalCartCount > 0 && (
                <span className="bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {totalCartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('wishlist'); }}
              className="w-full text-left py-3 min-h-[44px] flex items-center justify-between font-bold text-surface-900 hover:text-brand-600"
            >
              <span>My Saved Wishlist</span>
              {wishlistCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { 
                setMobileMenuOpen(false); 
                if (currentCustomer) {
                  onNavigate('account');
                } else if (onOpenCustomerAuth) {
                  onOpenCustomerAuth();
                } else {
                  onNavigate('account');
                }
              }}
              className="w-full text-left py-3 min-h-[44px] flex items-center justify-between font-bold text-surface-900 hover:text-brand-600"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-brand-600" />
                <span>
                  {currentCustomer 
                    ? `My Account (${currentCustomer.firstName || currentCustomer.email})` 
                    : 'Customer Portal / Sign In'}
                </span>
              </div>
              {currentCustomer && (
                <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold border border-emerald-200">
                  Signed In
                </span>
              )}
            </button>
          </div>
        </div>
      )}

    </header>
  );
}
