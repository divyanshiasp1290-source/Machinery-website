-- ==============================================================================
-- FORGE 3D - CUSTOMER TESTIMONIALS SCHEMA & MIGRATION (UPDATED)
-- Company and Email fields completely removed as requested
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- ==============================================================================

-- 1. Create testimonials table (without company and email)
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- If table was already created with company or email, drop those columns cleanly
ALTER TABLE public.testimonials DROP COLUMN IF EXISTS company;
ALTER TABLE public.testimonials DROP COLUMN IF EXISTS email;

-- 2. Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON public.testimonials(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_display_order ON public.testimonials(display_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON public.testimonials(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- 4. Clean up existing policies if re-running
DROP POLICY IF EXISTS "Public read approved testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Anyone can submit testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins have full access to testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authenticated users full access to testimonials" ON public.testimonials;

-- Policy A: Public read access for approved testimonials
CREATE POLICY "Public read approved testimonials" 
ON public.testimonials 
FOR SELECT 
USING (
  status = 'approved' 
  OR (SELECT auth.role()) = 'authenticated'
  OR (SELECT auth.role()) = 'service_role'
);

-- Policy B: Anyone (public or customer) can submit a testimonial with status 'pending'
CREATE POLICY "Anyone can submit testimonials" 
ON public.testimonials 
FOR INSERT 
WITH CHECK (
  status = 'pending'
);

-- Policy C: Authenticated admins have full management access
CREATE POLICY "Admins have full access to testimonials" 
ON public.testimonials 
FOR ALL 
USING (
  (SELECT auth.role()) = 'authenticated'
  OR (SELECT auth.role()) = 'service_role'
) 
WITH CHECK (
  (SELECT auth.role()) = 'authenticated'
  OR (SELECT auth.role()) = 'service_role'
);

-- 5. Enable Realtime subscriptions for testimonials
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.testimonials;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 6. Seed Initial Approved Testimonials from existing website data (without company/email)
INSERT INTO public.testimonials (id, name, rating, content, status, is_featured, display_order, verified, created_at)
VALUES 
(
  '11111111-1111-4111-a111-111111111111',
  'Dr. Alistair Vance',
  5,
  'Transitioning to the FUNMAT PRO 610HT through SOFT 3D cut our production lead times from 6 weeks to 48 hours. The technical team conducted an on-site installation, dialled in our PEEK and ULTEM parameters, and provided exceptional engineer-to-engineer support. Unmatched in the European market.',
  'approved',
  true,
  1,
  true,
  now() - interval '120 days'
),
(
  '22222222-2222-4222-a222-222222222222',
  'Markus Henderson',
  5,
  'The Modix BIG-120X has allowed us to print full-scale wind tunnel aerodynamic models and autoclave lay-up mandrels in-house. The machine arrived calibrated and SOFT 3D''s direct pellet extruder training was first-class. We recouped the machine cost in under 4 months.',
  'approved',
  true,
  2,
  true,
  now() - interval '100 days'
),
(
  '33333333-3333-4333-a333-333333333333',
  'Sarah Jenkins',
  5,
  'We use the FreeScan UE Pro daily to inspect aerospace turbine impellers. SOFT 3D provided full on-site certification and seamless Geomagic Control X integration. Their team really knows industrial quality control inside out.',
  'approved',
  false,
  3,
  true,
  now() - interval '80 days'
),
(
  '44444444-4444-4444-a444-444444444444',
  'David O''Connor',
  5,
  'Pairing the Raise3D Pro3 Plus with Drywise for carbon-nylon jig production has completely eliminated porosity. The delivery was swift, communication was crystal clear, and when we needed spare hotends, they arrived next morning.',
  'approved',
  false,
  4,
  true,
  now() - interval '60 days'
),
(
  '55555555-5555-4555-a555-555555555555',
  'Elena Rostova',
  5,
  'The speed increase on the Form 4 is staggering—we print custom sterilizable surgical cutting guides in under 35 minutes. SOFT 3D helped us select compliant materials and provided validation documentation for ISO 13485 audits.',
  'approved',
  false,
  5,
  true,
  now() - interval '40 days'
),
(
  '66666666-6666-4666-a666-666666666666',
  'James Thornhill',
  5,
  'Printing meter-long UAV chassis in high-temp Polycarbonate in one solid piece without bonding seams has changed our design possibilities forever. Exceptional support from the SOFT 3D engineering team whenever we had questions.',
  'approved',
  false,
  6,
  true,
  now() - interval '20 days'
)
ON CONFLICT (id) DO UPDATE 
SET 
  name = EXCLUDED.name,
  rating = EXCLUDED.rating,
  content = EXCLUDED.content,
  status = EXCLUDED.status,
  is_featured = EXCLUDED.is_featured,
  display_order = EXCLUDED.display_order;

-- 7. Trigger to automatically assign the next sequential display_order for new testimonials
CREATE OR REPLACE FUNCTION public.set_testimonial_display_order()
RETURNS TRIGGER 
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.display_order IS NULL OR NEW.display_order = 0 THEN
    SELECT COALESCE(MAX(display_order), 0) + 1 INTO NEW.display_order FROM public.testimonials;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_testimonial_display_order ON public.testimonials;

CREATE TRIGGER trigger_set_testimonial_display_order
BEFORE INSERT ON public.testimonials
FOR EACH ROW
EXECUTE FUNCTION public.set_testimonial_display_order();

-- 8. Fix existing testimonials where display_order is 0 (assigns sequential 7, 8, 9...)
WITH ranked AS (
  SELECT 
    id, 
    ROW_NUMBER() OVER (ORDER BY created_at ASC) + COALESCE((SELECT MAX(display_order) FROM public.testimonials WHERE display_order > 0), 0) AS new_order
  FROM public.testimonials
  WHERE display_order = 0
)
UPDATE public.testimonials t
SET display_order = r.new_order
FROM ranked r
WHERE t.id = r.id;

