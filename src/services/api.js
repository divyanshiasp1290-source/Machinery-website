// Forge 3D Unified API Client - Supabase Implementation
import { supabase, isSupabaseConfigured, supabaseUrl, supabaseAnonKey } from './supabaseClient.js';
import { createClient } from '@supabase/supabase-js';
import { products as localProducts } from '../data/products.js';
import { categories as localCategories } from '../data/categories.js';
import { brandsData as localBrands } from '../data/brandsData.js';
import { blogs as localBlogs } from '../data/blogs.js';

// Token Management (stores session access tokens for fast client-side session checks)
export function getCustomerToken() {
  return localStorage.getItem('forge3d_customer_token');
}

export function setCustomerToken(token) {
  if (token) {
    localStorage.setItem('forge3d_customer_token', token);
  } else {
    localStorage.removeItem('forge3d_customer_token');
  }
}

export function getAdminToken() {
  return localStorage.getItem('forge3d_admin_token');
}

export function setAdminToken(token) {
  if (token) {
    localStorage.setItem('forge3d_admin_token', token);
  } else {
    localStorage.removeItem('forge3d_admin_token');
  }
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// LOCAL FALLBACK DATA HELPERS (Ensures zero crashes before .env.local is populated)
// -----------------------------------------------------------------------------
const LOCAL_STORAGE_ORDERS_KEY = 'forge3d_local_orders';
const LOCAL_STORAGE_ENQUIRIES_KEY = 'forge3d_local_enquiries';
const LOCAL_STORAGE_REVIEWS_KEY = 'forge3d_local_reviews';
const LOCAL_STORAGE_COUPONS_KEY = 'forge3d_local_coupons';
const LOCAL_STORAGE_CART_KEY = 'forge3d_local_cart';
const LOCAL_STORAGE_WISHLIST_KEY = 'forge3d_local_wishlist';
const LOCAL_STORAGE_PRODUCTS_STOCK_KEY = 'forge3d_local_products_stock';
const LOCAL_STORAGE_CUSTOMERS_KEY = 'forge3d_local_customers';
const LOCAL_STORAGE_CURRENT_CUSTOMER_KEY = 'forge3d_current_customer';
const LOCAL_STORAGE_ADDRESSES_KEY = 'forge3d_local_addresses';
const LOCAL_STORAGE_ADMIN_USERS_KEY = 'forge3d_local_admin_users';
const LOCAL_STORAGE_CURRENT_ADMIN_KEY = 'forge3d_current_admin';
const LOCAL_STORAGE_SETTINGS_KEY = 'forge3d_local_settings';
const LOCAL_STORAGE_CATEGORIES_KEY = 'forge3d_local_categories';
const LOCAL_STORAGE_BRANDS_KEY = 'forge3d_local_brands';
const LOCAL_STORAGE_BLOGS_KEY = 'forge3d_local_blogs';
const LOCAL_STORAGE_SUBSCRIBERS_KEY = 'forge3d_local_subscribers';

function getLocalStore(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalStore(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

export function extractNameFromEmail(email) {
  if (!email || typeof email !== 'string') return { firstName: 'Customer', lastName: '', name: 'Customer' };
  const prefix = email.split('@')[0];
  const clean = prefix.replace(/[0-9_.-]/g, ' ').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const fn = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
    const ln = parts[1].charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase();
    return { firstName: fn, lastName: ln, name: `${fn} ${ln}` };
  } else if (parts.length === 1 && parts[0].length > 0) {
    const fn = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
    return { firstName: fn, lastName: '', name: fn };
  } else {
    const raw = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    return { firstName: raw, lastName: '', name: raw };
  }
}

export function getProductStockMap() {
  return getLocalStore(LOCAL_STORAGE_PRODUCTS_STOCK_KEY, {});
}

export function deductProductStock(productId, quantity = 1) {
  const stockMap = getLocalStore(LOCAL_STORAGE_PRODUCTS_STOCK_KEY, {});
  const baseProduct = localProducts.find(p => p.id === productId);
  const baseStock = baseProduct ? (baseProduct.stockQuantity ?? 10) : 10;
  const currentStock = stockMap[productId] !== undefined ? stockMap[productId] : baseStock;
  const newStock = Math.max(0, currentStock - Number(quantity || 1));
  stockMap[productId] = newStock;
  setLocalStore(LOCAL_STORAGE_PRODUCTS_STOCK_KEY, stockMap);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('forge3d_products_updated', { detail: { productId, stock: newStock } }));
  }
  return newStock;
}

export function restoreProductStock(productId, quantity = 1) {
  const stockMap = getLocalStore(LOCAL_STORAGE_PRODUCTS_STOCK_KEY, {});
  const baseProduct = localProducts.find(p => p.id === productId);
  const baseStock = baseProduct ? (baseProduct.stockQuantity ?? 10) : 10;
  const currentStock = stockMap[productId] !== undefined ? stockMap[productId] : baseStock;
  const newStock = currentStock + Number(quantity || 1);
  stockMap[productId] = newStock;
  setLocalStore(LOCAL_STORAGE_PRODUCTS_STOCK_KEY, stockMap);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('forge3d_products_updated', { detail: { productId, stock: newStock } }));
  }
  return newStock;
}

// Data Mappers (Bidirectional snake_case <-> camelCase for seamless UI compatibility)
// -----------------------------------------------------------------------------

function productFromDb(p) {
  if (!p) return null;
  return {
    ...p,
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand,
    categoryId: p.category_id || p.categoryId,
    categoryName: p.category_name || p.categoryName,
    category: p.category_name || p.categoryName || p.category_id,
    technology: p.technology,
    price: Number(p.price) || 0,
    salePrice: p.sale_price != null ? Number(p.sale_price) : undefined,
    quoteOnly: p.quote_only ?? p.quoteOnly ?? false,
    currency: p.currency || '£',
    stockQuantity: (() => {
      const stockMap = getLocalStore(LOCAL_STORAGE_PRODUCTS_STOCK_KEY, {});
      const baseProduct = localProducts.find(x => x.id === p.id);
      const raw = stockMap[p.id] !== undefined 
        ? stockMap[p.id] 
        : (p.stock_quantity ?? p.stockQuantity ?? baseProduct?.stockQuantity ?? 10);
      return Math.max(0, Number(raw) || 0);
    })(),
    inStock: (() => {
      const stockMap = getLocalStore(LOCAL_STORAGE_PRODUCTS_STOCK_KEY, {});
      const baseProduct = localProducts.find(x => x.id === p.id);
      const raw = stockMap[p.id] !== undefined 
        ? stockMap[p.id] 
        : (p.stock_quantity ?? p.stockQuantity ?? baseProduct?.stockQuantity ?? 10);
      return Math.max(0, Number(raw) || 0) > 0;
    })(),
    availability: (() => {
      const stockMap = getLocalStore(LOCAL_STORAGE_PRODUCTS_STOCK_KEY, {});
      const baseProduct = localProducts.find(x => x.id === p.id);
      const raw = stockMap[p.id] !== undefined 
        ? stockMap[p.id] 
        : (p.stock_quantity ?? p.stockQuantity ?? baseProduct?.stockQuantity ?? 10);
      const qty = Math.max(0, Number(raw) || 0);
      return qty > 0 
        ? (p.availability && !p.availability.toLowerCase().includes('out of stock') ? p.availability : 'In Stock UK - Dispatched within 24h') 
        : 'Out of Stock';
    })(),
    minStock: p.min_stock != null ? Number(p.min_stock) : (p.minStock != null ? Number(p.minStock) : 5),
    leadTime: p.lead_time || p.leadTime,
    sku: p.sku,
    rating: p.rating != null && !isNaN(Number(p.rating)) && Number(p.rating) > 0 ? Number(p.rating) : null,
    reviewsCount: Number(p.reviews_count ?? p.reviewsCount ?? 0) || 0,
    images: Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? JSON.parse(p.images || '[]') : []),
    shortSpecs: p.short_specs || p.shortSpecs || {},
    description: p.description || '',
    keyFeatures: Array.isArray(p.key_features) ? p.key_features : (p.keyFeatures || []),
    techSpecs: p.tech_specs || p.techSpecs || {},
    suitableMaterials: Array.isArray(p.suitable_materials) ? p.suitable_materials : (p.suitableMaterials || []),
    warranty: p.warranty,
    isFeatured: Boolean(
      p.is_featured ?? 
      p.isFeatured ?? 
      (p.badge && String(p.badge).toLowerCase().includes('featured')) ?? 
      false
    ),
    badge: p.badge || '',
    badges: p.badge ? String(p.badge).split(',').map(b => b.trim()).filter(Boolean) : [],
    metaTitle: p.meta_title || p.metaTitle,
    metaDescription: p.meta_description || p.metaDescription,
    relatedProductIds: Array.isArray(p.related_product_ids) ? p.related_product_ids : (p.relatedProductIds || [])
  };
}

function productToDb(p) {
  const slug = p.slug || (p.name ? p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `prod-${Date.now()}`);
  const stockQty = p.stockQuantity != null ? Number(p.stockQuantity) : 10;
  
  // inStock resolution: explicitly honor boolean; default to stockQty > 0
  let inStock = true;
  if (typeof p.inStock === 'boolean') {
    inStock = p.inStock;
  } else if (typeof p.in_stock === 'boolean') {
    inStock = p.in_stock;
  } else {
    inStock = stockQty > 0;
  }

  const rawBadge = p.badges !== undefined ? p.badges : p.badge;
  const badgeStr = Array.isArray(rawBadge)
    ? rawBadge.map(b => String(b).trim()).filter(Boolean).join(', ')
    : (rawBadge ? String(rawBadge).trim() : null);

  const isFeatured = Boolean(
    p.isFeatured || 
    p.is_featured || 
    (badgeStr && badgeStr.toLowerCase().includes('featured'))
  );

  return {
    id: p.id || `prod_${Date.now()}`,
    name: p.name,
    slug: slug,
    brand: p.brand || 'SOFT 3D',
    category_id: p.categoryId || p.category_id || 'industrial-fdm',
    category_name: p.categoryName || p.category_name || 'Industrial 3D Printers',
    technology: p.technology || 'Industrial FFF/FDM',
    price: Number(p.price) || 0,
    sale_price: p.salePrice != null ? Number(p.salePrice) : null,
    quote_only: Boolean(p.quoteOnly),
    currency: p.currency || '£',
    availability: p.availability || (inStock ? 'In Stock UK' : 'Out of Stock'),
    in_stock: inStock,
    stock_quantity: stockQty,
    min_stock: p.minStock != null ? Number(p.minStock) : 5,
    lead_time: p.leadTime || 'Next Day Delivery',
    sku: p.sku || `SKU-${Date.now().toString().slice(-6)}`,
    images: Array.isArray(p.images) ? p.images : [],
    short_specs: p.shortSpecs || {},
    description: p.description || '',
    key_features: Array.isArray(p.keyFeatures) ? p.keyFeatures : [],
    tech_specs: p.techSpecs || {},
    suitable_materials: Array.isArray(p.suitableMaterials) ? p.suitableMaterials : [],
    warranty: p.warranty || '2 Years UK Manufacturer Support',
    is_featured: isFeatured,
    badge: badgeStr || null,
    meta_title: p.metaTitle || p.name,
    meta_description: p.metaDescription || p.description?.slice(0, 160) || '',
    related_product_ids: Array.isArray(p.relatedProductIds) ? p.relatedProductIds : [],
    updated_at: new Date().toISOString()
  };
}

