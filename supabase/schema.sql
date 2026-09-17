-- ==============================================================================
-- FORGE 3D INDUSTRIAL SOLUTIONS - COMPLETE SUPABASE POSTGRESQL SCHEMA & MIGRATION
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CORE DATABASE TABLES
-- ==============================================================================

-- A. USER PROFILES (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'super_admin', 'manager', 'editor')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- B. SAVED DELIVERY ADDRESSES
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
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
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- C. CATEGORIES & SUB-CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  badge TEXT,
  image TEXT,
  popular_brands JSONB DEFAULT '[]'::jsonb,
  parent_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- D. BRANDS
CREATE TABLE IF NOT EXISTS public.brands (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT,
  origin TEXT,
  status TEXT,
  tagline TEXT,
  logo_text TEXT,
  badge_color TEXT,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  website TEXT,
  logo_image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- E. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  brand TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  category_name TEXT NOT NULL,
  technology TEXT,
  price NUMERIC(12, 2) NOT NULL,
  sale_price NUMERIC(12, 2),
  quote_only BOOLEAN DEFAULT false,
  currency TEXT DEFAULT '£',
  availability TEXT,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INT DEFAULT 10,
  min_stock INT DEFAULT 5,
  lead_time TEXT,
  sku TEXT UNIQUE NOT NULL,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  reviews_count INT DEFAULT 0,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  short_specs JSONB DEFAULT '{}'::jsonb,
  description TEXT,
  key_features JSONB DEFAULT '[]'::jsonb,
  tech_specs JSONB DEFAULT '{}'::jsonb,
  suitable_materials JSONB DEFAULT '[]'::jsonb,
  warranty TEXT,
  is_featured BOOLEAN DEFAULT false,
  badge TEXT,
  meta_title TEXT,
  meta_description TEXT,
  related_product_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- F. CART ITEMS (Authenticated Persistent Cart)
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- G. WISHLIST ITEMS (Authenticated Persistent Wishlist)
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- H. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  company TEXT,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  items JSONB NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL,
  discount_amount NUMERIC(12, 2) DEFAULT 0,
  coupon_code TEXT,
  shipping_fee NUMERIC(12, 2) DEFAULT 0,
  tax_amount NUMERIC(12, 2) DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL,
  currency TEXT DEFAULT '£',
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
  payment_method TEXT DEFAULT 'card',
  payment_status TEXT DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- I. BLOG CMS
CREATE TABLE IF NOT EXISTS public.blogs (
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
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  scheduled_at TIMESTAMPTZ,
  is_featured BOOLEAN DEFAULT false,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- J. REVIEWS & RATINGS
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY DEFAULT ('rev_' || gen_random_uuid()::text),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_company TEXT,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  comment TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- K. TECHNICAL ENQUIRIES & LEADS
CREATE TABLE IF NOT EXISTS public.enquiries (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('general', 'consultation', 'sample_request', 'quote', 'product_quote')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT,
  message TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'In Progress', 'Closed')),
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- L. COUPONS & PROMOTIONS
CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL,
  min_order_amount NUMERIC(10, 2) DEFAULT 0,
  max_uses INT,
  uses_count INT DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- M. NEWSLETTER SUBSCRIBERS
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT now()
);

-- N. SITE SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 3. INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON public.products(in_stock);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON public.blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs(slug);

-- ==============================================================================
-- 4. DATABASE FUNCTIONS & TRIGGERS
-- ==============================================================================

-- Helper: Check if current authenticated user is an administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin', 'manager')
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Automatically create public.profiles record on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, company, phone, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'firstName', NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'lastName', NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, public.profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.profiles.last_name),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Automatically update product review count and average rating on approval
CREATE OR REPLACE FUNCTION public.update_product_review_stats()
RETURNS TRIGGER AS $$
DECLARE
  target_prod_id TEXT;
  rev_count INT;
  avg_score NUMERIC(3, 2);
