-- ==============================================================================
-- SOFT 3D Spółka z o.o. - PRODUCTION SUPABASE SECURITY & RLS PERMISSIONS
-- ==============================================================================
-- INSTRUCTIONS FOR USER:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/uceidpwcbozoeubawufz
-- 2. Go to "SQL Editor" on the left menu.
-- 3. Click "New query", paste this entire script, and click "Run".
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- 1. ENSURE SCHEMA COLUMNS EXIST ON PRODUCTS TABLE
-- -----------------------------------------------------------------------------
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS min_stock INT DEFAULT 5;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS badge TEXT;

-- -----------------------------------------------------------------------------
-- 2. SECURITY DEFINER IS_ADMIN FUNCTION
-- Avoids RLS infinite recursion by running with elevated privileges
-- -----------------------------------------------------------------------------
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- -----------------------------------------------------------------------------
-- 3. REGISTER & CONFIGURE ADMINISTRATOR IN AUTH.USERS + AUTH.IDENTITIES + PROFILES
-- Email: divyanshiasp1290@gmail.com
-- Password: Admin@2026
-- Role: admin
-- Company: SOFT 3D Spółka z o.o.
-- -----------------------------------------------------------------------------
-- 3. REGISTER & CONFIGURE ADMINISTRATOR IN AUTH.USERS + AUTH.IDENTITIES + PROFILES
-- Email: divyanshiasp1290@gmail.com
-- Password: Admin@2026
-- Role: admin
-- Company: SOFT 3D Spółka z o.o.
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  v_user_id UUID;
BEGIN
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
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      'divyanshiasp1290@gmail.com',
      crypt('Admin@2026', gen_salt('bf')),
      now(),
      NULL,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"first_name":"Divyanshi","last_name":"Admin","role":"admin","company":"SOFT 3D Spółka z o.o."}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = crypt('Admin@2026', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
        raw_user_meta_data = '{"first_name":"Divyanshi","last_name":"Admin","role":"admin","company":"SOFT 3D Spółka z o.o."}'::jsonb,
        confirmation_token = COALESCE(confirmation_token, ''),
        recovery_token = COALESCE(recovery_token, ''),
        email_change_token_new = COALESCE(email_change_token_new, ''),
        email_change = COALESCE(email_change, ''),
        updated_at = now()
    WHERE id = v_user_id;
  END IF;

  -- CRITICAL: Prevent GoTrue "Database error querying schema 500" caused by NULL tokens in auth.users
  UPDATE auth.users
  SET confirmation_token = COALESCE(confirmation_token, ''),
      recovery_token = COALESCE(recovery_token, ''),
      email_change_token_new = COALESCE(email_change_token_new, ''),
      email_change = COALESCE(email_change, '')
  WHERE confirmation_token IS NULL 
     OR recovery_token IS NULL 
     OR email_change_token_new IS NULL 
     OR email_change IS NULL;

  -- CRUCIAL FOR GOTRUE: auth.identities row prevents "Database error querying schema 500"
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
    v_user_id,
    v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', 'divyanshiasp1290@gmail.com'),
    'email',
    v_user_id::text,
    now(),
    now(),
    now()
  );

  -- CREATE OR UPDATE ADMIN PROFILE IN PUBLIC.PROFILES
  INSERT INTO public.profiles (id, email, first_name, last_name, company, phone, role, is_active)
  VALUES (
    v_user_id,
    'divyanshiasp1290@gmail.com',
    'Divyanshi',
    'Admin',
    'SOFT 3D Spółka z o.o.',
    '+48 22 123 45 67',
    'admin',
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    is_active = true,
    company = 'SOFT 3D Spółka z o.o.',
    first_name = 'Divyanshi',
    last_name = 'Admin';

END $$;

-- -----------------------------------------------------------------------------
-- 4. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 5. CLEAN UP PRIOR POLICIES TO PREVENT DUPLICATES
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- -----------------------------------------------------------------------------
-- 6. GRANULAR RLS POLICIES
-- -----------------------------------------------------------------------------

-- PROFILES (Users see own profile, Admins see all)
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (id = auth.uid() OR public.is_admin()) WITH CHECK (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- PRODUCTS (Public storefront reads, Admin manages)
CREATE POLICY "products_public_select" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_admin_insert" ON public.products FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "products_admin_update" ON public.products FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "products_admin_delete" ON public.products FOR DELETE USING (public.is_admin());

-- CATEGORIES (Public storefront reads, Admin manages)
CREATE POLICY "categories_public_select" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_insert" ON public.categories FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "categories_admin_update" ON public.categories FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "categories_admin_delete" ON public.categories FOR DELETE USING (public.is_admin());

-- BRANDS (Public storefront reads, Admin manages)
CREATE POLICY "brands_public_select" ON public.brands FOR SELECT USING (true);
CREATE POLICY "brands_admin_insert" ON public.brands FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "brands_admin_update" ON public.brands FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "brands_admin_delete" ON public.brands FOR DELETE USING (public.is_admin());

-- COUPONS (Public reads to validate, Admin manages)
CREATE POLICY "coupons_public_select" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "coupons_admin_insert" ON public.coupons FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "coupons_admin_update" ON public.coupons FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "coupons_admin_delete" ON public.coupons FOR DELETE USING (public.is_admin());

-- BLOGS (Public reads, Admin manages)
CREATE POLICY "blogs_public_select" ON public.blogs FOR SELECT USING (true);
CREATE POLICY "blogs_admin_insert" ON public.blogs FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "blogs_admin_update" ON public.blogs FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "blogs_admin_delete" ON public.blogs FOR DELETE USING (public.is_admin());

-- REVIEWS (Public reads approved, Anyone submits, Admin manages)
CREATE POLICY "reviews_public_select" ON public.reviews FOR SELECT USING (status = 'approved' OR public.is_admin());
CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "reviews_admin_update" ON public.reviews FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "reviews_admin_delete" ON public.reviews FOR DELETE USING (public.is_admin());

-- ENQUIRIES (Public submits RFQ/inquiry, Admin views & manages)
CREATE POLICY "enquiries_insert" ON public.enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "enquiries_admin_select" ON public.enquiries FOR SELECT USING (public.is_admin());
CREATE POLICY "enquiries_admin_update" ON public.enquiries FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "enquiries_admin_delete" ON public.enquiries FOR DELETE USING (public.is_admin());

-- ORDERS (Customer reads own, Anyone checkouts, Admin manages)
CREATE POLICY "orders_select" ON public.orders FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "orders_insert" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_admin_update" ON public.orders FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "orders_admin_delete" ON public.orders FOR DELETE USING (public.is_admin());

-- SITE SETTINGS (Public reads for branding/currency, Admin updates)
CREATE POLICY "site_settings_public_select" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "site_settings_admin_all" ON public.site_settings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- NEWSLETTER (Public subscribes, Admin manages)
CREATE POLICY "newsletter_insert" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "newsletter_admin_select" ON public.newsletter_subscribers FOR SELECT USING (public.is_admin());
CREATE POLICY "newsletter_admin_update" ON public.newsletter_subscribers FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "newsletter_admin_delete" ON public.newsletter_subscribers FOR DELETE USING (public.is_admin());

-- CART & WISHLIST & ADDRESSES (Users manage own private items)
CREATE POLICY "cart_items_own" ON public.cart_items FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "wishlist_items_own" ON public.wishlist_items FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "addresses_own" ON public.addresses FOR ALL USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- -----------------------------------------------------------------------------
-- 7. STORAGE BUCKETS SETUP & POLICIES
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('product-images', 'product-images', true),
  ('blog-images', 'blog-images', true),
  ('brand-logos', 'brand-logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public Read Product Images" ON storage.objects;
  DROP POLICY IF EXISTS "Public Read Blog Images" ON storage.objects;
  DROP POLICY IF EXISTS "Public Read Brand Logos" ON storage.objects;
  DROP POLICY IF EXISTS "Admin Upload Product Images" ON storage.objects;
  DROP POLICY IF EXISTS "Admin Upload Blog Images" ON storage.objects;
  DROP POLICY IF EXISTS "Admin Upload Brand Logos" ON storage.objects;
  DROP POLICY IF EXISTS "Admin Delete Product Images" ON storage.objects;
  DROP POLICY IF EXISTS "Admin Delete Blog Images" ON storage.objects;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Public Read Product Images" ON storage.objects FOR SELECT USING (bucket_id IN ('product-images', 'blog-images', 'brand-logos'));
CREATE POLICY "Admin Upload Product Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('product-images', 'blog-images', 'brand-logos') AND (public.is_admin() OR auth.role() = 'authenticated'));
CREATE POLICY "Admin Update Product Images" ON storage.objects FOR UPDATE USING (bucket_id IN ('product-images', 'blog-images', 'brand-logos') AND (public.is_admin() OR auth.role() = 'authenticated'));
CREATE POLICY "Admin Delete Product Images" ON storage.objects FOR DELETE USING (bucket_id IN ('product-images', 'blog-images', 'brand-logos') AND (public.is_admin() OR auth.role() = 'authenticated'));

-- -----------------------------------------------------------------------------
-- 8. REALTIME REPLICATION SETUP
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- ==============================================================================
-- 9. SECURE ADMIN USER MANAGEMENT RPC FUNCTIONS & AUTO CONFIRM
-- ==============================================================================

-- -- 1. DROP TRIGGER ON AUTH.USERS (Prevents GoTrue "Database error querying schema 500")
DROP TRIGGER IF EXISTS trigger_auto_confirm_admin ON auth.users;
DROP FUNCTION IF EXISTS public.auto_confirm_admin_users();

-- 2. FIX NULL TOKENS IN AUTH.USERS (GoTrue crashes with 500 if tokens are NULL)
UPDATE auth.users
SET confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change = COALESCE(email_change, ''),
    email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE confirmation_token IS NULL 
   OR recovery_token IS NULL 
   OR email_change_token_new IS NULL 
   OR email_change IS NULL
   OR email_confirmed_at IS NULL;

-- 3. FIX ALL AUTH.IDENTITIES (GoTrue requires exact user_id matching for email provider)
DELETE FROM auth.identities 
WHERE user_id IN (SELECT id FROM auth.users);

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  u.id,
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email',
  u.id::text,
  now(),
  now(),
  now()
FROM auth.users u;

-- 4. SECURE CREATE ADMIN RPC (Pre-populates tokens, confirmed email, and correct identity)
CREATE OR REPLACE FUNCTION public.create_admin_user(
  p_email TEXT,
  p_password TEXT,
  p_first_name TEXT DEFAULT 'Admin',
  p_last_name TEXT DEFAULT 'Staff'
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_user_id UUID;
  v_clean_email TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can create staff accounts.';
  END IF;

  v_clean_email := lower(trim(p_email));
  IF v_clean_email = '' OR p_password = '' THEN
    RAISE EXCEPTION 'Email and password are required.';
  END IF;

  SELECT id INTO v_user_id FROM auth.users WHERE email = v_clean_email;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id, 'authenticated', 'authenticated', v_clean_email,
      crypt(p_password, gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('first_name', p_first_name, 'last_name', p_last_name, 'role', 'admin'),
      now(), now(),
      '', '', '', ''
    );

    DELETE FROM auth.identities WHERE user_id = v_user_id;

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_user_id, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', v_clean_email),
      'email', v_user_id::text, now(), now(), now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = crypt(p_password, gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        raw_user_meta_data = jsonb_build_object('first_name', p_first_name, 'last_name', p_last_name, 'role', 'admin'),
        confirmation_token = COALESCE(confirmation_token, ''),
        recovery_token = COALESCE(recovery_token, ''),
        email_change_token_new = COALESCE(email_change_token_new, ''),
        email_change = COALESCE(email_change, ''),
        updated_at = now()
    WHERE id = v_user_id;

    DELETE FROM auth.identities WHERE user_id = v_user_id;

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_user_id, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', v_clean_email),
      'email', v_user_id::text, now(), now(), now()
    );
  END IF;

  INSERT INTO public.profiles (id, email, first_name, last_name, role, is_active, updated_at)
  VALUES (v_user_id, v_clean_email, p_first_name, p_last_name, 'admin', true, now())
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin', is_active = true, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, updated_at = now();

  RETURN jsonb_build_object('success', true, 'id', v_user_id, 'email', v_clean_email);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.delete_admin_user(p_target_id UUID)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can delete staff accounts.';
  END IF;

  IF p_target_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own administrative account while logged in.';
  END IF;

  DELETE FROM public.profiles WHERE id = p_target_id;
  BEGIN
    DELETE FROM auth.identities WHERE user_id = p_target_id;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  DELETE FROM auth.users WHERE id = p_target_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_admin_user(
  p_target_id UUID,
  p_first_name TEXT,
  p_last_name TEXT,
  p_password TEXT DEFAULT NULL
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can update staff accounts.';
  END IF;

  UPDATE public.profiles
  SET first_name = p_first_name,
      last_name = p_last_name,
      updated_at = now()
  WHERE id = p_target_id;

  IF p_password IS NOT NULL AND trim(p_password) <> '' THEN
    UPDATE auth.users
    SET encrypted_password = crypt(p_password, gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = p_target_id;
  ELSE
    UPDATE auth.users
    SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = p_target_id;
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.confirm_admin_by_email(p_email TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_clean_email TEXT;
BEGIN
  v_clean_email := lower(trim(p_email));
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE lower(email) = v_clean_email 
      AND role IN ('admin', 'super_admin') 
      AND is_active = true
  ) THEN
    UPDATE auth.users
    SET email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE lower(email) = v_clean_email;
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 10. AUTOMATIC PROFILE CREATION TRIGGER FOR REGISTERED USERS / CLIENTS
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role, is_active, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(COALESCE(NEW.email, ''), '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    true,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(NULLIF(EXCLUDED.first_name, ''), profiles.first_name),
    last_name = COALESCE(NULLIF(EXCLUDED.last_name, ''), profiles.last_name),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill any registered auth.users into public.profiles who are missing
INSERT INTO public.profiles (id, email, first_name, last_name, role, is_active, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'first_name', split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'last_name', ''),
  COALESCE(u.raw_user_meta_data->>'role', 'customer'),
  true,
  u.created_at,
  now()
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 11. PERMISSIONS GRANT
-- -----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 11. NOTIFY POSTGREST SCHEMA CACHE RELOAD
NOTIFY pgrst, 'reload schema';

