import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryGrid from './components/CategoryGrid';
import FeaturedProducts from './components/FeaturedProducts';
import BrandsMarquee from './components/BrandsMarquee';
import BlogSection from './components/BlogSection';
import TestimonialsSection from './components/TestimonialsSection';
import WhyChooseUs from './components/WhyChooseUs';
import ConsultationCTA from './components/ConsultationCTA';

// Dedicated Subpages
import ProductCatalog from './components/ProductCatalog';
import ServicesPage from './components/ServicesPage';
import BlogPage from './components/BlogPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';

import ProductDetailPage from './components/ProductDetailPage';
import ArticleDetailPage from './components/ArticleDetailPage';
import RequestSamplePage from './components/RequestSamplePage';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import WishlistPage from './components/WishlistPage';
import AccountPage from './components/AccountPage';
import ConsultationModal from './components/ConsultationModal';
import CustomerAuthModal from './components/CustomerAuthModal';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import AdminLoginPage from './components/admin/AdminLoginPage';
import AdminDashboard from './components/admin/AdminDashboard';
import Footer from './components/Footer';

import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import { products } from './data/products';
import { CheckCircle2, User } from 'lucide-react';

export default function App() {
  const { customer, admin, customerLogout, adminLogout } = useAuth();

  // Page view state: 'home' | 'catalog' | 'services' | 'blogs' | 'testimonials' | 'about' | 'contact' | 'product-detail' | 'article-detail' | 'request-sample' | 'cart' | 'checkout' | 'wishlist' | 'account' | 'admin' | 'admin-login'
  const [currentPage, setCurrentPage] = useState('home');
  const [catalogFilters, setCatalogFilters] = useState({
    category: 'all',
    brand: null,
    search: ''
  });

  const [activeProduct, setActiveProduct] = useState(null);
  const [activeArticle, setActiveArticle] = useState(null);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Cart / RFQ State - Persistent localStorage backed, defaults to empty []
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('forge3d_local_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved cart:', e);
    }
    return [];
  });

  // Always keep localStorage in sync with cartItems
  useEffect(() => {
    try {
      localStorage.setItem('forge3d_local_cart', JSON.stringify(cartItems));
    } catch (e) {}
  }, [cartItems]);

  // Wishlist State - clean empty default for every user
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem('forge3d_local_wishlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  // Always keep localStorage in sync with wishlistItems
  useEffect(() => {
    try {
      localStorage.setItem('forge3d_local_wishlist', JSON.stringify(wishlistItems));
    } catch (e) {}
  }, [wishlistItems]);

  // User Profile State (Shared between Account & Checkout autofill)
  const [userProfile, setUserProfile] = useState(() => ({
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    company: customer?.company || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    city: customer?.city || '',
    postcode: customer?.postcode || ''
  }));

  // Keep userProfile in sync with customer
  useEffect(() => {
    if (customer) {
      setUserProfile({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        company: customer.company || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        postcode: customer.postcode || ''
      });
    } else {
      setUserProfile({
        firstName: '',
        lastName: '',
        company: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postcode: ''
      });
    }
  }, [customer]);

  // Sync cart & wishlist from backend when customer is logged in
  useEffect(() => {
    if (customer) {
      api.cart.get()
        .then(res => {
          const items = Array.isArray(res) ? res : (res?.items || []);
          if (items.length > 0) {
            setCartItems(items.map(item => ({
              id: item.id || item.productId,
              name: item.name,
              brand: item.brand,
              category: item.category,
              categoryName: item.categoryName,
              price: item.price,
              currency: item.currency || '£',
              image: item.image,
              images: item.images || [item.image],
              specs: item.specs,
              quoteOnly: !!item.quoteOnly,
              inStock: item.inStock !== false,
              quantity: item.quantity || 1
            })));
          } else {
            // Backend cart is empty (e.g. after order placement)
            setCartItems([]);
          }
        })
        .catch(() => {});

      api.wishlist.get()
        .then(res => {
          const items = Array.isArray(res) ? res : (res?.items || []);
          setWishlistItems(items.map(i => i.id || i.productId));
        })
        .catch(() => {
          setWishlistItems([]);
        });
    } else {
      // Clear cart & wishlist completely when no user is logged in
      setCartItems([]);
      setWishlistItems([]);
      try {
        localStorage.removeItem('forge3d_local_cart');
        localStorage.removeItem('forge3d_local_wishlist');
      } catch (e) {}
    }
  }, [customer]);

  // Recent Orders State
  const [orders, setOrders] = useState([]);

  const handleOrderPlaced = (newOrder) => {
    setOrders(prev => [newOrder, ...prev]);
    showToast(`Order ${newOrder.id} placed and recorded in your Account`);
    handleClearCart();
    window.dispatchEvent(new CustomEvent('forge3d_products_updated'));
  };

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // URL Hash listener for direct navigation
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash === 'admin' || hash === 'admin-dashboard') {
        setCurrentPage('admin');
      } else if (hash === 'admin-login') {
        setCurrentPage('admin-login');
      } else if (hash === 'account') {
        setCurrentPage('account');
      } else if (hash === 'cart') {
        setCurrentPage('cart');
      } else if (hash === 'checkout') {
        setCurrentPage('checkout');
      } else if (hash === 'wishlist') {
        setCurrentPage('wishlist');
      } else if (hash === 'catalog') {
        setCurrentPage('catalog');
      } else if (hash === 'services') {
        setCurrentPage('services');
      } else if (hash === 'blogs') {
        setCurrentPage('blogs');
      } else if (hash === 'about') {
        setCurrentPage('about');
      } else if (hash === 'contact') {
        setCurrentPage('contact');
      } else if (hash === 'request-sample') {
        setCurrentPage('request-sample');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleNavigate = (page, options = {}) => {
    if (page === 'brands') {
      if (currentPage !== 'home') {
        setCurrentPage('home');
      }
      setTimeout(() => {
        const el = document.getElementById('brands');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    window.location.hash = `#/${page}`;
    setCurrentPage(page);
    if (page === 'catalog') {
      setCatalogFilters({
        category: options.category || 'all',
        brand: options.brand || null,
        search: options.search || ''
      });
    }
  };

  const handleSelectCategory = (categoryId) => {
    handleNavigate('catalog', { category: categoryId });
  };

  const handleSelectBrand = (brandName) => {
    handleNavigate('catalog', { brand: brandName });
  };

  const handleSelectProduct = (product) => {
    setActiveProduct(product);
    setCurrentPage('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectArticle = (article) => {
    setActiveArticle(article);
    setCurrentPage('article-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });

    if (customer) {
      api.cart.add(product.id, quantity).catch(() => {});
    }

    showToast(
      product.quoteOnly
        ? `Added "${product.name}" to Quotation Tray`
        : `Added "${product.name}" to Cart`
    );
  };

  const handleToggleWishlist = (product) => {
    setWishlistItems(prev => {
      const exists = prev.includes(product.id);
      if (exists) {
        showToast(`Removed "${product.name}" from Wishlist`);
        return prev.filter(id => id !== product.id);
      } else {
        showToast(`Saved "${product.name}" to Wishlist`);
        return [...prev, product.id];
      }
    });

    if (customer) {
      api.wishlist.toggle(product.id).catch(() => {});
    }
  };

  const handleAccountClick = () => {
    if (customer) {
      handleNavigate('account');
    } else {
      setIsCustomerAuthOpen(true);
    }
  };

  const handleUpdateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => item.id === productId ? { ...item, quantity } : item)
    );
    if (customer) {
      api.cart.update(productId, quantity).catch(() => {});
    }
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
    if (customer) {
      api.cart.remove(productId).catch(() => {});
    }
  };

  const handleClearCart = () => {
    setCartItems([]);
    try {
      localStorage.setItem('forge3d_local_cart', JSON.stringify([]));
    } catch (e) {}
    api.cart.clear().catch(() => {});
  };

  // Dedicated Admin Console routing (isolated from customer layout)
  if (currentPage === 'admin') {
    if (!admin) {
      return (
        <AdminLoginPage
          onLoginSuccess={() => setCurrentPage('admin')}
          onNavigateStore={() => handleNavigate('home')}
        />
      );
    }
    return (
      <AdminDashboard
        onNavigateStore={() => handleNavigate('home')}
      />
    );
  }

  if (currentPage === 'admin-login') {
    if (admin) {
      return (
        <AdminDashboard
          onNavigateStore={() => handleNavigate('home')}
        />
      );
    }
    return (
      <AdminLoginPage
        onLoginSuccess={() => setCurrentPage('admin')}
        onNavigateStore={() => handleNavigate('home')}
      />
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip flex flex-col bg-surface-50 text-surface-900 font-sans antialiased">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface-900 text-white px-4 py-3 rounded-xl shadow-card-hover flex items-center gap-2.5 text-xs font-semibold animate-fade-in border border-surface-800">
          <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Navigation (Centered Links) */}
      <Header
        onNavigate={handleNavigate}
        currentPage={currentPage}
        cartItems={cartItems}
        wishlistCount={wishlistItems.length}
        onOpenCart={() => handleNavigate('cart')}
        onSelectCategory={handleSelectCategory}
        onSelectBrand={handleSelectBrand}
        onSelectProduct={handleSelectProduct}
        onOpenConsultation={() => setIsConsultationOpen(true)}
        onAccountClick={handleAccountClick}
        customer={customer}
        onOpenCustomerAuth={() => {
          if (customer) {
            handleNavigate('account');
          } else {
            setIsCustomerAuthOpen(true);
          }
        }}
      />

      {/* Main View Flow */}
      <div className="flex-1">
        
        {/* HOMEPAGE FLOW */}
        {currentPage === 'home' && (
          <main>
            {/* 1. Full-Width Cinematic Hero */}
            <Hero
              onExploreCatalog={() => handleNavigate('catalog')}
              onOpenConsultation={() => setIsConsultationOpen(true)}
              onRequestSample={() => handleNavigate('request-sample')}
            />

            {/* 2. Main Equipment Categories */}
            <CategoryGrid
              onSelectCategory={handleSelectCategory}
              onExploreAll={() => handleNavigate('catalog')}
            />

            {/* 3. Featured Machinery & Hardware */}
            <FeaturedProducts
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              wishlistItems={wishlistItems}
              onViewAllCatalog={() => handleNavigate('catalog')}
            />

            {/* 4. Shop By Brand (Interactive carousel matching evo3d reference) */}
            <BrandsMarquee
              onSelectBrand={handleSelectBrand}
            />

            {/* 5. Industry Insights & Blog (Placed directly below Shop By Brand matching evo3d reference) */}
            <BlogSection
              onNavigate={handleNavigate}
              onSelectArticle={handleSelectArticle}
            />

            {/* 6. Customer Testimonials (Clean normal testimonials, no Trustpilot) */}
            <TestimonialsSection
              onNavigate={handleNavigate}
            />

            {/* 7. Short Company / Benefits Section */}
            <WhyChooseUs />

            {/* 8. Final Conversion CTA */}
            <ConsultationCTA
              onOpenConsultation={() => setIsConsultationOpen(true)}
            />
          </main>
        )}

        {/* Product Catalog Page */}
        {currentPage === 'catalog' && (
          <ProductCatalog
            key={`catalog-${catalogFilters.category || 'all'}-${catalogFilters.brand || 'all'}-${catalogFilters.search || ''}`}
            initialCategory={catalogFilters.category}
            initialBrand={catalogFilters.brand}
            initialSearch={catalogFilters.search}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlistItems={wishlistItems}
          />
        )}

        {/* Services & 360 Additive Solutions Page */}
        {currentPage === 'services' && (
          <ServicesPage
            onNavigate={handleNavigate}
            onOpenConsultation={() => setIsConsultationOpen(true)}
          />
        )}



        {/* Knowledge Centre / Case Studies Page */}
        {currentPage === 'blogs' && (
          <BlogPage
            onNavigate={handleNavigate}
            onSelectArticle={handleSelectArticle}
            onOpenConsultation={() => setIsConsultationOpen(true)}
          />
        )}

        {/* About Us Page */}
        {currentPage === 'about' && (
          <AboutPage
            onNavigate={handleNavigate}
            onOpenConsultation={() => setIsConsultationOpen(true)}
          />
        )}

        {/* Contact Page */}
        {currentPage === 'contact' && (
          <ContactPage
            onNavigate={handleNavigate}
          />
        )}

        {/* Dedicated Product Detail Page (Replaces Popup Modal) */}
        {currentPage === 'product-detail' && activeProduct && (
          <ProductDetailPage
            product={activeProduct}
            onBack={() => handleNavigate('catalog')}
            onNavigate={handleNavigate}
            onAddToCart={handleAddToCart}
            onSelectProduct={handleSelectProduct}
            onOpenConsultation={() => setIsConsultationOpen(true)}
            onToggleWishlist={handleToggleWishlist}
            isWishlisted={wishlistItems.includes(activeProduct.id)}
          />
        )}

        {/* Dedicated Article Detail Page (Replaces Popup Modal) */}
        {currentPage === 'article-detail' && activeArticle && (
          <ArticleDetailPage
            article={activeArticle}
            onBack={() => handleNavigate('blogs')}
            onNavigate={handleNavigate}
            onSelectArticle={handleSelectArticle}
            onOpenConsultation={() => setIsConsultationOpen(true)}
          />
        )}

        {/* Dedicated Request a Sample Page */}
        {currentPage === 'request-sample' && (
          <RequestSamplePage
            onNavigate={handleNavigate}
          />
        )}

        {/* Dedicated Cart & RFQ Page (Full Page View) */}
        {currentPage === 'cart' && (
          <CartPage
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {/* Dedicated Checkout Page */}
        {currentPage === 'checkout' && (
          <CheckoutPage
            cartItems={cartItems}
            onClearCart={handleClearCart}
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
            userProfile={userProfile}
            onOrderPlaced={handleOrderPlaced}
          />
        )}

        {/* Dedicated Wishlist Page */}
        {currentPage === 'wishlist' && (
          <WishlistPage
            wishlistItems={wishlistItems}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onSelectProduct={handleSelectProduct}
            onNavigate={handleNavigate}
          />
        )}

        {/* Dedicated Customer Account & Portal Page */}
        {currentPage === 'account' && (
          customer ? (
            <AccountPage
              profile={userProfile}
              onUpdateProfile={setUserProfile}
              orders={orders}
              onAddToCart={handleAddToCart}
              onNavigate={handleNavigate}
              onSelectProduct={handleSelectProduct}
            />
          ) : (
            <div className="bg-surface-50 min-h-[60vh] py-16 flex items-center justify-center px-4 text-center">
              <div className="bg-white border border-surface-200 shadow-sm rounded-2xl p-8 max-w-md w-full space-y-4">
                <div className="w-14 h-14 bg-brand-50 border border-brand-200 text-brand-600 rounded-2xl flex items-center justify-center mx-auto">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="font-display font-black text-2xl text-surface-900 tracking-tight">Customer Account Portal</h2>
                  <p className="text-xs text-surface-500 mt-1">
                    Please sign in to access your manufacturing orders, saved equipment quotations, and delivery profiles.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={() => setIsCustomerAuthOpen(true)}
                    className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Sign In / Register
                  </button>
                  <button
                    onClick={() => handleNavigate('catalog')}
                    className="py-3 px-4 bg-surface-100 hover:bg-surface-200 text-surface-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Browse Equipment
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Clean Footer */}
      <Footer
        onNavigate={handleNavigate}
        onSelectCategory={handleSelectCategory}
        onOpenConsultation={() => setIsConsultationOpen(true)}
      />

      {/* Consultation Modal */}
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
      />

      {/* Customer Authentication Modal (Sign In / Register) */}
      <CustomerAuthModal
        isOpen={isCustomerAuthOpen && !customer}
        onClose={() => setIsCustomerAuthOpen(false)}
        guestCart={cartItems}
        guestWishlist={wishlistItems}
        onOpenForgotPassword={() => {
          setIsCustomerAuthOpen(false);
          setIsForgotPasswordOpen(true);
        }}
        onSuccess={(newUser, isNewRegistration) => {
          setIsCustomerAuthOpen(false);
          if (isNewRegistration) {
            setCartItems([]);
            setWishlistItems([]);
            try {
              localStorage.removeItem('forge3d_local_cart');
              localStorage.removeItem('forge3d_local_wishlist');
            } catch (e) {}
          }
          if (newUser) {
            handleNavigate('account');
          }
          showToast(isNewRegistration ? 'Account created successfully! Welcome to SOFT 3D.' : 'Signed in successfully');
        }}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onBackToLogin={() => {
          setIsForgotPasswordOpen(false);
          setIsCustomerAuthOpen(true);
        }}
      />

    </div>
  );
}