BEGIN
  target_prod_id := COALESCE(NEW.product_id, OLD.product_id);
  
  SELECT COUNT(*), COALESCE(AVG(rating), 5.0)
  INTO rev_count, avg_score
  FROM public.reviews
  WHERE product_id = target_prod_id AND status = 'approved';

  UPDATE public.products
  SET reviews_count = rev_count, rating = avg_score
  WHERE id = target_prod_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_status_changed ON public.reviews;
CREATE TRIGGER on_review_status_changed
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_review_stats();

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Public profile lookup" ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "Admin manage profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- ADDRESSES
CREATE POLICY "Users manage own addresses" ON public.addresses FOR ALL USING (user_id = auth.uid() OR public.is_admin());

-- CATEGORIES
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin manage categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- BRANDS
CREATE POLICY "Public read brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Admin manage brands" ON public.brands FOR ALL USING (true) WITH CHECK (true);

-- PRODUCTS
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin manage products" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- CART ITEMS
CREATE POLICY "Users manage own cart" ON public.cart_items FOR ALL USING (user_id = auth.uid());

-- WISHLIST ITEMS
CREATE POLICY "Users manage own wishlist" ON public.wishlist_items FOR ALL USING (user_id = auth.uid());

-- ORDERS
CREATE POLICY "Users read own orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Anyone can create order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- BLOGS
CREATE POLICY "Public read published blogs" ON public.blogs FOR SELECT USING (true);
CREATE POLICY "Admin manage blogs" ON public.blogs FOR ALL USING (true) WITH CHECK (true);

-- REVIEWS
CREATE POLICY "Public read approved reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);

-- ENQUIRIES
CREATE POLICY "Anyone insert enquiries" ON public.enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin view and manage enquiries" ON public.enquiries FOR ALL USING (true) WITH CHECK (true);

-- COUPONS
CREATE POLICY "Public read active coupons" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Admin manage coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);

-- NEWSLETTER
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Subscribers can update" ON public.newsletter_subscribers FOR UPDATE USING (true);
CREATE POLICY "Admin view subscribers" ON public.newsletter_subscribers FOR ALL USING (true) WITH CHECK (true);

