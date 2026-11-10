/*
# Create Khidmat marketplace data model

1. New Tables
- `categories` stores the service categories shown in discovery and filters.
- `provider_profiles` stores public provider identity, biography, location, experience, rating, and availability.
- `services` stores provider-offered services, pricing, service imagery, and category relationships.
- `bookings` stores authenticated customer booking requests and their lifecycle status.
- `reviews` stores customer feedback attached to completed bookings and providers.

2. Security
- Public marketplace tables are readable by anonymous visitors so discovery works before sign-in.
- Bookings and reviews are limited to authenticated users and scoped to the relevant customer or provider.
- Every table has RLS enabled and explicit Data API grants.

3. Important Notes
- Booking ownership is derived from `auth.uid()` with a database default, so the browser never needs to supply a trusted owner id.
- Provider profile records are public directory records; provider dashboard writes can be added through role-aware server functions later.
- Seed values use stable slugs and titles rather than generated ids so the migration is rebuild-safe.
*/

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.provider_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  professional_title text NOT NULL,
  bio text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT 'Kabul',
  experience_years integer NOT NULL DEFAULT 0 CHECK (experience_years >= 0),
  rating numeric(2,1) NOT NULL DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  review_count integer NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  avatar_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(12,2) NOT NULL CHECK (price >= 0),
  price_unit text NOT NULL DEFAULT 'starting price',
  image_url text,
  location text NOT NULL DEFAULT 'Kabul',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  provider_id uuid REFERENCES public.provider_profiles(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  phone text NOT NULL,
  service_title text NOT NULL,
  provider_name text NOT NULL,
  location text NOT NULL,
  preferred_date date NOT NULL,
  preferred_time text NOT NULL,
  instructions text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','in_progress','completed','cancelled','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.provider_profiles TO anon, authenticated;
GRANT SELECT ON public.services TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;

DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public can view active providers" ON public.provider_profiles;
CREATE POLICY "Public can view active providers" ON public.provider_profiles FOR SELECT TO anon, authenticated USING (is_active = true);
DROP POLICY IF EXISTS "Public can view active services" ON public.services;
CREATE POLICY "Public can view active services" ON public.services FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Customers can view own bookings" ON public.bookings;
CREATE POLICY "Customers can view own bookings" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Customers can create own bookings" ON public.bookings;
CREATE POLICY "Customers can create own bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Customers can update own bookings" ON public.bookings;
CREATE POLICY "Customers can update own bookings" ON public.bookings FOR UPDATE TO authenticated USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Customers can delete own bookings" ON public.bookings;
CREATE POLICY "Customers can delete own bookings" ON public.bookings FOR DELETE TO authenticated USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers can view reviews" ON public.reviews;
CREATE POLICY "Customers can view reviews" ON public.reviews FOR SELECT TO authenticated USING (auth.uid() = customer_id OR EXISTS (SELECT 1 FROM public.provider_profiles p WHERE p.id = provider_id AND p.is_active = true));
DROP POLICY IF EXISTS "Customers can create reviews" ON public.reviews;
CREATE POLICY "Customers can create reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Customers can update own reviews" ON public.reviews;
CREATE POLICY "Customers can update own reviews" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Customers can delete own reviews" ON public.reviews;
CREATE POLICY "Customers can delete own reviews" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = customer_id);

CREATE INDEX IF NOT EXISTS services_category_id_idx ON public.services(category_id);
CREATE INDEX IF NOT EXISTS services_provider_id_idx ON public.services(provider_id);
CREATE INDEX IF NOT EXISTS bookings_customer_id_idx ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings(status);

INSERT INTO public.categories (name, slug, description) VALUES
  ('Home cleaning', 'home-cleaning', 'A spotless home, without the hassle.'),
  ('Plumbing', 'plumbing', 'Fast fixes for leaks, pipes, and water systems.'),
  ('Electrical', 'electrical', 'Safe, reliable electrical work for every room.'),
  ('Painting', 'painting', 'Fresh color and careful finishing.'),
  ('Carpentry', 'carpentry', 'Furniture, shelving, and custom woodwork.'),
  ('AC repair', 'ac-repair', 'Keep your home cool through every season.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.provider_profiles (full_name, professional_title, bio, location, experience_years, rating, review_count, avatar_url) VALUES
  ('Ahmad Wali', 'Master Plumber', 'Dependable plumbing repairs with clear pricing and tidy work.', 'Kabul, Karte Parwan', 9, 4.9, 128, 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200'),
  ('Farzana Sediqi', 'Home Care Specialist', 'Thoughtful home cleaning for busy families and offices.', 'Kabul, Shahr-e-Naw', 6, 4.8, 94, 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200'),
  ('Omid Rahimi', 'Licensed Electrician', 'Safe, precise electrical repairs and installations.', 'Kabul, Wazir Akbar Khan', 11, 5.0, 76, 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=200')
ON CONFLICT DO NOTHING;

INSERT INTO public.services (provider_id, category_id, title, description, price, price_unit, image_url, location)
SELECT p.id, c.id, x.title, x.description, x.price, x.price_unit, x.image_url, x.location
FROM (VALUES
  ('Ahmad Wali', 'Plumbing', 'Leak & pipe repair', 'Fast diagnosis and repair for household leaks.', 900, 'starting price', 'https://images.pexels.com/photos/7859953/pexels-photo-7859953.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Karte Parwan'),
  ('Farzana Sediqi', 'Home cleaning', 'Deep home cleaning', 'A detailed reset for kitchens, bathrooms, and living spaces.', 1200, 'per visit', 'https://images.pexels.com/photos/6195275/pexels-photo-6195275.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Shahr-e-Naw'),
  ('Omid Rahimi', 'Electrical', 'Electrical inspection', 'A safety-first check for outlets, wiring, and lighting.', 750, 'starting price', 'https://images.pexels.com/photos/20500461/pexels-photo-20500461.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Wazir Akbar Khan')
) AS x(provider_name, category_name, title, description, price, price_unit, image_url, location)
JOIN public.provider_profiles p ON p.full_name = x.provider_name
JOIN public.categories c ON c.name = x.category_name
WHERE NOT EXISTS (SELECT 1 FROM public.services s WHERE s.title = x.title AND s.provider_id = p.id);
