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
import TestimonialsPage from './components/TestimonialsPage';
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
import Footer from './components/Footer';

import { products } from './data/products';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  // Page view state: 'home' | 'catalog' | 'services' | 'blogs' | 'testimonials' | 'about' | 'contact' | 'product-detail' | 'article-detail' | 'request-sample' | 'cart' | 'checkout' | 'wishlist' | 'account'
  const [currentPage, setCurrentPage] = useState('home');
  const [catalogFilters, setCatalogFilters] = useState({
    category: 'all',
    brand: null,
    search: ''
  });

  const [activeProduct, setActiveProduct] = useState(null);
  const [activeArticle, setActiveArticle] = useState(null);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  // Cart / RFQ State (Frontend Demo)
  const [cartItems, setCartItems] = useState([
    {
      ...products[0],
      quantity: 1
    }
  ]);

  // Wishlist State (Frontend Demo)
  const [wishlistItems, setWishlistItems] = useState([products[1].id]);

  // User Profile State (Shared between Account & Checkout autofill)
  const [userProfile, setUserProfile] = useState({
    firstName: 'Richard',
    lastName: 'Davies',
    company: 'Apex Precision Engineering Ltd',
    email: 'r.davies@apexengineering.co.uk',
    phone: '+44 (0) 121 555 0192',
    address: 'Unit 12, Innovation Business Park',
    city: 'Birmingham',
    postcode: 'B45 9AG'
  });

  // Recent Orders State (With real products & images)
  const [orders, setOrders] = useState([
    {
      id: 'F3D-ORD-882410',
      date: '04 Sep 2026',
      status: 'Delivered',
      total: '£4,850.00',
      product: products[0],
      productName: products[0].name,
      brand: products[0].brand,
      image: (products[0].images && products[0].images[0]) || products[0].image,
      quantity: 1,
      specs: '420°C Hotend • Carbon Fiber Ready'
    },
    {
      id: 'F3D-ORD-774902',
      date: '18 Aug 2026',
      status: 'Delivered',
      total: '£3,290.00',
      product: products[1],
      productName: products[1].name,
      brand: products[1].brand,
      image: (products[1].images && products[1].images[0]) || products[1].image,
      quantity: 1,
      specs: 'Dual Extrusion • 300x300x300mm'
    }
  ]);

  const handleOrderPlaced = (newOrder) => {
    setOrders(prev => [newOrder, ...prev]);
    showToast(`Order ${newOrder.id} placed and recorded in your Account`);
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
    setCurrentPage('catalog');
    setCatalogFilters({
      category: categoryId,
      brand: null,
      search: ''
    });
  };

  const handleSelectBrand = (brandName) => {
    setCurrentPage('catalog');
    setCatalogFilters({
      category: 'all',
      brand: brandName,
      search: ''
    });
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

  // Modern ecommerce flow: Adding item auto-opens the Cart Drawer!
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
  };

  const handleAccountClick = () => {
    handleNavigate('account');
  };

  const handleUpdateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => item.id === productId ? { ...item, quantity } : item)
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

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

        {/* Customer Testimonials & Reviews Page */}
        {currentPage === 'testimonials' && (
          <TestimonialsPage
            onNavigate={handleNavigate}
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
          <AccountPage
            profile={userProfile}
            onUpdateProfile={setUserProfile}
            orders={orders}
            onAddToCart={handleAddToCart}
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}
      </div>

      {/* Clean Footer */}
      <Footer
        onNavigate={handleNavigate}
        onSelectCategory={handleSelectCategory}
        onOpenConsultation={() => setIsConsultationOpen(true)}
      />

      {/* Contact & Advice Modal (Pure Frontend) */}
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
      />

    </div>
  );
}