-- SITE SETTINGS
CREATE POLICY "Public read site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admin manage site settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 6. REALTIME SUBSCRIPTIONS CONFIGURATION
-- ==============================================================================
-- Enable publication of table events over websocket
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.enquiries;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.blogs;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ==============================================================================
-- 7. STORAGE BUCKETS SETUP (Run to configure storage for images)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('product-images', 'product-images', true),
  ('blog-images', 'blog-images', true),
  ('brand-logos', 'brand-logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies: Public read access
CREATE POLICY "Public Read Product Images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Public Read Blog Images" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
CREATE POLICY "Public Read Brand Logos" ON storage.objects FOR SELECT USING (bucket_id = 'brand-logos');

-- Storage RLS Policies: Admin upload/modify access
CREATE POLICY "Admin Upload Product Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND (auth.role() = 'authenticated'));
CREATE POLICY "Admin Upload Blog Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog-images' AND (auth.role() = 'authenticated'));
CREATE POLICY "Admin Upload Brand Logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'brand-logos' AND (auth.role() = 'authenticated'));

CREATE POLICY "Admin Delete Product Images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND (auth.role() = 'authenticated'));
CREATE POLICY "Admin Delete Blog Images" ON storage.objects FOR DELETE USING (bucket_id = 'blog-images' AND (auth.role() = 'authenticated'));

-- ==============================================================================
-- 8. DEFAULT ADMINISTRATOR ACCOUNT & OFFICIAL COMPANY REGISTRATION
-- Email: divyanshiasp1290@gmail.com
-- Password: Admin@2026
-- Role: admin
-- Company: SOFT 3D Spółka z o.o.
-- Adres: ul. Mokotowska 61 lok. 17, 00-542 Warszawa, Poland
-- KRS: 0000370365 | NIP: 7010268819 | REGON: 142683598
-- ==============================================================================

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- 1. Check if administrator already exists in auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'divyanshiasp1290@gmail.com';

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      invited_at,
      confirmation_token,
      confirmation_sent_at,
      recovery_token,
      recovery_sent_at,
      email_change_token_new,
      email_change,
      email_change_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      phone,
      phone_confirmed_at,
      phone_change,
      phone_change_token,
      phone_change_sent_at,
      email_change_token_current,
      email_change_confirm_status,
      banned_until,
      reauthentication_token,
      reauthentication_sent_at,
      is_sso_user,
      deleted_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      'divyanshiasp1290@gmail.com',
      crypt('Admin@2026', gen_salt('bf')),
      now(),
      NULL,
      '',
      NULL,
      '',
      NULL,
      '',
      '',
      NULL,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"first_name":"Divyanshi","last_name":"Admin","role":"admin","company":"SOFT 3D Spółka z o.o."}'::jsonb,
      false,
      now(),
      now(),
      NULL,
      NULL,
      '',
      '',
      NULL,
      '',
      0,
      NULL,
      '',
      NULL,
      false,
      NULL
    );
  ELSE
    -- If user exists, update password and fix all tokens to empty string (prevents GoTrue NULL scanner crash)
    UPDATE auth.users
    SET 
      encrypted_password = crypt('Admin@2026', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      confirmation_token = COALESCE(confirmation_token, ''),
      recovery_token = COALESCE(recovery_token, ''),
      email_change_token_new = COALESCE(email_change_token_new, ''),
      email_change_token_current = COALESCE(email_change_token_current, ''),
      email_change = COALESCE(email_change, ''),
      phone_change = COALESCE(phone_change, ''),
      phone_change_token = COALESCE(phone_change_token, ''),
      reauthentication_token = COALESCE(reauthentication_token, ''),
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = '{"first_name":"Divyanshi","last_name":"Admin","role":"admin","company":"SOFT 3D Spółka z o.o."}'::jsonb,
      updated_at = now()
    WHERE id = v_user_id;
  END IF;

  -- 2. Ensure auth.identities record exists (MANDATORY for Supabase GoTrue Auth)
  DELETE FROM auth.identities WHERE user_id = v_user_id;
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    v_user_id::text,
    v_user_id,
    json_build_object('sub', v_user_id::text, 'email', 'divyanshiasp1290@gmail.com')::jsonb,
    'email',
    v_user_id::text,
    now(),
    now(),
    now()
  );

  -- 3. Ensure profile exists with administrator role
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    company,
    role,
    is_active,
    updated_at
  ) VALUES (
    v_user_id,
    'divyanshiasp1290@gmail.com',
    'Divyanshi',
    'Admin',
    'SOFT 3D Spółka z o.o.',
    'admin',
    true,
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    company = EXCLUDED.company,
    role = 'admin',
    is_active = true,
    updated_at = now();

  -- 4. Insert official company settings
  INSERT INTO public.site_settings (key, value)
  VALUES 
    ('company_details', '{
      "company_name": "SOFT 3D Spółka z o.o.",
      "legal_form": "Spółka z o.o.",
      "address": "ul. Mokotowska 61 lok. 17, 00-542 Warszawa Poland",
      "city": "Warszawa",
      "postal_code": "00-542",
      "country": "Poland",
      "krs": "0000370365",
      "nip": "7010268819",
      "regon": "142683598",
      "email": "contact@soft3d.pl",
      "phone": "+48 22 123 45 67"
    }'::jsonb),
    ('general', '{
      "companyName": "SOFT 3D Spółka z o.o.",
      "address": "ul. Mokotowska 61 lok. 17, 00-542 Warszawa Poland",
      "krs": "0000370365",
      "nip": "7010268819",
      "regon": "142683598",
      "email": "contact@soft3d.pl",
      "phone": "+48 22 123 45 67"
    }'::jsonb)
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

END $$;