function blogFromDb(b) {
  if (!b) return null;
  return {
    ...b,
    id: b.id,
    slug: b.slug,
    title: b.title,
    category: b.category,
    tag: b.tag,
    date: b.date || (b.created_at ? new Date(b.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''),
    readTime: b.read_time || b.readTime || '5 min read',
    author: b.author,
    authorRole: b.author_role || b.authorRole,
    image: b.image,
    summary: b.summary,
    content: b.content,
    status: b.status || 'published',
    isFeatured: b.is_featured ?? b.isFeatured ?? false,
    metaTitle: b.meta_title || b.metaTitle,
    metaDescription: b.meta_description || b.metaDescription,
    createdAt: b.created_at || b.createdAt
  };
}

function blogToDb(b) {
  const slug = b.slug || (b.title ? b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `blog-${Date.now()}`);
  return {
    id: b.id || `blog_${Date.now()}`,
    slug: slug,
    title: b.title,
    category: b.category || 'Case Studies',
    tag: b.tag || 'General',
    date: b.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    read_time: b.readTime || b.read_time || '5 min read',
    author: b.author || 'SOFT 3D Specialist',
    author_role: b.authorRole || b.author_role || 'Additive Application Engineer',
    image: b.image || '/images/spotlight/spotlight_filament.jpg',
    summary: b.summary || '',
    content: b.content || '',
    status: b.status || 'published',
    is_featured: Boolean(b.isFeatured),
    meta_title: b.metaTitle || b.title,
    meta_description: b.metaDescription || b.summary?.slice(0, 160) || '',
    updated_at: new Date().toISOString()
  };
}

function orderFromDb(o) {
  if (!o) return null;
  return {
    ...o,
    id: o.id,
    userId: o.user_id || o.userId,
    customerEmail: o.customer_email || o.customerEmail,
    customerName: o.customer_name || o.customerName,
    customerPhone: o.customer_phone || o.customerPhone,
    company: o.company,
    shippingAddress: o.shipping_address || o.shippingAddress || {},
    billingAddress: o.billing_address || o.billingAddress || {},
    items: Array.isArray(o.items) ? o.items : [],
    subtotal: Number(o.subtotal) || 0,
    discountAmount: Number(o.discount_amount || o.discountAmount) || 0,
    couponCode: o.coupon_code || o.couponCode,
    shippingFee: Number(o.shipping_fee || o.shippingFee) || 0,
    taxAmount: Number(o.tax_amount || o.taxAmount) || 0,
    total: Number(o.total) || 0,
    currency: o.currency || '£',
    status: o.status || 'Pending',
    paymentMethod: o.payment_method || o.paymentMethod || 'card',
    paymentStatus: o.payment_status || o.paymentStatus || 'Pending',
    notes: o.notes,
    createdAt: o.created_at || o.createdAt || new Date().toISOString(),
    updatedAt: o.updated_at || o.updatedAt
  };
}

function addressFromDb(a) {
  if (!a) return null;
  return {
    ...a,
    id: a.id,
    userId: a.user_id,
    addressLine1: a.address_line1,
    addressLine2: a.address_line2 || '',
    city: a.city,
    postcode: a.postcode,
    country: a.country || 'United Kingdom',
    firstName: a.first_name || '',
    lastName: a.last_name || '',
    company: a.company || '',
    phone: a.phone || '',
    isDefault: Boolean(a.is_default)
  };
}

function couponFromDb(c) {
  if (!c) return null;
  return {
    ...c,
    id: c.id,
    code: c.code,
    discountType: c.discount_type || c.discountType,
    discountValue: Number(c.discount_value != null ? c.discount_value : c.discountValue) || 0,
    minOrderAmount: Number(c.min_order_amount != null ? c.min_order_amount : c.minOrderAmount) || 0,
    maxUses: c.max_uses,
    usesCount: c.uses_count || 0,
    validFrom: c.valid_from,
    validUntil: c.valid_until,
    isActive: c.is_active ?? c.isActive ?? true
  };
}

function profileFromDb(p) {
  if (!p) return null;
  return {
    ...p,
    id: p.id,
    email: p.email,
    firstName: p.first_name || '',
    lastName: p.last_name || '',
    name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email,
    company: p.company || '',
    phone: p.phone || '',
    role: p.role || 'customer',
    isActive: p.is_active ?? true,
    createdAt: p.created_at
  };
}


// In-flight mutex to prevent duplicate/concurrent registration requests
let isRegisteringCustomer = false;

// -----------------------------------------------------------------------------
// EXPORTED UNIFIED API
// -----------------------------------------------------------------------------
export const api = {
  // ---------------------------------------------------------------------------
  // Customer Auth
  // ---------------------------------------------------------------------------
  customerAuth: {
    login: async ({ email, password }) => {
      const cleanEmail = (email || '').toLowerCase().trim();
      const derived = extractNameFromEmail(cleanEmail);

      const getFallbackCustomer = () => {
        const allCustomers = getLocalStore(LOCAL_STORAGE_CUSTOMERS_KEY, []);
        let matchedCustomer = allCustomers.find(c => c.email.toLowerCase() === cleanEmail);

        if (!matchedCustomer) {
          matchedCustomer = {
            id: 'cust_' + Date.now(),
            email: cleanEmail,
            firstName: derived.firstName,
            lastName: derived.lastName,
            name: derived.name,
            company: '',
            phone: '',
            role: 'customer',
            createdAt: new Date().toISOString()
          };
          allCustomers.unshift(matchedCustomer);
          setLocalStore(LOCAL_STORAGE_CUSTOMERS_KEY, allCustomers);
        }

        // Sanitize if customer has the old hardcoded mock name 'Alexander Mercer'
        if (matchedCustomer.firstName === 'Alexander' && matchedCustomer.lastName === 'Mercer' && !cleanEmail.includes('mercer')) {
          matchedCustomer.firstName = derived.firstName;
          matchedCustomer.lastName = derived.lastName;
          matchedCustomer.name = derived.name;
          if (matchedCustomer.company === 'Mercer Aerospace & Precision Ltd') matchedCustomer.company = '';
        }

        const token = 'cust_token_' + Date.now();
        setCustomerToken(token);
        setLocalStore(LOCAL_STORAGE_CURRENT_CUSTOMER_KEY, matchedCustomer);

        const userAddresses = getLocalStore(LOCAL_STORAGE_ADDRESSES_KEY, []).filter(a => a.user_id === matchedCustomer.id);
        return { token, user: matchedCustomer, addresses: userAddresses };
      };

      if (!isSupabaseConfigured) {
        return getFallbackCustomer();
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data?.session) {
          return getFallbackCustomer();
        }

        const user = data.user;
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        const { data: addresses } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false });

        setCustomerToken(data.session.access_token);
        const customerObj = profile ? profileFromDb(profile) : {
          id: user.id,
          email: user.email,
          firstName: derived.firstName,
          lastName: derived.lastName,
          name: derived.name,
          role: 'customer'
        };
        setLocalStore(LOCAL_STORAGE_CURRENT_CUSTOMER_KEY, customerObj);
        return {
          token: data.session.access_token,
          user: customerObj,
          addresses: (addresses || []).map(addressFromDb)
        };
      } catch (err) {
        return getFallbackCustomer();
      }
    },

    register: async (formData) => {
      // 1. In-flight request lock: physical defense against double-clicks and repeated submissions
      if (isRegisteringCustomer) {
        const busyErr = new Error('A registration is already in progress. Please wait a moment.');
        busyErr.code = 'REQUEST_IN_FLIGHT';
        throw busyErr;
      }
      isRegisteringCustomer = true;

      try {
        const email = (formData.email || '').toLowerCase().trim();
        const password = formData.password;
        const firstName = formData.firstName || formData.name?.split(' ')[0] || extractNameFromEmail(email).firstName;
        const lastName = formData.lastName || formData.name?.split(' ').slice(1).join(' ') || '';

        if (!isSupabaseConfigured) {
          const newCustomer = {
            id: 'cust_' + Date.now(),
            email: email,
            firstName: firstName,
            lastName: lastName,
            name: `${firstName} ${lastName}`.trim() || firstName,
            company: formData.company || '',
            phone: formData.phone || '',
            address: formData.address || '',
            city: formData.city || '',
            postcode: formData.postcode || '',
            role: 'customer',
            createdAt: new Date().toISOString()
          };

          const token = 'cust_token_' + Date.now();
          setCustomerToken(token);
          setLocalStore(LOCAL_STORAGE_CURRENT_CUSTOMER_KEY, newCustomer);

          const allCustomers = getLocalStore(LOCAL_STORAGE_CUSTOMERS_KEY, []);
          const idx = allCustomers.findIndex(c => c.email.toLowerCase() === email);
          if (idx !== -1) {
            allCustomers[idx] = { ...allCustomers[idx], ...newCustomer };
          } else {
            allCustomers.unshift(newCustomer);
          }
          setLocalStore(LOCAL_STORAGE_CUSTOMERS_KEY, allCustomers);

          return { token, user: newCustomer, confirmationRequired: false };
        }

        // 2. Single call to Supabase signUp - zero automatic retries
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              role: 'customer'
            }
          }
        });

        // 3. Classify and handle Supabase errors gracefully
        if (error) {
          const errMsg = String(error.message || '');
          const isRateLimit = 
            error.status === 429 ||
            error.code === 'over_email_send_rate_limit' ||
            errMsg.toLowerCase().includes('rate limit');

          if (isRateLimit) {
            const rErr = new Error('Registration email limit reached. Supabase has temporarily limited verification emails for security. Please wait a few minutes before trying again, or sign in if you already have an account.');
            rErr.code = 'RATE_LIMIT_EXCEEDED';
            rErr.status = 429;
            throw rErr;
          }

          if (errMsg.toLowerCase().includes('already registered') || errMsg.toLowerCase().includes('already exists')) {
            const existErr = new Error('An account with this email address already exists. Please sign in or reset your password.');
            existErr.code = 'USER_ALREADY_EXISTS';
            throw existErr;
          }

          throw new Error(errMsg || 'Failed to create account.');
        }

        // 4. Detect existing user case:
        // Supabase returns a user object with an empty identities array when the email is already registered!
        if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          const existErr = new Error('An account with this email address already exists. Please sign in with your password.');
          existErr.code = 'USER_ALREADY_EXISTS';
          throw existErr;
        }

        const userId = data?.user?.id;
        const userToken = data?.session?.access_token || null;
        // If Supabase has email confirmations enabled, data.session is null and confirmation email was sent
        const confirmationRequired = !userToken && Boolean(data?.user);

        if (userToken) {
          setCustomerToken(userToken);
        }

        // Upsert profile in Supabase so new client immediately appears in Admin Dashboard -> Registered Clients
        if (userId) {
          try {
            await supabase.from('profiles').upsert({
              id: userId,
              email,
              first_name: firstName,
              last_name: lastName,
              name: `${firstName} ${lastName}`.trim() || firstName,
              role: 'customer',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          } catch (e) {
            console.warn('Profile upsert on register:', e);
          }
        }

        const customerObj = {
          id: userId || ('cust_' + Date.now()),
          email: email,
          firstName: firstName,
          lastName: lastName,
          name: `${firstName} ${lastName}`.trim() || email,
          company: '',
          phone: '',
          role: 'customer',
          isActive: true,
          createdAt: new Date().toISOString()
        };

        // Always save to local customers cache so Admin Dashboard Registered Clients shows them immediately
        const allCustomers = getLocalStore(LOCAL_STORAGE_CUSTOMERS_KEY, []);
        const idx = allCustomers.findIndex(c => c.email.toLowerCase() === email);
        if (idx !== -1) {
          allCustomers[idx] = { ...allCustomers[idx], ...customerObj };
        } else {
          allCustomers.unshift(customerObj);
        }
        setLocalStore(LOCAL_STORAGE_CUSTOMERS_KEY, allCustomers);

        // Only set as active current customer if session was established
        if (userToken) {
          setLocalStore(LOCAL_STORAGE_CURRENT_CUSTOMER_KEY, customerObj);
        }

        // Clean fresh start for new customer: Empty cart and empty wishlist
        setLocalStore(LOCAL_STORAGE_CART_KEY, []);
        setLocalStore(LOCAL_STORAGE_WISHLIST_KEY, []);

        return {
          token: userToken,
          user: customerObj,
          confirmationRequired
        };
      } finally {
        isRegisteringCustomer = false;
      }
    },

    logout: async () => {
      setCustomerToken(null);
      setLocalStore(LOCAL_STORAGE_CURRENT_CUSTOMER_KEY, null);
      setLocalStore(LOCAL_STORAGE_CART_KEY, []);
      setLocalStore(LOCAL_STORAGE_WISHLIST_KEY, []);
      if (isSupabaseConfigured) {
        try {
          await supabase.auth.signOut();
        } catch (e) {}
      }
    },

    getProfile: async () => {
      let currentCust = getLocalStore(LOCAL_STORAGE_CURRENT_CUSTOMER_KEY, null);

      if (isSupabaseConfigured) {
        try {
          const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
          if (!sessionErr && session?.user) {
            const user = session.user;
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
            const { data: addresses } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false });

            const derived = extractNameFromEmail(user.email);
            const userObj = profile ? profileFromDb(profile) : {
              id: user.id,
              email: user.email,
              firstName: derived.firstName,
              lastName: derived.lastName,
              name: derived.name,
              role: 'customer'
            };
            return {
              user: userObj,
              addresses: (addresses || []).map(addressFromDb)
            };
          }
        } catch (err) {}
      }

      if (currentCust) {
        if (currentCust.firstName === 'Alexander' && currentCust.lastName === 'Mercer' && currentCust.email && !currentCust.email.includes('mercer')) {
          const derived = extractNameFromEmail(currentCust.email);
          currentCust.firstName = derived.firstName;
          currentCust.lastName = derived.lastName;
          currentCust.name = derived.name;
          if (currentCust.company === 'Mercer Aerospace & Precision Ltd') currentCust.company = '';
          setLocalStore(LOCAL_STORAGE_CURRENT_CUSTOMER_KEY, currentCust);
        }
        const userAddresses = getLocalStore(LOCAL_STORAGE_ADDRESSES_KEY, []).filter(a => a.user_id === currentCust.id);
        return { user: currentCust, addresses: userAddresses };
      }

      throw new Error('No active customer session');
    },

    updateProfile: async (data) => {
      if (!isSupabaseConfigured) {
        let currentCust = getLocalStore(LOCAL_STORAGE_CURRENT_CUSTOMER_KEY, {});
        const updatedUser = {
          ...currentCust,
          firstName: data.firstName !== undefined ? data.firstName : currentCust.firstName,
          lastName: data.lastName !== undefined ? data.lastName : currentCust.lastName,
          name: `${data.firstName || currentCust.firstName || ''} ${data.lastName || currentCust.lastName || ''}`.trim(),
          company: data.company !== undefined ? data.company : currentCust.company,
          phone: data.phone !== undefined ? data.phone : currentCust.phone,
          address: data.address !== undefined ? data.address : currentCust.address,
          city: data.city !== undefined ? data.city : currentCust.city,
          postcode: data.postcode !== undefined ? data.postcode : currentCust.postcode
        };
        setLocalStore(LOCAL_STORAGE_CURRENT_CUSTOMER_KEY, updatedUser);

        const allCustomers = getLocalStore(LOCAL_STORAGE_CUSTOMERS_KEY, []);
        const idx = allCustomers.findIndex(c => c.email.toLowerCase() === (updatedUser.email || '').toLowerCase());
        if (idx !== -1) {
          allCustomers[idx] = updatedUser;
        } else if (updatedUser.email) {
          allCustomers.unshift(updatedUser);
        }
        setLocalStore(LOCAL_STORAGE_CUSTOMERS_KEY, allCustomers);

        return { success: true, user: updatedUser };
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Unauthorized');

      const updatePayload = {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        company: data.company,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('profiles').update(updatePayload).eq('id', session.user.id);
      if (error) throw new Error(error.message);
      return { success: true };
    },

    changePassword: async ({ newPassword }) => {
      if (!isSupabaseConfigured) return { success: true };

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);
      return { success: true };
    },

    forgotPassword: async (email) => {
      if (!isSupabaseConfigured) {
        return { success: true, message: 'Reset token generated (Demo Mode)', resetToken: 'DEMO-TOKEN-12345' };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#reset-password`
      });
      if (error) throw new Error(error.message);
      return { success: true, message: 'Password recovery email sent. Please check your inbox.', resetToken: 'SESSION-TOKEN' };
    },

    resetPassword: async ({ token, newPassword }) => {
      if (!isSupabaseConfigured) return { success: true };

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);
      return { success: true };
    },

    getAddresses: async () => {
      if (!isSupabaseConfigured) {
        const currentCust = getLocalStore(LOCAL_STORAGE_CURRENT_CUSTOMER_KEY, null);
        if (!currentCust) return [];
        return getLocalStore(LOCAL_STORAGE_ADDRESSES_KEY, []).filter(a => a.user_id === currentCust.id);
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return [];

      const { data, error } = await supabase.from('addresses').select('*').eq('user_id', session.user.id).order('is_default', { ascending: false });
      if (error) throw new Error(error.message);
      return (data || []).map(addressFromDb);
    },

    addAddress: async (addr) => {
      if (!isSupabaseConfigured) {
        const currentCust = getLocalStore(LOCAL_STORAGE_CURRENT_CUSTOMER_KEY, { id: 'cust_local' });
        const allAddresses = getLocalStore(LOCAL_STORAGE_ADDRESSES_KEY, []);
        if (addr.isDefault) {
          allAddresses.forEach(a => { if (a.user_id === currentCust.id) a.isDefault = false; });
        }
        const newAddr = {
          id: 'addr_' + Date.now(),
          user_id: currentCust.id,
          addressLine1: addr.addressLine1 || addr.address_line1 || '',
          addressLine2: addr.addressLine2 || addr.address_line2 || '',
          city: addr.city || '',
          postcode: addr.postcode || '',
          country: addr.country || 'United Kingdom',
          firstName: addr.firstName || currentCust.firstName || '',
          lastName: addr.lastName || currentCust.lastName || '',
          company: addr.company || currentCust.company || '',
          phone: addr.phone || currentCust.phone || '',
          isDefault: Boolean(addr.isDefault)
        };
        allAddresses.unshift(newAddr);
        setLocalStore(LOCAL_STORAGE_ADDRESSES_KEY, allAddresses);
        return newAddr;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Unauthorized');

      if (addr.isDefault) {
        await supabase.from('addresses').update({ is_default: false }).eq('user_id', session.user.id);
      }

      const row = {
        user_id: session.user.id,
        address_line1: addr.addressLine1 || addr.address_line1,
        address_line2: addr.addressLine2 || addr.address_line2 || '',
        city: addr.city,
        postcode: addr.postcode,
        country: addr.country || 'United Kingdom',
        first_name: addr.firstName || addr.first_name || '',
        last_name: addr.lastName || addr.last_name || '',
        company: addr.company || '',
        phone: addr.phone || '',
        is_default: Boolean(addr.isDefault)
      };

      const { data, error } = await supabase.from('addresses').insert([row]).select().single();
      if (error) throw new Error(error.message);
      return addressFromDb(data);
    },

    deleteAddress: async (id) => {
      if (!isSupabaseConfigured) {
        const allAddresses = getLocalStore(LOCAL_STORAGE_ADDRESSES_KEY, []);
        const filtered = allAddresses.filter(a => a.id !== id);
        setLocalStore(LOCAL_STORAGE_ADDRESSES_KEY, filtered);
        return { success: true };
      }
      const { error } = await supabase.from('addresses').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    },

    setDefaultAddress: async (id) => {
      if (!isSupabaseConfigured) {
        const currentCust = getLocalStore(LOCAL_STORAGE_CURRENT_CUSTOMER_KEY, { id: 'cust_local' });
        const allAddresses = getLocalStore(LOCAL_STORAGE_ADDRESSES_KEY, []);
        allAddresses.forEach(a => {
          if (a.user_id === currentCust.id) {
            a.isDefault = (a.id === id);
          }
        });
        setLocalStore(LOCAL_STORAGE_ADDRESSES_KEY, allAddresses);
        return { success: true };
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Unauthorized');

      await supabase.from('addresses').update({ is_default: false }).eq('user_id', session.user.id);
      const { error } = await supabase.from('addresses').update({ is_default: true }).eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
  },

  // ---------------------------------------------------------------------------
  // Admin Auth
  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  // Administrative Authentication & Role Governance
  // ---------------------------------------------------------------------------
  adminAuth: {
    login: async ({ email, password }) => {
      const adminEmail = (email || '').toLowerCase().trim();

      if (!adminEmail || !password) {
        throw new Error('Please enter both administrative email and passphrase.');
      }

      if (!isSupabaseConfigured) {
        const adminUsers = getLocalStore(LOCAL_STORAGE_ADMIN_USERS_KEY, []);
        const matching = adminUsers.find(
          u => u.email?.toLowerCase() === adminEmail && 
               ['admin', 'super_admin'].includes(u.role) && 
               u.isActive !== false
        );
        if (!matching) {
          throw new Error('Invalid administrative credentials. Access denied.');
        }
        if (matching.password && matching.password !== password) {
          throw new Error('Invalid administrative passphrase.');
        }
        const token = 'admin_local_token_' + matching.id;
        setAdminToken(token);
        setLocalStore(LOCAL_STORAGE_CURRENT_ADMIN_KEY, matching);
        return { token, admin: matching };
      }

      // Authenticate with Supabase Auth
      let authResult = await supabase.auth.signInWithPassword({ 
        email: adminEmail, 
        password 
      });

      if (authResult.error) {
        // If Supabase blocked due to unconfirmed email, auto-confirm via RPC and retry
        const errMsg = String(authResult.error.message || '').toLowerCase();
        if (authResult.error.code === 'email_not_confirmed' || errMsg.includes('confirm')) {
          try {
            await supabase.rpc('confirm_admin_by_email', { p_email: adminEmail });
            authResult = await supabase.auth.signInWithPassword({ 
              email: adminEmail, 
              password 
            });
          } catch (e) {
            console.warn('Auto confirm retry failed:', e);
          }
        }
      }

      if (authResult.error) {
        throw new Error(authResult.error.message || 'Invalid administrative email or passphrase.');
      }
      if (!authResult.data?.session || !authResult.data?.user) {
        throw new Error('Invalid administrative email or passphrase.');
      }

      const user = authResult.data.user;
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // STRICT VALIDATION: Profile MUST exist, MUST have role 'admin' or 'super_admin', and MUST be active!
      if (profErr || !profile || !['admin', 'super_admin'].includes(profile.role) || profile.is_active === false) {
        await supabase.auth.signOut();
        setAdminToken(null);
        setLocalStore(LOCAL_STORAGE_CURRENT_ADMIN_KEY, null);
        throw new Error('Access denied: This account is not an authorized administrator or has been removed.');
      }

      setAdminToken(authResult.data.session.access_token);
      const mapped = profileFromDb(profile);
      setLocalStore(LOCAL_STORAGE_CURRENT_ADMIN_KEY, mapped);
      return {
        token: authResult.data.session.access_token,
        admin: mapped
      };
    },

    getProfile: async () => {
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (!error && profile && ['admin', 'super_admin'].includes(profile.role) && profile.is_active !== false) {
              const mapped = profileFromDb(profile);
              setLocalStore(LOCAL_STORAGE_CURRENT_ADMIN_KEY, mapped);
              return { admin: mapped };
            }
          }
          // If session invalid, user deleted, or role revoked -> clear all tokens
          setAdminToken(null);
          setLocalStore(LOCAL_STORAGE_CURRENT_ADMIN_KEY, null);
          return { admin: null };
        } catch (err) {
          setAdminToken(null);
          setLocalStore(LOCAL_STORAGE_CURRENT_ADMIN_KEY, null);
          return { admin: null };
        }
      }

      const currentAdmin = getLocalStore(LOCAL_STORAGE_CURRENT_ADMIN_KEY, null);
      if (currentAdmin && ['admin', 'super_admin'].includes(currentAdmin.role) && currentAdmin.isActive !== false) {
        return { admin: currentAdmin };
      }
      return { admin: null };
    },

    getUsers: async () => {
      if (!isSupabaseConfigured) {
        const users = getLocalStore(LOCAL_STORAGE_ADMIN_USERS_KEY, []);
        return { users: users.filter(u => ['admin', 'super_admin'].includes(u.role) && u.isActive !== false) };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'super_admin'])
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return { users: (data || []).map(profileFromDb) };
    },

    createUser: async (userData) => {
      const email = userData.email?.toLowerCase().trim();
      const password = userData.password;
      const firstName = userData.firstName?.trim() || 'Admin';
      const lastName = userData.lastName?.trim() || '';

      if (!email || !password) {
        throw new Error('Staff email and passphrase are required.');
      }

      if (!isSupabaseConfigured) {
        const newUser = {
          id: 'admin_' + Date.now(),
          email,
          firstName,
          lastName,
          name: `${firstName} ${lastName}`.trim(),
          role: 'admin',
          isActive: true,
          password: password,
          createdAt: new Date().toISOString()
        };
        const users = getLocalStore(LOCAL_STORAGE_ADMIN_USERS_KEY, []);
        users.unshift(newUser);
        setLocalStore(LOCAL_STORAGE_ADMIN_USERS_KEY, users);
        return { success: true, user: newUser };
      }

      // Attempt 1: Call security definer RPC create_admin_user
      try {
        const { data: rpcData, error: rpcErr } = await supabase.rpc('create_admin_user', {
          p_email: email,
          p_password: password,
          p_first_name: firstName,
          p_last_name: lastName
        });
        if (!rpcErr && rpcData?.success) {
          return { success: true, user: rpcData };
        }
      } catch (e) {
        console.warn('create_admin_user RPC failed, using client signup fallback:', e);
      }

      // Attempt 2: Use client signUp fallback
      const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      });

      const { data, error } = await tempClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: 'admin'
          }
        }
      });
      if (error) throw new Error(error.message);

      if (data.user?.id) {
        const { error: profErr } = await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          role: 'admin',
          is_active: true,
          updated_at: new Date().toISOString()
        });
        if (profErr) throw new Error(profErr.message);

        // Ensure newly created admin is confirmed
        try {
          await supabase.rpc('confirm_admin_by_email', { p_email: email });
        } catch (e) {}
      }

      return { success: true, user: data.user };
    },

    updateUser: async (id, userData) => {
      if (!isSupabaseConfigured) {
        const users = getLocalStore(LOCAL_STORAGE_ADMIN_USERS_KEY, []);
        const idx = users.findIndex(u => u.id === id);
        if (idx !== -1) {
          users[idx] = { 
            ...users[idx], 
            ...userData, 
            name: `${userData.firstName || users[idx].firstName} ${userData.lastName || users[idx].lastName}`.trim(),
            role: 'admin' 
          };
          if (userData.password) users[idx].password = userData.password;
          setLocalStore(LOCAL_STORAGE_ADMIN_USERS_KEY, users);
          return { success: true, user: users[idx] };
        }
        return { success: true };
      }

      // Attempt 1: Call update_admin_user RPC (updates profile and optionally auth password)
      try {
        const { data: rpcData, error: rpcErr } = await supabase.rpc('update_admin_user', {
          p_target_id: id,
          p_first_name: userData.firstName || '',
          p_last_name: userData.lastName || '',
          p_password: userData.password || null
        });
        if (!rpcErr && rpcData?.success) {
          const { data: updatedProf } = await supabase.from('profiles').select('*').eq('id', id).single();
          return { success: true, user: updatedProf ? profileFromDb(updatedProf) : { id } };
        }
      } catch (e) {
        console.warn('update_admin_user RPC fallback:', e);
      }

      // Fallback: update profile table directly
      const payload = { role: 'admin', updated_at: new Date().toISOString() };
      if (userData.firstName !== undefined) payload.first_name = userData.firstName;
      if (userData.lastName !== undefined) payload.last_name = userData.lastName;
      if (userData.isActive !== undefined) payload.is_active = userData.isActive;

      const { data, error } = await supabase.from('profiles').update(payload).eq('id', id).select().single();
      if (error) throw new Error(error.message);

      // If user is editing their own password and RPC was not available, call auth.updateUser
      if (userData.password) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id === id) {
            await supabase.auth.updateUser({ password: userData.password });
          }
        } catch (e) {
          console.warn('Could not update password on auth directly:', e);
        }
      }

      return { success: true, user: profileFromDb(data) };
    },

    deleteUser: async (id) => {
      if (!isSupabaseConfigured) {
        const users = getLocalStore(LOCAL_STORAGE_ADMIN_USERS_KEY, []);
        const filtered = users.filter(u => u.id !== id);
        setLocalStore(LOCAL_STORAGE_ADMIN_USERS_KEY, filtered);
        return { success: true };
      }

      // Attempt 1: Call security definer RPC delete_admin_user to completely remove from auth.users + profiles
      try {
        const { data: rpcData, error: rpcErr } = await supabase.rpc('delete_admin_user', {
          p_target_id: id
        });
        if (!rpcErr && rpcData?.success) {
          return { success: true };
        }
      } catch (e) {
        console.warn('delete_admin_user RPC failed, using profiles delete fallback:', e);
      }

      // Attempt 2: Delete from public.profiles so RLS and adminAuth.login will block access immediately
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
  },

  // ---------------------------------------------------------------------------
  // Products Management
  // ---------------------------------------------------------------------------
  products: {
    list: async (params = {}) => {
      const stockMap = getLocalStore(LOCAL_STORAGE_PRODUCTS_STOCK_KEY, {});
      const mapLocalProduct = (p) => {
        const rawStock = stockMap[p.id] !== undefined ? stockMap[p.id] : (p.stockQuantity ?? 10);
        const stockQty = Math.max(0, Number(rawStock) || 0);
        const inStock = stockQty > 0;
        return {
          ...p,
          stockQuantity: stockQty,
          inStock: inStock,
          availability: inStock 
            ? (p.availability && !p.availability.toLowerCase().includes('out of stock') ? p.availability : 'In Stock UK - Dispatched within 24h') 
            : 'Out of Stock'
        };
      };

      if (!isSupabaseConfigured) {
        let list = localProducts.map(mapLocalProduct);
        if (params.category && params.category !== 'all') {
          list = list.filter(p => p.categoryId === params.category || p.category === params.category);
        }
        if (params.brand) {
          list = list.filter(p => p.brand.toLowerCase() === params.brand.toLowerCase());
        }
        if (params.search) {
          const q = params.search.toLowerCase();
          list = list.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
        }
        if (params.featured) {
          list = list.filter(p => p.isFeatured || p.is_featured || (p.badge && String(p.badge).toLowerCase().includes('featured')));
        }
        return { products: list, total: list.length };
      }

      let query = supabase.from('products').select('*');

      if (params.category && params.category !== 'all') {
        query = query.eq('category_id', params.category);
      }
      if (params.brand) {
        query = query.ilike('brand', params.brand);
      }
      if (params.search) {
        query = query.ilike('name', `%${params.search}%`);
      }
      if (params.featured) {
        query = query.eq('is_featured', true);
      }
      if (params.limit) {
        query = query.limit(Number(params.limit));
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) {
        console.warn('Supabase product query failed, using local fallback:', error.message);
        return { products: localProducts, total: localProducts.length };
      }

      const products = (data || []).map(productFromDb);
      return { products, total: products.length };
    },

    adminList: async () => {
      if (!isSupabaseConfigured) {
        const mapped = localProducts.map(p => productFromDb(p));
        return { products: mapped, total: mapped.length };
      }
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return { products: (data || []).map(productFromDb), total: (data || []).length };
    },

    get: async (idOrSlug) => {
      if (!isSupabaseConfigured) {
        const found = localProducts.find(p => p.id === idOrSlug || p.slug === idOrSlug);
        if (!found) throw new Error('Product not found');
        return productFromDb(found);
      }

      const isUuidOrId = idOrSlug.startsWith('prod_') || idOrSlug.includes('-');
      let query = supabase.from('products').select('*');
      
      const { data, error } = await query.or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`).maybeSingle();
      if (error || !data) {
        const fallback = localProducts.find(p => p.id === idOrSlug || p.slug === idOrSlug);
        if (fallback) return productFromDb(fallback);
        throw new Error('Product not found');
      }

      return productFromDb(data);
    },

    create: async (productData) => {
      if (!isSupabaseConfigured) {
        const newProd = {
          ...productData,
          id: productData.id || `prod_${Date.now()}`
        };
        localProducts.unshift(newProd);
        return productFromDb(newProd);
      }

      const row = productToDb(productData);
      const { data, error } = await supabase.from('products').insert([row]).select().single();
      if (error) throw new Error(error.message);
      return productFromDb(data);
    },

    update: async (id, productData) => {
      if (!isSupabaseConfigured) {
        const idx = localProducts.findIndex(p => p.id === id);
        if (idx !== -1) {
          localProducts[idx] = { ...localProducts[idx], ...productData };
          return productFromDb(localProducts[idx]);
        }
        return productData;
      }

      const row = productToDb(productData);
      delete row.id; // Avoid mutating primary key
      const { data, error } = await supabase.from('products').update(row).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return productFromDb(data);
    },

    delete: async (id) => {
      if (!isSupabaseConfigured) {
        const idx = localProducts.findIndex(p => p.id === id);
        if (idx !== -1) localProducts.splice(idx, 1);
        return { success: true };
      }
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    },

    toggleStock: async (id, inStock) => {
      if (!isSupabaseConfigured) {
        const stockMap = getLocalStore(LOCAL_STORAGE_PRODUCTS_STOCK_KEY, {});
        stockMap[id] = inStock ? 10 : 0;
        setLocalStore(LOCAL_STORAGE_PRODUCTS_STOCK_KEY, stockMap);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('forge3d_products_updated', { detail: { productId: id, stock: stockMap[id] } }));
        }
        return { success: true };
      }
      const payload = {
        in_stock: Boolean(inStock),
        updated_at: new Date().toISOString()
      };
      // When enabling stock, ensure stock_quantity is at least 10 if previously 0 or null
      if (inStock) {
        const { data: curr } = await supabase.from('products').select('stock_quantity').eq('id', id).maybeSingle();
        if (!curr || !curr.stock_quantity || curr.stock_quantity <= 0) {
          payload.stock_quantity = 10;
        }
      }
      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return productFromDb(data);
    },

    // Supabase Storage upload for equipment images
    uploadImage: async (file) => {
      if (!isSupabaseConfigured) {
        return { url: URL.createObjectURL(file), path: file.name };
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `equipment/${fileName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw new Error(error.message);

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return { url: publicUrl, path: filePath };
    },

    uploadImages: async (formData) => {
      const file = formData.get('image') || formData.get('file');
      if (!file) throw new Error('No file provided');
      return api.products.uploadImage(file);
    }
  },

  // ---------------------------------------------------------------------------
  // Categories & Brands
  // ---------------------------------------------------------------------------
  categories: {
    list: async () => {
      if (!isSupabaseConfigured) {
        return getLocalStore(LOCAL_STORAGE_CATEGORIES_KEY, localCategories);
      }
      const { data, error } = await supabase.from('categories').select('*').order('display_order', { ascending: true });
      if (error || !data?.length) return localCategories;
      return data.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        badge: c.badge,
        image: c.image,
        popularBrands: c.popular_brands || []
      }));
    },

    adminList: async () => {
      if (!isSupabaseConfigured) {
        const cats = getLocalStore(LOCAL_STORAGE_CATEGORIES_KEY, localCategories);
        return { categories: cats };
      }
      const { data, error } = await supabase.from('categories').select('*').order('display_order', { ascending: true });
      if (error) throw new Error(error.message);
      const mapped = (data || []).map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        badge: c.badge,
        image: c.image,
        popularBrands: c.popular_brands || []
      }));
      return { categories: mapped };
    },

    create: async (cat) => {
      if (!isSupabaseConfigured) {
        const cats = getLocalStore(LOCAL_STORAGE_CATEGORIES_KEY, [...localCategories]);
        const row = {
          id: cat.id || cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: cat.name,
          slug: cat.slug || cat.id || cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          description: cat.description || '',
          badge: cat.badge || null,
          image: cat.image || null,
          popularBrands: Array.isArray(cat.popularBrands) ? cat.popularBrands : []
        };
        cats.push(row);
        setLocalStore(LOCAL_STORAGE_CATEGORIES_KEY, cats);
        return row;
      }
      const row = {
        id: cat.id || cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: cat.name,
        slug: cat.slug || cat.id || cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        description: cat.description || '',
        badge: cat.badge || null,
        image: cat.image || null,
        popular_brands: Array.isArray(cat.popularBrands) ? cat.popularBrands : []
      };
      const { data, error } = await supabase.from('categories').insert([row]).select().single();
      if (error) throw new Error(error.message);
      return data;
    },

    update: async (id, cat) => {
      if (!isSupabaseConfigured) {
        const cats = getLocalStore(LOCAL_STORAGE_CATEGORIES_KEY, [...localCategories]);
        const idx = cats.findIndex(c => c.id === id);
        if (idx !== -1) {
          cats[idx] = { ...cats[idx], ...cat };
          setLocalStore(LOCAL_STORAGE_CATEGORIES_KEY, cats);
          return cats[idx];
        }
        return { id, ...cat };
      }
      const updatePayload = {
        name: cat.name,
        description: cat.description,
        badge: cat.badge || null,
        image: cat.image || null
      };
      if (cat.popularBrands) updatePayload.popular_brands = cat.popularBrands;
      const { data, error } = await supabase.from('categories').update(updatePayload).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return data;
    },

    delete: async (id) => {
      if (!isSupabaseConfigured) {
        let cats = getLocalStore(LOCAL_STORAGE_CATEGORIES_KEY, [...localCategories]);
        cats = cats.filter(c => c.id !== id);
        setLocalStore(LOCAL_STORAGE_CATEGORIES_KEY, cats);
        return { success: true };
      }
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    },

    uploadImage: async (file) => {
      if (!isSupabaseConfigured) {
        return { url: URL.createObjectURL(file), path: file.name };
      }
      const fileExt = file.name.split('.').pop();
      const fileName = `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `categories/${fileName}`;
      const { error } = await supabase.storage.from('product-images').upload(filePath, file);
      if (error) throw new Error(error.message);
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);
      return { url: publicUrl, path: filePath };
    }
  },

  brands: {
    list: async () => {
      if (!isSupabaseConfigured) {
        return getLocalStore(LOCAL_STORAGE_BRANDS_KEY, localBrands);
      }
      const { data, error } = await supabase.from('brands').select('*').order('name', { ascending: true });
      if (error) {
        console.warn('Error fetching brands from Supabase:', error.message);
        return localBrands;
      }
      return (data || []).map(b => ({
        id: b.id,
        name: b.name,
        category: b.category,
        origin: b.origin,
        status: b.status,
        tagline: b.tagline,
        logoText: b.logo_text,
        badgeColor: b.badge_color,
        description: b.description,
        features: b.features || [],
        website: b.website,
        logoImage: b.logo_image
      }));
    },

    adminList: async () => {
      if (!isSupabaseConfigured) {
        const brands = getLocalStore(LOCAL_STORAGE_BRANDS_KEY, localBrands);
        return { brands };
      }
      const { data, error } = await supabase.from('brands').select('*').order('name', { ascending: true });
      if (error) throw new Error(error.message);
      const mapped = (data || []).map(b => ({
        id: b.id,
        name: b.name,
        category: b.category,
        origin: b.origin,
        status: b.status,
        tagline: b.tagline,
        logoText: b.logo_text,
        badgeColor: b.badge_color,
        description: b.description,
        features: b.features || [],
        website: b.website,
        logoImage: b.logo_image
      }));
      return { brands: mapped };
    },

    create: async (brand) => {
      if (!isSupabaseConfigured) {
        const brands = getLocalStore(LOCAL_STORAGE_BRANDS_KEY, [...localBrands]);
        const row = {
          id: brand.id || brand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `brand-${Date.now()}`,
          name: brand.name,
          category: brand.category || 'Industrial 3D Printers',
          origin: brand.origin || 'International',
          status: brand.status || 'Active Partner',
          tagline: brand.tagline || '',
          logoText: brand.logoText || brand.name,
          badgeColor: brand.badgeColor || 'border-brand-500 text-brand-600',
          description: brand.description || '',
          features: Array.isArray(brand.features) ? brand.features : [],
          logoImage: brand.logoImage || null,
          website: brand.website || null
        };
        brands.push(row);
        setLocalStore(LOCAL_STORAGE_BRANDS_KEY, brands);
        return row;
      }
      const row = {
        id: brand.id || brand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `brand-${Date.now()}`,
        name: brand.name,
        category: brand.category || 'Industrial 3D Printers',
        origin: brand.origin || 'International',
        status: brand.status || 'Active Partner',
        tagline: brand.tagline || '',
        logo_text: brand.logoText || brand.name,
        badge_color: brand.badgeColor || 'border-brand-500 text-brand-600',
        description: brand.description || '',
        features: Array.isArray(brand.features) ? brand.features : [],
        logo_image: brand.logoImage || null,
        website: brand.website || null
      };
      const { data, error } = await supabase.from('brands').insert([row]).select().single();
      if (error) throw new Error(error.message);
      return data;
    },

    update: async (id, brand) => {
      if (!isSupabaseConfigured) {
        const brands = getLocalStore(LOCAL_STORAGE_BRANDS_KEY, [...localBrands]);
        const idx = brands.findIndex(b => b.id === id);
        if (idx !== -1) {
          brands[idx] = { ...brands[idx], ...brand };
          setLocalStore(LOCAL_STORAGE_BRANDS_KEY, brands);
          return brands[idx];
        }
        return { id, ...brand };
      }
      const updateData = {
        name: brand.name,
        origin: brand.origin,
        status: brand.status,
        tagline: brand.tagline,
        description: brand.description
      };
      if (brand.category) updateData.category = brand.category;
      if (brand.logoText) updateData.logo_text = brand.logoText;
      if (brand.logoImage !== undefined) updateData.logo_image = brand.logoImage;
      if (brand.website !== undefined) updateData.website = brand.website;
      if (brand.badgeColor !== undefined) updateData.badge_color = brand.badgeColor;

      const { data, error } = await supabase.from('brands').update(updateData).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return data;
    },

    delete: async (id) => {
      if (!isSupabaseConfigured) {
        let brands = getLocalStore(LOCAL_STORAGE_BRANDS_KEY, [...localBrands]);
        brands = brands.filter(b => b.id !== id);
        setLocalStore(LOCAL_STORAGE_BRANDS_KEY, brands);
        return { success: true };
      }
      const { error } = await supabase.from('brands').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    },

    adminCreate: async (brand) => api.brands.create(brand),
    adminUpdate: async (id, brand) => api.brands.update(id, brand),
    adminDelete: async (id) => api.brands.delete(id),

    uploadLogo: async (file) => {
      if (!isSupabaseConfigured) {
        return { url: URL.createObjectURL(file), path: file.name };
      }
      const fileExt = file.name.split('.').pop();
      const fileName = `brand-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `logos/${fileName}`;
      const { error } = await supabase.storage.from('brand-logos').upload(filePath, file);
      if (error) throw new Error(error.message);
      const { data: { publicUrl } } = supabase.storage.from('brand-logos').getPublicUrl(filePath);
      return { url: publicUrl, path: filePath };
    }
  },

  // ---------------------------------------------------------------------------
  // Cart & Wishlist (Authenticated Persistent Sync)
  // ---------------------------------------------------------------------------
  cart: {
    get: async () => {
      if (!isSupabaseConfigured) return getLocalStore(LOCAL_STORAGE_CART_KEY, []);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return getLocalStore(LOCAL_STORAGE_CART_KEY, []);

      const { data, error } = await supabase
        .from('cart_items')
        .select('*, product:products(*)')
        .eq('user_id', session.user.id);

      if (error) return [];
      return (data || []).map(row => ({
        ...productFromDb(row.product),
        quantity: row.quantity
      }));
    },

    add: async (productId, quantity = 1) => {
      if (!isSupabaseConfigured) {
        const cart = getLocalStore(LOCAL_STORAGE_CART_KEY, []);
        const idx = cart.findIndex(i => i.id === productId);
        if (idx > -1) cart[idx].quantity += quantity;
        else cart.push({ id: productId, quantity });
        setLocalStore(LOCAL_STORAGE_CART_KEY, cart);
        return { success: true };
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return { success: true };

      const { error } = await supabase
        .from('cart_items')
        .upsert(
          { user_id: session.user.id, product_id: productId, quantity },
          { onConflict: 'user_id,product_id' }
        );
      if (error) console.warn('Supabase cart add error:', error.message);
      return { success: true };
    },

    update: async (productId, quantity) => {
      if (!isSupabaseConfigured) return { success: true };
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return { success: true };

      if (quantity <= 0) {
        return api.cart.remove(productId);
      }

      await supabase
        .from('cart_items')
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq('user_id', session.user.id)
        .eq('product_id', productId);
      return { success: true };
    },

    remove: async (productId) => {
      if (!isSupabaseConfigured) return { success: true };
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return { success: true };

      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', session.user.id)
        .eq('product_id', productId);
      return { success: true };
    },

    clear: async () => {
      setLocalStore(LOCAL_STORAGE_CART_KEY, []);
      if (isSupabaseConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from('cart_items').delete().eq('user_id', session.user.id);
        }
      }
      return { success: true };
    },

    merge: async (guestItems = []) => {
      if (!isSupabaseConfigured || !guestItems.length) return api.cart.get();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return api.cart.get();

      for (const item of guestItems) {
        await supabase.from('cart_items').upsert(
          { user_id: session.user.id, product_id: item.id, quantity: item.quantity || 1 },
          { onConflict: 'user_id,product_id' }
        );
      }

      return api.cart.get();
    }
  },

  wishlist: {
    get: async () => {
      if (!isSupabaseConfigured) return getLocalStore(LOCAL_STORAGE_WISHLIST_KEY, []);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return getLocalStore(LOCAL_STORAGE_WISHLIST_KEY, []);

      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*, product:products(*)')
        .eq('user_id', session.user.id);

      if (error) return [];
      return (data || []).map(r => productFromDb(r.product));
    },

    toggle: async (productId) => {
      if (!isSupabaseConfigured) return { success: true };
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return { success: true };

      const { data: existing } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existing) {
        await supabase.from('wishlist_items').delete().eq('id', existing.id);
      } else {
        await supabase.from('wishlist_items').insert([{ user_id: session.user.id, product_id: productId }]);
      }
      return { success: true };
    },

    merge: async (guestWishlist = []) => {
      if (!isSupabaseConfigured || !guestWishlist.length) return api.wishlist.get();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return api.wishlist.get();

      for (const item of guestWishlist) {
        const pId = typeof item === 'string' ? item : item.id;
        await supabase.from('wishlist_items').upsert(
          { user_id: session.user.id, product_id: pId },
          { onConflict: 'user_id,product_id' }
        );
      }
      return api.wishlist.get();
    }
  },

  // ---------------------------------------------------------------------------
  // Orders
  // ---------------------------------------------------------------------------
  orders: {
    create: async (orderPayload) => {
      const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Calculate totals
      let calculatedSubtotal = 0;
      const orderItems = [];

      for (const item of (orderPayload.cartItems || [])) {
        let p = null;
        if (isSupabaseConfigured) {
          const { data } = await supabase.from('products').select('*').eq('id', item.id).maybeSingle();
          p = data ? productFromDb(data) : null;
        }
        if (!p) {
          p = localProducts.find(x => x.id === item.id) || { id: item.id, name: 'Industrial Hardware', price: 1000, brand: 'SOFT 3D' };
        }

        calculatedSubtotal += (p.price * item.quantity);
        orderItems.push({
          id: p.id,
          name: p.name,
          brand: p.brand,
          price: p.price,
          quantity: item.quantity,
          image: p.images?.[0] || '/images/products/f3d_pro_1000_hero.jpg',
          specs: `${p.categoryName || 'Additive Manufacturing'} • SKU: ${p.sku || p.id}`
        });
      }

      let discount = 0;
      if (orderPayload.couponCode) {
        try {
          const couponRes = await api.coupons.validate(orderPayload.couponCode, calculatedSubtotal);
          discount = couponRes.discount || 0;
        } catch {}
      }

      const shippingFee = 0; // Free industrial freight included
      const total = Math.max(0, calculatedSubtotal - discount);

      let userId = null;
      if (isSupabaseConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        userId = session?.user?.id || null;
      }

      const orderRow = {
        id: orderId,
        user_id: userId,
        customer_email: orderPayload.customerEmail,
        customer_name: orderPayload.customerName,
        customer_phone: orderPayload.customerPhone || '',
        company: orderPayload.company || '',
        shipping_address: orderPayload.shippingAddress || {},
        billing_address: orderPayload.billingAddress || {},
        items: orderItems,
        subtotal: calculatedSubtotal,
        discount_amount: discount,
        coupon_code: orderPayload.couponCode || null,
        shipping_fee: shippingFee,
        tax_amount: 0,
        total: total,
        currency: '£',
        status: 'Pending',
        payment_method: orderPayload.paymentMethod || 'card',
        payment_status: 'Paid',
        notes: orderPayload.poNumber ? `PO: ${orderPayload.poNumber}` : null,
        created_at: new Date().toISOString()
      };

      if (!isSupabaseConfigured) {
        for (const item of (orderPayload.cartItems || [])) {
          deductProductStock(item.id, item.quantity);
        }
        const existing = getLocalStore(LOCAL_STORAGE_ORDERS_KEY, []);
        existing.unshift(orderRow);
        setLocalStore(LOCAL_STORAGE_ORDERS_KEY, existing);
        return { order: orderFromDb(orderRow) };
      }

      const { data, error } = await supabase.from('orders').insert([orderRow]).select().single();
      if (error) throw new Error(error.message);

      // Deduct product stock upon order placement
      for (const item of (orderPayload.cartItems || [])) {
        deductProductStock(item.id, item.quantity);
        if (isSupabaseConfigured) {
          try {
            const { data: pData } = await supabase.from('products').select('stock_quantity').eq('id', item.id).maybeSingle();
            if (pData) {
              const curDbStock = pData.stock_quantity ?? 10;
              const newDbStock = Math.max(0, curDbStock - (item.quantity || 1));
              await supabase.from('products').update({
                stock_quantity: newDbStock,
                in_stock: newDbStock > 0,
                availability: newDbStock > 0 ? 'In Stock UK - Dispatched within 24h' : 'Out of Stock',
                updated_at: new Date().toISOString()
              }).eq('id', item.id);
            }
          } catch (stockErr) {
            console.warn('Failed to deduct database product stock:', stockErr);
          }
        }
      }

      // Clean customer cart after successful placement
      if (userId) {
        await api.cart.clear();
      }

      return { order: orderFromDb(data) };
    },

    customerList: async () => {
      if (!isSupabaseConfigured) {
        const local = getLocalStore(LOCAL_STORAGE_ORDERS_KEY, []);
        return { orders: local.map(orderFromDb) };
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return { orders: [] };

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`user_id.eq.${session.user.id},customer_email.eq.${session.user.email}`)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return { orders: (data || []).map(orderFromDb) };
    },

    get: async (id) => {
      if (!isSupabaseConfigured) {
        const local = getLocalStore(LOCAL_STORAGE_ORDERS_KEY, []);
        const found = local.find(o => o.id === id);
        if (!found) throw new Error('Order not found');
        return orderFromDb(found);
      }

      const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
      if (error) throw new Error(error.message);
      return orderFromDb(data);
    },

    adminList: async (params = {}) => {
      if (!isSupabaseConfigured) {
        let list = getLocalStore(LOCAL_STORAGE_ORDERS_KEY, []);
        if (params.status && params.status !== 'all') {
          list = list.filter(o => (o.status || '').toLowerCase() === params.status.toLowerCase());
        }
        return { orders: list.map(orderFromDb) };
      }

      let query = supabase.from('orders').select('*');
      if (params.status && params.status !== 'all') {
        query = query.eq('status', params.status);
      }
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return { orders: (data || []).map(orderFromDb) };
    },

    adminUpdateStatus: async (id, { status }) => {
      if (!isSupabaseConfigured) {
        const local = getLocalStore(LOCAL_STORAGE_ORDERS_KEY, []);
        const idx = local.findIndex(o => o.id === id);
        if (idx !== -1) {
          const prevStatus = local[idx].status;
          local[idx].status = status;
          local[idx].updated_at = new Date().toISOString();
          setLocalStore(LOCAL_STORAGE_ORDERS_KEY, local);

          // If status changed to Cancelled, replenish stock
          if (status === 'Cancelled' && prevStatus !== 'Cancelled' && Array.isArray(local[idx].items)) {
            for (const item of local[idx].items) {
              if (item.id) restoreProductStock(item.id, item.quantity || 1);
            }
          }
          return orderFromDb(local[idx]);
        }
        return { id, status };
      }

      // Check previous status and items
      const { data: prevOrder } = await supabase
        .from('orders')
        .select('status, items')
        .eq('id', id)
        .maybeSingle();

      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      // If status changed to Cancelled, replenish stock
      if (status === 'Cancelled' && prevOrder?.status !== 'Cancelled' && Array.isArray(prevOrder?.items)) {
        for (const item of prevOrder.items) {
          if (item.id) {
            restoreProductStock(item.id, item.quantity || 1);
            try {
              const { data: pData } = await supabase.from('products').select('stock_quantity').eq('id', item.id).maybeSingle();
              if (pData) {
                const newStock = (pData.stock_quantity || 0) + (item.quantity || 1);
                await supabase.from('products').update({
                  stock_quantity: newStock,
                  in_stock: newStock > 0,
                  availability: 'In Stock UK - Dispatched within 24h',
                  updated_at: new Date().toISOString()
                }).eq('id', item.id);
              }
            } catch (err) {}
          }
        }
      }

      return orderFromDb(data);
    },

    cancel: async (id, reason = 'Cancelled by customer') => {
      if (!isSupabaseConfigured) {
        const local = getLocalStore(LOCAL_STORAGE_ORDERS_KEY, []);
        const idx = local.findIndex(o => o.id === id);
        if (idx !== -1) {
          const wasAlreadyCancelled = local[idx].status === 'Cancelled';
          local[idx].status = 'Cancelled';
          local[idx].cancellation_reason = reason;
          local[idx].updated_at = new Date().toISOString();
          setLocalStore(LOCAL_STORAGE_ORDERS_KEY, local);

          // Restore product stock upon cancellation
          if (!wasAlreadyCancelled && Array.isArray(local[idx].items)) {
            for (const item of local[idx].items) {
              if (item.id) {
                restoreProductStock(item.id, item.quantity || 1);
              }
            }
          }
          return { order: orderFromDb(local[idx]) };
        }
        return { order: { id, status: 'Cancelled' } };
      }

      // Check current status before cancelling
      const { data: existing } = await supabase
        .from('orders')
        .select('id, status, notes, items')
        .eq('id', id)
        .maybeSingle();

      if (existing && (existing.status === 'Delivered' || existing.status === 'Completed')) {
        throw new Error('This order has already been fulfilled and cannot be cancelled.');
      }

      const wasAlreadyCancelled = existing?.status === 'Cancelled';
      const existingNotes = existing?.notes ? `${existing.notes} | ` : '';
      const updatePayload = {
        status: 'Cancelled',
        notes: reason ? `${existingNotes}[Cancellation Reason]: ${reason}` : (existing?.notes || null),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Restore product stock upon cancellation
      if (!wasAlreadyCancelled && Array.isArray(existing?.items)) {
        for (const item of existing.items) {
          if (item.id) {
            restoreProductStock(item.id, item.quantity || 1);
            try {
              const { data: pData } = await supabase.from('products').select('stock_quantity').eq('id', item.id).maybeSingle();
              if (pData) {
                const newStock = (pData.stock_quantity || 0) + (item.quantity || 1);
                await supabase.from('products').update({
                  stock_quantity: newStock,
                  in_stock: newStock > 0,
                  availability: 'In Stock UK - Dispatched within 24h',
                  updated_at: new Date().toISOString()
                }).eq('id', item.id);
              }
            } catch (stockErr) {
              console.warn('Failed to replenish database product stock:', stockErr);
            }
          }
        }
      }

      return { order: orderFromDb(data) };
    }
  },

  // ---------------------------------------------------------------------------
  // Customers Management
  // ---------------------------------------------------------------------------
  customers: {
    adminList: async () => {
      if (!isSupabaseConfigured) {
        const localCustomers = getLocalStore(LOCAL_STORAGE_CUSTOMERS_KEY, []);
        const localOrders = getLocalStore(LOCAL_STORAGE_ORDERS_KEY, []);
        const customersMap = {};
        localCustomers.forEach(c => {
          if (c.email) {
            customersMap[c.email] = {
              id: c.id || `cust_${c.email}`,
              email: c.email,
              firstName: c.firstName || '',
              lastName: c.lastName || '',
              name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email,
              company: c.company || '—',
              phone: c.phone || '—',
              role: 'customer',
              isActive: c.isActive !== false,
              createdAt: c.createdAt || new Date().toISOString(),
              ordersCount: 0,
              totalSpend: 0
            };
          }
        });
        localOrders.forEach(o => {
          const email = o.customer_email || o.customerEmail;
          if (email && email !== 'divyanshiasp1290@gmail.com') {
            if (!customersMap[email]) {
              customersMap[email] = {
                id: o.user_id || `order_cust_${email}`,
                email: email,
                firstName: (o.customer_name || o.customerName || '').split(' ')[0] || 'Client',
                lastName: (o.customer_name || o.customerName || '').split(' ').slice(1).join(' ') || '',
                name: o.customer_name || o.customerName || email,
                company: o.company || '—',
                phone: o.customer_phone || o.customerPhone || '—',
                role: 'customer',
                isActive: true,
                createdAt: o.created_at || o.createdAt || new Date().toISOString(),
                ordersCount: 0,
                totalSpend: 0
              };
            }
            customersMap[email].ordersCount += 1;
            customersMap[email].totalSpend += (Number(o.total) || 0);
          }
        });
        return { customers: Object.values(customersMap) };
      }
      const [profilesRes, ordersRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('user_id, customer_email, customer_name, customer_phone, company, total, created_at')
      ]);

      if (profilesRes.error) throw new Error(profilesRes.error.message);

      const profiles = profilesRes.data || [];
      const orders = ordersRes.data || [];

      const customersMap = {};

      // Filter only customer profiles, excluding admin users
      profiles
        .filter(p => p.role === 'customer' || (p.role !== 'admin' && p.role !== 'super_admin' && p.email !== 'divyanshiasp1290@gmail.com'))
        .forEach(p => {
          customersMap[p.email] = {
            ...profileFromDb(p),
            ordersCount: 0,
            totalSpend: 0
          };
        });

      // Merge customers who placed orders
      orders.forEach(o => {
        const email = o.customer_email;
        if (email && email !== 'divyanshiasp1290@gmail.com') {
          if (!customersMap[email]) {
            customersMap[email] = {
              id: o.user_id || `order_cust_${email}`,
              email: email,
              firstName: o.customer_name?.split(' ')[0] || 'Client',
              lastName: o.customer_name?.split(' ').slice(1).join(' ') || '',
              name: o.customer_name || email,
              company: o.company || '—',
              phone: o.customer_phone || '—',
              role: 'customer',
              isActive: true,
              createdAt: o.created_at || new Date().toISOString(),
              ordersCount: 0,
              totalSpend: 0
            };
          }
          customersMap[email].ordersCount += 1;
          customersMap[email].totalSpend += (Number(o.total) || 0);
        }
      });

      // Merge local registered customers cache for instant local visibility
      const localCustomers = getLocalStore(LOCAL_STORAGE_CUSTOMERS_KEY, []);
      localCustomers.forEach(c => {
        const cEmail = (c.email || '').toLowerCase().trim();
        if (cEmail && !customersMap[cEmail] && c.role !== 'admin' && c.role !== 'super_admin' && cEmail !== 'divyanshiasp1290@gmail.com') {
          customersMap[cEmail] = {
            id: c.id,
            email: cEmail,
            firstName: c.firstName || '',
            lastName: c.lastName || '',
            name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || cEmail,
            company: c.company || '—',
            phone: c.phone || '—',
            role: 'customer',
            isActive: c.isActive !== false,
            createdAt: c.createdAt || new Date().toISOString(),
            ordersCount: 0,
            totalSpend: 0
          };
        }
      });

      return { customers: Object.values(customersMap) };
    },

    adminUpdate: async (id, data) => {
      if (!isSupabaseConfigured) {
        const localCustomers = getLocalStore(LOCAL_STORAGE_CUSTOMERS_KEY, []);
        const idx = localCustomers.findIndex(c => c.id === id || c.email === id);
        if (idx !== -1) {
          localCustomers[idx] = { ...localCustomers[idx], ...data, updatedAt: new Date().toISOString() };
          setLocalStore(LOCAL_STORAGE_CUSTOMERS_KEY, localCustomers);
          return localCustomers[idx];
        }
        return { id, ...data };
      }
      const payload = { updated_at: new Date().toISOString() };
      if (data.isActive !== undefined) payload.is_active = data.isActive;
      if (data.company !== undefined) payload.company = data.company;
      if (data.phone !== undefined) payload.phone = data.phone;
      if (data.role !== undefined) payload.role = data.role;

      const { data: updated, error } = await supabase.from('profiles').update(payload).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return profileFromDb(updated);
    }
  },

  // ---------------------------------------------------------------------------
  // Blog CMS
  // ---------------------------------------------------------------------------
  blogs: {
    list: async (params = {}) => {
      if (!isSupabaseConfigured) {
        return { blogs: localBlogs.map(blogFromDb) };
      }

      let query = supabase.from('blogs').select('*').eq('status', 'published');
      if (params.category && params.category !== 'all') {
        query = query.eq('category', params.category);
      }
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error || !data?.length) {
        return { blogs: localBlogs.map(blogFromDb) };
      }
      return { blogs: data.map(blogFromDb) };
    },

    get: async (slugOrId) => {
      if (!isSupabaseConfigured) {
        const found = localBlogs.find(b => b.slug === slugOrId || b.id === slugOrId);
        if (!found) throw new Error('Article not found');
        return blogFromDb(found);
      }

      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
        .maybeSingle();

      if (error || !data) {
        const found = localBlogs.find(b => b.slug === slugOrId || b.id === slugOrId);
        if (found) return blogFromDb(found);
        throw new Error('Article not found');
      }
      return blogFromDb(data);
    },

    adminList: async () => {
      if (!isSupabaseConfigured) {
        const list = getLocalStore(LOCAL_STORAGE_BLOGS_KEY, localBlogs);
        return { blogs: list.map(blogFromDb) };
      }

      const { data, error } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return { blogs: (data || []).map(blogFromDb) };
    },

    adminCreate: async (blogData) => {
      if (!isSupabaseConfigured) {
        const list = getLocalStore(LOCAL_STORAGE_BLOGS_KEY, [...localBlogs]);
        const row = {
          id: blogData.id || 'blog_' + Date.now(),
          title: blogData.title,
          slug: blogData.slug || blogData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          category: blogData.category || 'General',
          excerpt: blogData.excerpt || '',
          content: blogData.content || '',
          coverImage: blogData.coverImage || blogData.image || null,
          authorName: blogData.authorName || 'Soft 3D Editorial',
          authorRole: blogData.authorRole || 'Industry Specialist',
          readTime: blogData.readTime || '5 min read',
          publishedAt: blogData.publishedAt || new Date().toISOString(),
          status: blogData.status || 'published',
          tags: blogData.tags || []
        };
        list.unshift(row);
        setLocalStore(LOCAL_STORAGE_BLOGS_KEY, list);
        return blogFromDb(row);
      }

      const row = blogToDb(blogData);
      const { data, error } = await supabase.from('blogs').insert([row]).select().single();
      if (error) throw new Error(error.message);
      return blogFromDb(data);
    },

    adminUpdate: async (id, blogData) => {
      if (!isSupabaseConfigured) {
        const list = getLocalStore(LOCAL_STORAGE_BLOGS_KEY, [...localBlogs]);
        const idx = list.findIndex(b => b.id === id || b.slug === id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...blogData };
          setLocalStore(LOCAL_STORAGE_BLOGS_KEY, list);
          return blogFromDb(list[idx]);
        }
        return blogFromDb({ id, ...blogData });
      }

      const row = blogToDb(blogData);
      delete row.id;
      const { data, error } = await supabase.from('blogs').update(row).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return blogFromDb(data);
    },

    adminDelete: async (id) => {
      if (!isSupabaseConfigured) {
        let list = getLocalStore(LOCAL_STORAGE_BLOGS_KEY, [...localBlogs]);
        list = list.filter(b => b.id !== id && b.slug !== id);
        setLocalStore(LOCAL_STORAGE_BLOGS_KEY, list);
        return { success: true };
      }
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
  },

  // Helper to recompute and sync product rating from approved reviews
  syncProductRating: async (productId) => {
    if (!isSupabaseConfigured || !productId) return;
    try {
      const { data: revs } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId)
        .eq('status', 'approved');

      const count = revs?.length || 0;
      const avg = count > 0 ? Number((revs.reduce((sum, r) => sum + Number(r.rating || 0), 0) / count).toFixed(1)) : null;

      await supabase
        .from('products')
        .update({ rating: avg, reviews_count: count })
        .eq('id', productId);
    } catch (err) {
      console.warn('Could not sync product rating:', err);
    }
  },

  // ---------------------------------------------------------------------------
  // Reviews
  // ---------------------------------------------------------------------------
  reviews: {
    list: async (productId) => {
      if (!isSupabaseConfigured) {
        const local = getLocalStore(LOCAL_STORAGE_REVIEWS_KEY, []);
        return local.filter(r => r.productId === productId || r.product_id === productId);
      }

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) return [];
      return data || [];
    },

    submit: async (reviewData) => {
      let userId = null;
      let userName = 'Verified Industrial Customer';
      let userCompany = 'Advanced Manufacturing';

      if (isSupabaseConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          userId = session.user.id;
          const { data: prof } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
          if (prof) {
            userName = `${prof.first_name || ''} ${prof.last_name || ''}`.trim() || prof.email;
            userCompany = prof.company || '';
          }
        }
      }

      const row = {
        product_id: reviewData.productId,
        user_id: userId,
        user_name: reviewData.userName || userName,
        user_company: reviewData.userCompany || userCompany,
        rating: Number(reviewData.rating) || 5,
        title: reviewData.title || '',
        comment: reviewData.comment || '',
        status: 'approved'
      };

      if (!isSupabaseConfigured) {
        const local = getLocalStore(LOCAL_STORAGE_REVIEWS_KEY, []);
        local.unshift({ id: `rev_${Date.now()}`, ...row });
        setLocalStore(LOCAL_STORAGE_REVIEWS_KEY, local);
        return { success: true };
      }

      const { data, error } = await supabase.from('reviews').insert([row]).select().single();
      if (error) throw new Error(error.message);
      await api.syncProductRating(reviewData.productId);
      return data;
    },

    adminList: async (params = {}) => {
      if (!isSupabaseConfigured) {
        let revs = getLocalStore(LOCAL_STORAGE_REVIEWS_KEY, []);
        if (params.status && params.status !== 'all') {
          revs = revs.filter(r => r.status === params.status);
        }
        return { reviews: revs };
      }

      let query = supabase.from('reviews').select('*, product:products(name, brand)');
      if (params.status && params.status !== 'all') {
        query = query.eq('status', params.status);
      }
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return { reviews: data || [] };
    },

    adminModerate: async (id, { status }) => {
      if (!isSupabaseConfigured) {
        const revs = getLocalStore(LOCAL_STORAGE_REVIEWS_KEY, []);
        const idx = revs.findIndex(r => r.id === id);
        if (idx !== -1) {
          revs[idx].status = status;
          setLocalStore(LOCAL_STORAGE_REVIEWS_KEY, revs);
          return revs[idx];
        }
        return { id, status };
      }

      const { data, error } = await supabase.from('reviews').update({ status }).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      if (data?.product_id) {
        await api.syncProductRating(data.product_id);
      }
      return data;
    },

    adminDelete: async (id) => {
      if (!isSupabaseConfigured) {
        let revs = getLocalStore(LOCAL_STORAGE_REVIEWS_KEY, []);
        revs = revs.filter(r => r.id !== id);
        setLocalStore(LOCAL_STORAGE_REVIEWS_KEY, revs);
        return { success: true };
      }
      const { data: rev } = await supabase.from('reviews').select('product_id').eq('id', id).maybeSingle();
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw new Error(error.message);
      if (rev?.product_id) {
        await api.syncProductRating(rev.product_id);
      }
      return { success: true };
    }
  },

  // ---------------------------------------------------------------------------
  // Customer Testimonials (Homepage & Admin Moderation)
  // ---------------------------------------------------------------------------
  testimonials: {
    list: async () => {
      if (!isSupabaseConfigured) {
        const local = getLocalStore('forge3d_testimonials', []);
        return local.filter(t => t.status === 'approved');
      }

      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .eq('status', 'approved')
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('[Supabase Testimonials] List error (using fallback):', error.message);
          const local = getLocalStore('forge3d_testimonials', []);
          return local.filter(t => t.status === 'approved');
        }
        return data || [];
      } catch (err) {
        console.warn('[Supabase Testimonials] List exception:', err);
        const local = getLocalStore('forge3d_testimonials', []);
        return local.filter(t => t.status === 'approved');
      }
    },

    submit: async ({ name, rating, content }) => {
      let nextOrder = 1;
      if (isSupabaseConfigured) {
        try {
          const { data: maxRows } = await supabase
            .from('testimonials')
            .select('display_order')
            .order('display_order', { ascending: false })
            .limit(1);
          if (maxRows && maxRows.length > 0 && typeof maxRows[0]?.display_order === 'number') {
            nextOrder = Math.max(0, maxRows[0].display_order) + 1;
          }
        } catch (e) {
          console.warn('[Supabase Testimonials] Could not fetch max display order:', e);
        }
      } else {
        const local = getLocalStore('forge3d_testimonials', []);
        const maxOrder = local.reduce((max, t) => Math.max(max, Number(t.display_order) || 0), 0);
        nextOrder = maxOrder + 1;
      }

      const row = {
        name: name?.trim(),
        rating: Number(rating) || 5,
        content: content?.trim(),
        status: 'pending',
        is_featured: false,
        display_order: nextOrder,
        verified: true
      };

      if (!isSupabaseConfigured) {
        const local = getLocalStore('forge3d_testimonials', []);
        const newRow = { id: `testi_${Date.now()}`, ...row, created_at: new Date().toISOString() };
        local.unshift(newRow);
        setLocalStore('forge3d_testimonials', local);
        return newRow;
      }

      try {
        const { data, error } = await supabase
          .from('testimonials')
          .insert([row])
          .select()
          .single();

        if (error) {
          console.warn('[Supabase Testimonials] Submit error, saved local backup:', error.message);
          const local = getLocalStore('forge3d_testimonials', []);
          const newRow = { id: `testi_${Date.now()}`, ...row, created_at: new Date().toISOString() };
          local.unshift(newRow);
          setLocalStore('forge3d_testimonials', local);
          return newRow;
        }
        return data;
      } catch (err) {
        const local = getLocalStore('forge3d_testimonials', []);
        const newRow = { id: `testi_${Date.now()}`, ...row, created_at: new Date().toISOString() };
        local.unshift(newRow);
        setLocalStore('forge3d_testimonials', local);
        return newRow;
      }
    },

    adminList: async (params = {}) => {
      if (!isSupabaseConfigured) {
        let list = getLocalStore('forge3d_testimonials', []);
        if (params.status && params.status !== 'all') {
          list = list.filter(t => t.status === params.status);
        }
        return { testimonials: list };
      }

      try {
        let query = supabase.from('testimonials').select('*');
        if (params.status && params.status !== 'all') {
          query = query.eq('status', params.status);
        }
        query = query.order('display_order', { ascending: true }).order('created_at', { ascending: false });

        const { data, error } = await query;
        if (error) {
          console.warn('[Supabase Testimonials] adminList error:', error.message);
          let list = getLocalStore('forge3d_testimonials', []);
          if (params.status && params.status !== 'all') {
            list = list.filter(t => t.status === params.status);
          }
          return { testimonials: list };
        }
        return { testimonials: data || [] };
      } catch (err) {
        console.warn('[Supabase Testimonials] adminList exception:', err);
        let list = getLocalStore('forge3d_testimonials', []);
        if (params.status && params.status !== 'all') {
          list = list.filter(t => t.status === params.status);
        }
        return { testimonials: list };
      }
    },

    adminModerate: async (id, { status, display_order }) => {
      const updates = { status, updated_at: new Date().toISOString() };
      if (typeof display_order === 'number' && display_order > 0) {
        updates.display_order = display_order;
      }

      if (!isSupabaseConfigured) {
        const list = getLocalStore('forge3d_testimonials', []);
        const idx = list.findIndex(t => t.id === id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...updates };
          setLocalStore('forge3d_testimonials', list);
          return list[idx];
        }
        return { id, ...updates };
      }

      try {
        const { data, error } = await supabase
          .from('testimonials')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw new Error(error.message);
        return data;
      } catch (err) {
        const list = getLocalStore('forge3d_testimonials', []);
        const idx = list.findIndex(t => t.id === id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...updates };
          setLocalStore('forge3d_testimonials', list);
          return list[idx];
        }
        throw err;
      }
    },

    adminUpdate: async (id, updates) => {
      if (!isSupabaseConfigured) {
        const list = getLocalStore('forge3d_testimonials', []);
        const idx = list.findIndex(t => t.id === id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
          setLocalStore('forge3d_testimonials', list);
          return list[idx];
        }
        return { id, ...updates };
      }

      try {
        const { data, error } = await supabase
          .from('testimonials')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (error) throw new Error(error.message);
        return data;
      } catch (err) {
        const list = getLocalStore('forge3d_testimonials', []);
        const idx = list.findIndex(t => t.id === id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...updates };
          setLocalStore('forge3d_testimonials', list);
          return list[idx];
        }
        throw err;
      }
    },

    adminDelete: async (id) => {
      if (!isSupabaseConfigured) {
        let list = getLocalStore('forge3d_testimonials', []);
        list = list.filter(t => t.id !== id);
        setLocalStore('forge3d_testimonials', list);
        return { success: true };
      }

      try {
        const { error } = await supabase.from('testimonials').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return { success: true };
      } catch (err) {
        let list = getLocalStore('forge3d_testimonials', []);
        list = list.filter(t => t.id !== id);
        setLocalStore('forge3d_testimonials', list);
        return { success: true };
      }
    },

    adminToggleFeatured: async (id, currentFeatured) => {
      return api.testimonials.adminUpdate(id, { is_featured: !currentFeatured });
    }
  },

  // ---------------------------------------------------------------------------
  // Technical Enquiries & Leads
  // ---------------------------------------------------------------------------
  enquiries: {
    submit: async (enquiryData) => {
      const enqId = `ENQ-${Date.now().toString().slice(-6)}`;
      
      // Ensure type conforms to database check constraint:
      // ('general', 'consultation', 'sample_request', 'quote', 'product_quote')
      const validTypes = ['general', 'consultation', 'sample_request', 'quote', 'product_quote'];
      let chosenType = enquiryData.type || 'general';
      if (!validTypes.includes(chosenType)) {
        if (chosenType === 'service' || chosenType === 'service_request') {
          chosenType = 'consultation';
        } else {
          chosenType = 'general';
        }
      }

      const row = {
        id: enqId,
        type: chosenType,
        name: enquiryData.name,
        email: enquiryData.email,
        phone: enquiryData.phone || '',
        company: enquiryData.company || '',
        product_id: enquiryData.productId || null,
        product_name: enquiryData.productName || null,
        message: enquiryData.message || enquiryData.notes || '',
        details: {
          serviceType: enquiryData.serviceType,
          timeframe: enquiryData.timeframe,
          specs: enquiryData.specs,
          submittedType: enquiryData.type
        },
        status: 'New',
        created_at: new Date().toISOString()
      };

      if (!isSupabaseConfigured) {
        const local = getLocalStore(LOCAL_STORAGE_ENQUIRIES_KEY, []);
        local.unshift(row);
        setLocalStore(LOCAL_STORAGE_ENQUIRIES_KEY, local);
        return { success: true, id: enqId };
      }

      // Do not chain .select().single() here because unauthenticated public visitors cannot SELECT from enquiries due to RLS
      const { error } = await supabase.from('enquiries').insert([row]);
      if (error) throw new Error(error.message);
      return { success: true, id: enqId };
    },

    adminList: async (params = {}) => {
      if (!isSupabaseConfigured) {
        let list = getLocalStore(LOCAL_STORAGE_ENQUIRIES_KEY, []);
        if (params.status && params.status !== 'all') {
          list = list.filter(e => e.status === params.status);
        }
        return { enquiries: list };
      }

      let query = supabase.from('enquiries').select('*');
      if (params.status && params.status !== 'all') {
        query = query.eq('status', params.status);
      }
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return { enquiries: data || [] };
    },

    adminUpdate: async (id, updateData) => {
      if (!isSupabaseConfigured) {
        const list = getLocalStore(LOCAL_STORAGE_ENQUIRIES_KEY, []);
        const idx = list.findIndex(e => e.id === id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...updateData, updated_at: new Date().toISOString() };
          setLocalStore(LOCAL_STORAGE_ENQUIRIES_KEY, list);
          return list[idx];
        }
        return { id, ...updateData };
      }

      const { data, error } = await supabase.from('enquiries').update(updateData).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return data;
    },

    adminDelete: async (id) => {
      if (!isSupabaseConfigured) {
        let list = getLocalStore(LOCAL_STORAGE_ENQUIRIES_KEY, []);
        list = list.filter(e => e.id !== id);
        setLocalStore(LOCAL_STORAGE_ENQUIRIES_KEY, list);
        return { success: true };
      }
      const { error } = await supabase.from('enquiries').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
  },

  // ---------------------------------------------------------------------------
  // Coupons
  // ---------------------------------------------------------------------------
  coupons: {
    validate: async (code, subtotal = 0) => {
      if (!code) throw new Error('Please enter a coupon code.');

      if (!isSupabaseConfigured) {
        const upper = code.trim().toUpperCase();
        if (upper === 'SOFT10' || upper === 'FORGE10') {
          const discount = (Number(subtotal) * 0.1);
          return {
            code: upper,
            discountType: 'percentage',
            discountValue: 10,
            discount: discount,
            message: '10% Industrial Engineering discount applied!'
          };
        }
        throw new Error('Invalid or expired promotional code.');
      }

      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .ilike('code', code.trim())
        .eq('is_active', true)
        .maybeSingle();

      if (error || !coupon) {
        throw new Error('Invalid or expired coupon code.');
      }

      if (coupon.min_order_amount && Number(subtotal) < Number(coupon.min_order_amount)) {
        throw new Error(`This coupon requires a minimum spend of £${coupon.min_order_amount}`);
      }

      let discount = 0;
      if (coupon.discount_type === 'percentage') {
        discount = (Number(subtotal) * Number(coupon.discount_value)) / 100;
      } else {
        discount = Math.min(Number(coupon.discount_value), Number(subtotal));
      }

      return {
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: Number(coupon.discount_value),
        discount: discount,
        message: `Promo code ${coupon.code} applied successfully!`
      };
    },

    list: async () => {
      if (!isSupabaseConfigured) {
        return {
          coupons: [
            { id: 'c1', code: 'SOFT10', discountType: 'percentage', discountValue: 10, minOrderAmount: 1000, isActive: true }
          ]
        };
      }

      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return { coupons: (data || []).map(couponFromDb) };
    },

    adminList: async () => {
      if (!isSupabaseConfigured) {
        const defaultCoupons = [
          { id: 'c1', code: 'SOFT10', discount_type: 'percentage', discount_value: 10, min_order_amount: 0, is_active: true },
          { id: 'c2', code: 'FORGE10', discount_type: 'percentage', discount_value: 10, min_order_amount: 0, is_active: true }
        ];
        const coupons = getLocalStore(LOCAL_STORAGE_COUPONS_KEY, defaultCoupons);
        return { coupons: coupons.map(couponFromDb) };
      }

      const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return { coupons: (data || []).map(couponFromDb) };
    },

    adminCreate: async (couponData) => {
      if (!isSupabaseConfigured) {
        const defaultCoupons = [
          { id: 'c1', code: 'SOFT10', discount_type: 'percentage', discount_value: 10, min_order_amount: 0, is_active: true },
          { id: 'c2', code: 'FORGE10', discount_type: 'percentage', discount_value: 10, min_order_amount: 0, is_active: true }
        ];
        const coupons = getLocalStore(LOCAL_STORAGE_COUPONS_KEY, defaultCoupons);
        const row = {
          id: 'coupon_' + Date.now(),
          code: couponData.code.trim().toUpperCase(),
          discount_type: couponData.discountType || 'percentage',
          discount_value: Number(couponData.discountValue),
          min_order_amount: Number(couponData.minOrderAmount || 0),
          max_uses: couponData.maxUses ? Number(couponData.maxUses) : null,
          is_active: couponData.isActive !== false,
          created_at: new Date().toISOString()
        };
        coupons.unshift(row);
        setLocalStore(LOCAL_STORAGE_COUPONS_KEY, coupons);
        return couponFromDb(row);
      }

      const row = {
        code: couponData.code.trim().toUpperCase(),
        discount_type: couponData.discountType || 'percentage',
        discount_value: Number(couponData.discountValue),
        min_order_amount: Number(couponData.minOrderAmount || 0),
        max_uses: couponData.maxUses ? Number(couponData.maxUses) : null,
        is_active: couponData.isActive !== false
      };

      const { data, error } = await supabase.from('coupons').insert([row]).select().single();
      if (error) throw new Error(error.message);
      return couponFromDb(data);
    },

    adminUpdate: async (id, couponData) => {
      if (!isSupabaseConfigured) {
        const defaultCoupons = [
          { id: 'c1', code: 'SOFT10', discount_type: 'percentage', discount_value: 10, min_order_amount: 0, is_active: true },
          { id: 'c2', code: 'FORGE10', discount_type: 'percentage', discount_value: 10, min_order_amount: 0, is_active: true }
        ];
        const coupons = getLocalStore(LOCAL_STORAGE_COUPONS_KEY, defaultCoupons);
        const idx = coupons.findIndex(c => c.id === id);
        if (idx !== -1) {
          if (couponData.code !== undefined) coupons[idx].code = couponData.code.trim().toUpperCase();
          if (couponData.discountType !== undefined) coupons[idx].discount_type = couponData.discountType;
          if (couponData.discountValue !== undefined) coupons[idx].discount_value = Number(couponData.discountValue);
          if (couponData.minOrderAmount !== undefined) coupons[idx].min_order_amount = Number(couponData.minOrderAmount);
          if (couponData.maxUses !== undefined) coupons[idx].max_uses = couponData.maxUses ? Number(couponData.maxUses) : null;
          if (couponData.isActive !== undefined) coupons[idx].is_active = Boolean(couponData.isActive);
          setLocalStore(LOCAL_STORAGE_COUPONS_KEY, coupons);
          return couponFromDb(coupons[idx]);
        }
        return couponFromDb({ id, ...couponData });
      }

      const updateRow = {};
      if (couponData.code !== undefined) updateRow.code = couponData.code.trim().toUpperCase();
      if (couponData.discountType !== undefined) updateRow.discount_type = couponData.discountType;
      if (couponData.discountValue !== undefined) updateRow.discount_value = Number(couponData.discountValue);
      if (couponData.minOrderAmount !== undefined) updateRow.min_order_amount = Number(couponData.minOrderAmount);
      if (couponData.maxUses !== undefined) updateRow.max_uses = couponData.maxUses ? Number(couponData.maxUses) : null;
      if (couponData.isActive !== undefined) updateRow.is_active = Boolean(couponData.isActive);

      const { data, error } = await supabase.from('coupons').update(updateRow).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return couponFromDb(data);
    },

    adminDelete: async (id) => {
      if (!isSupabaseConfigured) {
        const defaultCoupons = [
          { id: 'c1', code: 'SOFT10', discount_type: 'percentage', discount_value: 10, min_order_amount: 0, is_active: true },
          { id: 'c2', code: 'FORGE10', discount_type: 'percentage', discount_value: 10, min_order_amount: 0, is_active: true }
        ];
        let coupons = getLocalStore(LOCAL_STORAGE_COUPONS_KEY, defaultCoupons);
        coupons = coupons.filter(c => c.id !== id);
        setLocalStore(LOCAL_STORAGE_COUPONS_KEY, coupons);
        return { success: true };
      }
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
  },

  // ---------------------------------------------------------------------------
  // Newsletter
  // ---------------------------------------------------------------------------
  newsletter: {
    subscribe: async (email) => {
      if (!email || !email.includes('@')) throw new Error('Please enter a valid business email.');

      if (!isSupabaseConfigured) {
        return { success: true, message: 'Subscribed to Forge 3D Additive Intelligence.' };
      }

      const { error } = await supabase
        .from('newsletter_subscribers')
        .upsert({ email: email.toLowerCase().trim() }, { onConflict: 'email' });

      if (error) throw new Error(error.message);
      return { success: true, message: 'Subscribed to Forge 3D Additive Intelligence.' };
    },

    adminList: async () => {
      if (!isSupabaseConfigured) {
        return { subscribers: getLocalStore(LOCAL_STORAGE_SUBSCRIBERS_KEY, []) };
      }

      const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false });
      if (error) throw new Error(error.message);
      return { subscribers: data || [] };
    },

    adminToggleActive: async (id, isActive) => {
      if (!isSupabaseConfigured) {
        const subs = getLocalStore(LOCAL_STORAGE_SUBSCRIBERS_KEY, []);
        const idx = subs.findIndex(s => s.id === id);
        if (idx !== -1) {
          subs[idx].is_active = Boolean(isActive);
          setLocalStore(LOCAL_STORAGE_SUBSCRIBERS_KEY, subs);
          return subs[idx];
        }
        return { id, is_active: Boolean(isActive) };
      }
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .update({ is_active: Boolean(isActive) })
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },

    adminDelete: async (id) => {
      if (!isSupabaseConfigured) {
        let subs = getLocalStore(LOCAL_STORAGE_SUBSCRIBERS_KEY, []);
        subs = subs.filter(s => s.id !== id);
        setLocalStore(LOCAL_STORAGE_SUBSCRIBERS_KEY, subs);
        return { success: true };
      }
      const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
  },

  // ---------------------------------------------------------------------------
  // Settings & Dashboard Metrics (Real Database Queries)
  // ---------------------------------------------------------------------------
  settings: {
    get: async () => {
      const defaultSettings = {
        storeName: 'SOFT 3D Spółka z o.o.',
        companyName: 'SOFT 3D Spółka z o.o.',
        contactPhone: '+48 22 123 45 67',
        contactEmail: 'divyanshiasp1290@gmail.com',
        announcementPhone: '+48 22 123 45 67',
        announcementEmail: 'divyanshiasp1290@gmail.com',
        address: 'ul. Mokotowska 61 lok. 17, 00-542 Warsaw, Poland',
        storeAddress: 'ul. Mokotowska 61 lok. 17, 00-542 Warsaw, Poland',
        krs: '0000370365',
        nip: '7010268819',
        regon: '142683598',
        currency: '£',
        currencySymbol: '£',
        vatRate: 23
      };

      if (!isSupabaseConfigured) return { settings: defaultSettings };

      const { data, error } = await supabase.from('site_settings').select('*');
      if (error || !data?.length) return { settings: defaultSettings };

      const mapped = {};
      data.forEach(row => {
        mapped[row.key] = row.value;
      });

      return { settings: { ...defaultSettings, ...mapped } };
    },

    adminUpdate: async (settingsObj) => {
      if (!isSupabaseConfigured) {
        const prev = getLocalStore(LOCAL_STORAGE_SETTINGS_KEY, {});
        setLocalStore(LOCAL_STORAGE_SETTINGS_KEY, { ...prev, ...settingsObj });
        return { success: true };
      }

      const entries = Object.entries(settingsObj).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('site_settings').upsert(entries, { onConflict: 'key' });
      if (error) throw new Error(error.message);
      return { success: true };
    }
  },

  dashboard: {
    getStats: async () => {
      if (!isSupabaseConfigured) {
        const localOrders = getLocalStore(LOCAL_STORAGE_ORDERS_KEY, []);
        const nonCancelled = localOrders.filter(o => String(o.status || '').toLowerCase() !== 'cancelled');
        const totalRevenue = nonCancelled.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        const activeOrdersList = localOrders.filter(o => {
          const s = String(o.status || '').toLowerCase();
          return s !== 'cancelled' && s !== 'delivered' && s !== 'completed';
        });
        return {
          totalRevenue: totalRevenue || 0,
          totalOrders: localOrders.length,
          activeOrders: activeOrdersList.length,
          pendingOrders: localOrders.filter(o => o.status === 'Pending').length,
          totalCustomers: 0,
          totalProducts: localProducts.length,
          lowStockCount: 0,
          pendingReviewsCount: 0,
          recentOrders: localOrders.slice(0, 5),
          recentEnquiries: getLocalStore(LOCAL_STORAGE_ENQUIRIES_KEY, []).slice(0, 5),
          customersList: []
        };
      }

      // Query real tables in parallel
      const [
        ordersRes,
        productsRes,
        enquiriesRes,
        reviewsRes,
        profilesRes
      ] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('id, name, stock_quantity, min_stock'),
        supabase.from('enquiries').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('reviews').select('id').eq('status', 'pending'),
        supabase.from('profiles').select('*')
      ]);

      const orders = ordersRes.data || [];
      const products = productsRes.data || [];
      const enquiries = enquiriesRes.data || [];
      const pendingReviews = reviewsRes.data || [];
      const profiles = profilesRes.data || [];

      const nonCancelledOrders = orders.filter(o => String(o.status || '').toLowerCase() !== 'cancelled');
      const totalRevenue = nonCancelledOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      const activeOrdersList = orders.filter(o => {
        const s = String(o.status || '').toLowerCase();
        return s !== 'cancelled' && s !== 'delivered' && s !== 'completed';
      });
      const pendingOrders = orders.filter(o => String(o.status || '').toLowerCase() === 'pending').length;
      const lowStockCount = products.filter(p => (p.stock_quantity ?? 10) <= (p.min_stock ?? 5)).length;

      // Group real registered profiles and ordering customers
      const customersMap = {};
      profiles.forEach(p => {
        if (p.role === 'customer' || (p.role !== 'admin' && p.role !== 'super_admin' && p.email !== 'divyanshiasp1290@gmail.com')) {
          customersMap[p.email] = {
            id: p.id,
            first_name: p.first_name || p.email.split('@')[0],
            last_name: p.last_name || '',
            company: p.company || '—',
            email: p.email,
            phone: p.phone || '—',
            order_count: 0,
            total_spend: 0
          };
        }
      });

      orders.forEach(o => {
        const email = o.customer_email;
        if (email && email !== 'divyanshiasp1290@gmail.com') {
          if (!customersMap[email]) {
            customersMap[email] = {
              id: o.user_id || email,
              first_name: o.customer_name?.split(' ')[0] || 'Client',
              last_name: o.customer_name?.split(' ').slice(1).join(' ') || '',
              company: o.company || '—',
              email: email,
              phone: o.customer_phone || '—',
              order_count: 0,
              total_spend: 0
            };
          }
          if (String(o.status || '').toLowerCase() !== 'cancelled') {
            customersMap[email].order_count += 1;
            customersMap[email].total_spend += (Number(o.total) || 0);
          }
        }
      });

      let pendingTestimonialsCount = 0;
      try {
        const { data: pt } = await supabase.from('testimonials').select('id').eq('status', 'pending');
        if (pt) pendingTestimonialsCount = pt.length;
      } catch (e) {}

      const customersList = Object.values(customersMap);

      return {
        totalRevenue,
        totalOrders: orders.length,
        activeOrders: activeOrdersList.length,
        pendingOrders,
        totalCustomers: customersList.length,
        totalProducts: products.length,
        lowStockCount,
        pendingReviewsCount: pendingReviews.length,
        pendingTestimonialsCount,
        recentOrders: orders.slice(0, 5).map(orderFromDb),
        recentEnquiries: enquiries.slice(0, 5),
        customersList
      };
    }
  },

  // ---------------------------------------------------------------------------
  // Realtime Subscriptions
  // ---------------------------------------------------------------------------
  realtime: {
    subscribe: (table, callback) => {
      if (!isSupabaseConfigured) return () => {};

      const channelName = `realtime-${table}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          (payload) => {
            callback(payload);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    },

    subscribeOrders: (callback) => api.realtime.subscribe('orders', callback),
    subscribeProducts: (callback) => api.realtime.subscribe('products', callback),
    subscribeCategories: (callback) => api.realtime.subscribe('categories', callback),
    subscribeBrands: (callback) => api.realtime.subscribe('brands', callback),
    subscribeCoupons: (callback) => api.realtime.subscribe('coupons', callback),
    subscribeBlogs: (callback) => api.realtime.subscribe('blogs', callback),
    subscribeEnquiries: (callback) => api.realtime.subscribe('enquiries', callback),
    subscribeReviews: (callback) => api.realtime.subscribe('reviews', callback),
    subscribeTestimonials: (callback) => api.realtime.subscribe('testimonials', callback),
    subscribeNewsletter: (callback) => api.realtime.subscribe('newsletter_subscribers', callback),
    subscribeProfiles: (callback) => api.realtime.subscribe('profiles', callback)
  }
};

export default api;
