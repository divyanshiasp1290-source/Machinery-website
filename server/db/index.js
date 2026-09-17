import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'forge3d.db');
export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for better concurrency and foreign keys
db.exec(`PRAGMA foreign_keys = ON;`);

export function initDb() {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      company TEXT,
      phone TEXT,
      role TEXT DEFAULT 'customer',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT DEFAULT 'shipping',
      first_name TEXT,
      last_name TEXT,
      company TEXT,
      address_line1 TEXT NOT NULL,
      address_line2 TEXT,
      city TEXT NOT NULL,
      postcode TEXT NOT NULL,
      country TEXT DEFAULT 'United Kingdom',
      phone TEXT,
      is_default INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      badge TEXT,
      image TEXT,
      popular_brands TEXT,
      parent_id TEXT,
      display_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      category TEXT,
      origin TEXT,
      status TEXT,
      tagline TEXT,
      logo_text TEXT,
      badge_color TEXT,
      description TEXT,
      features TEXT,
      website TEXT,
      logo_image TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      brand TEXT NOT NULL,
      category_id TEXT NOT NULL,
      category_name TEXT NOT NULL,
      technology TEXT,
      price REAL NOT NULL,
      sale_price REAL,
      quote_only INTEGER DEFAULT 0,
      currency TEXT DEFAULT '£',
      availability TEXT,
      in_stock INTEGER DEFAULT 1,
      stock_quantity INTEGER DEFAULT 10,
      lead_time TEXT,
      sku TEXT UNIQUE NOT NULL,
      rating REAL DEFAULT 5.0,
      reviews_count INTEGER DEFAULT 0,
      images TEXT NOT NULL,
      short_specs TEXT,
      description TEXT,
      key_features TEXT,
      tech_specs TEXT,
      suitable_materials TEXT,
      warranty TEXT,
      is_featured INTEGER DEFAULT 0,
      badge TEXT,
      meta_title TEXT,
      meta_description TEXT,
      related_product_ids TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wishlist_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      customer_email TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      company TEXT,
      shipping_address TEXT NOT NULL,
      billing_address TEXT,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      discount_amount REAL DEFAULT 0,
      coupon_code TEXT,
      shipping_fee REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      total REAL NOT NULL,
      currency TEXT DEFAULT '£',
      status TEXT DEFAULT 'Pending',
      payment_method TEXT DEFAULT 'card',
      payment_status TEXT DEFAULT 'Pending',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS blogs (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      tag TEXT,
      date TEXT NOT NULL,
      read_time TEXT,
      author TEXT NOT NULL,
      author_role TEXT,
      image TEXT,
      summary TEXT,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'published',
      scheduled_at TEXT,
      is_featured INTEGER DEFAULT 0,
      meta_title TEXT,
      meta_description TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_company TEXT,
      rating INTEGER NOT NULL,
      title TEXT,
      comment TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS enquiries (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      company TEXT,
      product_id TEXT,
      product_name TEXT,
      message TEXT,
      details TEXT,
      status TEXT DEFAULT 'New',
      internal_notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL,
      discount_value REAL NOT NULL,
      min_order_amount REAL DEFAULT 0,
      max_uses INTEGER,
      uses_count INTEGER DEFAULT 0,
      valid_from TEXT,
      valid_until TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      is_active INTEGER DEFAULT 1,
      subscribed_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
    CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
  `);

  seedData();
}

async function seedData() {
  // 1. Seed Admin & Demo Customer
  const adminCheck = db.prepare(`SELECT id FROM users WHERE email = ?`).get('admin@forge3d.co.uk');
  if (!adminCheck) {
    const adminHash = bcrypt.hashSync('Admin@Forge3D2026', 10);
    db.prepare(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, company, phone, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run('usr_admin_001', 'admin@forge3d.co.uk', adminHash, 'Engineering', 'Director', 'Forge 3D Systems UK', '+44 (0) 121 555 3820', 'super_admin');
    console.log('[DB] Seeded default super admin: admin@forge3d.co.uk');
  }

  const customerCheck = db.prepare(`SELECT id FROM users WHERE email = ?`).get('r.davies@apexengineering.co.uk');
  if (!customerCheck) {
    const custHash = bcrypt.hashSync('Customer@123', 10);
    db.prepare(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, company, phone, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run('usr_cust_001', 'r.davies@apexengineering.co.uk', custHash, 'Richard', 'Davies', 'Apex Precision Engineering Ltd', '+44 (0) 121 555 0192', 'customer');

    // Default Address
    db.prepare(`
      INSERT INTO addresses (id, user_id, type, first_name, last_name, company, address_line1, address_line2, city, postcode, country, phone, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run('addr_001', 'usr_cust_001', 'shipping', 'Richard', 'Davies', 'Apex Precision Engineering Ltd', 'Unit 12, Innovation Business Park', '', 'Birmingham', 'B45 9AG', 'United Kingdom', '+44 (0) 121 555 0192');
    console.log('[DB] Seeded demo customer: r.davies@apexengineering.co.uk');
  }

  // 2. Seed Categories
  const categoryCount = db.prepare(`SELECT count(*) as count FROM categories`).get().count;
  if (categoryCount === 0) {
    try {
      const { categories } = await import('../../src/data/categories.js');
      const insertCat = db.prepare(`
        INSERT INTO categories (id, name, slug, description, badge, image, popular_brands, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      categories.forEach((cat, idx) => {
        insertCat.run(
          cat.id,
          cat.name,
          cat.slug || cat.id,
          cat.description || '',
          cat.badge || '',
          cat.image || '',
          JSON.stringify(cat.popularBrands || []),
          idx + 1
        );
      });
      console.log(`[DB] Seeded ${categories.length} categories.`);
    } catch (e) {
      console.error('[DB] Could not seed categories:', e);
    }
  }

  // 3. Seed Brands
  const brandCount = db.prepare(`SELECT count(*) as count FROM brands`).get().count;
  if (brandCount === 0) {
    try {
      const { brandsData } = await import('../../src/data/brandsData.js');
      const insertBrand = db.prepare(`
        INSERT INTO brands (id, name, category, origin, status, tagline, logo_text, badge_color, description, features, website, logo_image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      brandsData.forEach((b) => {
        const id = b.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        insertBrand.run(
          id,
          b.name,
          b.category || '',
          b.origin || '',
          b.status || '',
          b.tagline || '',
          b.logoText || b.name,
          b.badgeColor || '',
          b.description || '',
          JSON.stringify(b.features || []),
          b.website || '',
          `/brands/${id}.png`
        );
      });
      console.log(`[DB] Seeded ${brandsData.length} brands.`);
    } catch (e) {
      console.error('[DB] Could not seed brands:', e);
    }
  }

  // 4. Seed Products
  const productCount = db.prepare(`SELECT count(*) as count FROM products`).get().count;
  if (productCount === 0) {
    try {
      const { products } = await import('../../src/data/products.js');
      const insertProd = db.prepare(`
        INSERT INTO products (
          id, name, slug, brand, category_id, category_name, technology, price, sale_price,
          quote_only, currency, availability, in_stock, stock_quantity, lead_time, sku,
          rating, reviews_count, images, short_specs, description, key_features, tech_specs,
          suitable_materials, warranty, is_featured, badge
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?
        )
      `);

      products.forEach((p, idx) => {
        const slug = p.id;
        insertProd.run(
          p.id,
          p.name,
          slug,
          p.brand,
          p.category,
          p.categoryName || '',
          p.technology || '',
          p.price || 0,
          p.salePrice || null,
          p.quoteOnly ? 1 : 0,
          p.currency || '£',
          p.availability || 'In Stock',
          p.inStock === false ? 0 : 1,
          p.stockQuantity || 15,
          p.leadTime || '1-3 Business Days',
          p.sku || `SKU-${idx + 100}`,
          p.rating || 5.0,
          p.reviewsCount || 10,
          JSON.stringify(p.images || [p.image]),
          JSON.stringify(p.shortSpecs || {}),
          p.description || '',
          JSON.stringify(p.keyFeatures || []),
          JSON.stringify(p.techSpecs || {}),
          JSON.stringify(p.suitableMaterials || []),
          p.warranty || '12 Months Manufacturer Warranty',
          idx < 6 ? 1 : 0,
          p.badge || (idx === 0 ? 'Best Seller' : '')
        );
      });
      console.log(`[DB] Seeded ${products.length} products.`);
    } catch (e) {
      console.error('[DB] Could not seed products:', e);
    }
  }

  // 5. Seed Blogs
  const blogCount = db.prepare(`SELECT count(*) as count FROM blogs`).get().count;
  if (blogCount === 0) {
    try {
      const { blogs } = await import('../../src/data/blogs.js');
      const insertBlog = db.prepare(`
        INSERT INTO blogs (id, slug, title, category, tag, date, read_time, author, author_role, image, summary, content, status, is_featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?)
      `);
      blogs.forEach((b, idx) => {
        insertBlog.run(
          `blog-${b.id || idx + 1}`,
          b.slug || `post-${b.id || idx + 1}`,
          b.title,
          b.category || 'General',
          b.tag || '',
          b.date || 'Today',
          b.readTime || '5 min read',
          b.author || 'Engineering Team',
          b.authorRole || 'Additive Specialist',
          b.image || '',
          b.summary || '',
          b.content || '',
          idx === 0 ? 1 : 0
        );
      });
      console.log(`[DB] Seeded ${blogs.length} blogs.`);
    } catch (e) {
      console.error('[DB] Could not seed blogs:', e);
    }
  }

  // 6. Seed Sample Coupons
  const couponCount = db.prepare(`SELECT count(*) as count FROM coupons`).get().count;
  if (couponCount === 0) {
    const insertCoupon = db.prepare(`
      INSERT INTO coupons (id, code, discount_type, discount_value, min_order_amount, max_uses, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);
    insertCoupon.run('cpn_1', 'FORGE10', 'percentage', 10, 500, 100);
    insertCoupon.run('cpn_2', 'WELCOME50', 'fixed', 50, 250, 50);
    insertCoupon.run('cpn_3', 'AERO15', 'percentage', 15, 2000, 20);
    console.log('[DB] Seeded coupons: FORGE10, WELCOME50, AERO15.');
  }

  // 7. Seed Initial Orders for Demo Customer
  const orderCount = db.prepare(`SELECT count(*) as count FROM orders`).get().count;
  if (orderCount === 0) {
    const prod1 = db.prepare(`SELECT * FROM products LIMIT 1`).get();
    if (prod1) {
      const orderItems = [
        {
          id: prod1.id,
          name: prod1.name,
          brand: prod1.brand,
          price: prod1.price,
          quantity: 1,
          image: JSON.parse(prod1.images)[0],
          sku: prod1.sku
        }
      ];

      const shippingAddr = {
        firstName: 'Richard',
        lastName: 'Davies',
        company: 'Apex Precision Engineering Ltd',
        address: 'Unit 12, Innovation Business Park',
        city: 'Birmingham',
        postcode: 'B45 9AG',
        country: 'United Kingdom',
        phone: '+44 (0) 121 555 0192'
      };

      db.prepare(`
        INSERT INTO orders (
          id, user_id, customer_email, customer_name, customer_phone, company,
          shipping_address, items, subtotal, discount_amount, coupon_code,
          shipping_fee, tax_amount, total, currency, status, payment_method, payment_status
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?
        )
      `).run(
        'F3D-ORD-882410',
        'usr_cust_001',
        'r.davies@apexengineering.co.uk',
        'Richard Davies',
        '+44 (0) 121 555 0192',
        'Apex Precision Engineering Ltd',
        JSON.stringify(shippingAddr),
        JSON.stringify(orderItems),
        prod1.price,
        0,
        '',
        0,
        0,
        prod1.price,
        '£',
        'Delivered',
        'invoice',
        'Paid'
      );
      console.log('[DB] Seeded demo order: F3D-ORD-882410');
    }
  }

  // 8. Seed Initial Reviews
  const reviewCount = db.prepare(`SELECT count(*) as count FROM reviews`).get().count;
  if (reviewCount === 0) {
    const p = db.prepare(`SELECT id FROM products LIMIT 1`).get();
    if (p) {
      db.prepare(`
        INSERT INTO reviews (id, product_id, user_id, user_name, user_company, rating, title, comment, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'rev_001',
        p.id,
        'usr_cust_001',
        'Richard Davies',
        'Apex Precision Engineering Ltd',
        5,
        'Outstanding dimensional accuracy and continuous reliability',
        'We installed this system in our Birmingham prototyping lab 4 months ago. It has run continuous 72-hour engineering nylon and carbon-fiber builds without a single hotend failure. Excellent build chamber thermal stability.',
        'approved'
      );
      console.log('[DB] Seeded initial approved review.');
    }
  }

  // 9. Seed Site Settings
  const settingCheck = db.prepare(`SELECT key FROM site_settings WHERE key = 'homepage'`).get();
  if (!settingCheck) {
    const defaultSettings = {
      heroTitle: 'Industrial Additive Manufacturing Ecosystems',
      heroSubtitle: 'Direct UK distribution of enterprise 3D printers, meter-scale LFAM pellet platforms, high-temperature PEEK systems, and metrology scanners.',
      heroCtaPrimaryText: 'Explore Production Systems',
      heroCtaPrimaryLink: 'catalog',
      heroCtaSecondaryText: 'Request Technical Advice',
      heroCtaSecondaryLink: 'contact',
      announcementPhone: '+44 (0) 121 555 3820',
      announcementEmail: 'engineering@forge3d.co.uk',
      announcementHours: 'Mon - Fri: 8:30 - 17:30',
      announcementLocation: 'UK Tech Hub'
    };
    db.prepare(`INSERT INTO site_settings (key, value) VALUES ('homepage', ?)`).run(JSON.stringify(defaultSettings));
    console.log('[DB] Seeded site settings.');
  }
}
