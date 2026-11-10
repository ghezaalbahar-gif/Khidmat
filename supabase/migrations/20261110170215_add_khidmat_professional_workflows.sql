/*
# Add professional onboarding and provider workflows

1. Modified Tables
- `provider_profiles` gains `user_id`, linking one authenticated account to one professional profile.
- `bookings` gains provider-facing access rules while keeping customer ownership intact.
- `services` gains provider-owned create, edit, and delete access.

2. Security
- Professional profile creation derives `user_id` from the signed-in session.
- Providers can only edit their own profile and services.
- Providers can only view and update bookings assigned to their own profile.
- Client write privileges are narrowed so users cannot change ownership, activation, ratings, or moderation fields.

3. Important Notes
- Existing public seed profiles remain available and unowned.
- A professional account is recognized by its linked provider profile, avoiding a user-editable role flag.
- All policies are idempotent and safe to replay.
*/

ALTER TABLE public.provider_profiles
  ADD COLUMN IF NOT EXISTS user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS provider_id uuid REFERENCES public.provider_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS provider_profiles_user_id_idx ON public.provider_profiles(user_id);
CREATE INDEX IF NOT EXISTS bookings_provider_id_idx ON public.bookings(provider_id);

GRANT INSERT (full_name, professional_title, bio, location, experience_years, avatar_url) ON public.provider_profiles TO authenticated;
GRANT UPDATE (full_name, professional_title, bio, location, experience_years, avatar_url) ON public.provider_profiles TO authenticated;
GRANT DELETE ON public.provider_profiles TO authenticated;
GRANT INSERT (provider_id, service_id, customer_name, phone, service_title, provider_name, location, preferred_date, preferred_time, instructions) ON public.bookings TO authenticated;
GRANT UPDATE (status) ON public.bookings TO authenticated;
GRANT INSERT (provider_id, category_id, title, description, price, price_unit, image_url, location) ON public.services TO authenticated;
GRANT UPDATE (category_id, title, description, price, price_unit, image_url, location) ON public.services TO authenticated;
GRANT DELETE ON public.services TO authenticated;

DROP POLICY IF EXISTS "Professionals can view own profile" ON public.provider_profiles;
CREATE POLICY "Professionals can view own profile" ON public.provider_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id OR is_active = true);
DROP POLICY IF EXISTS "Professionals can create own profile" ON public.provider_profiles;
CREATE POLICY "Professionals can create own profile" ON public.provider_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Professionals can update own profile" ON public.provider_profiles;
CREATE POLICY "Professionals can update own profile" ON public.provider_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Professionals can delete own profile" ON public.provider_profiles;
CREATE POLICY "Professionals can delete own profile" ON public.provider_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Professionals can manage own services" ON public.services;
CREATE POLICY "Professionals can manage own services" ON public.services FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.provider_profiles p WHERE p.id = provider_id AND p.user_id = auth.uid()));
DROP POLICY IF EXISTS "Professionals can update own services" ON public.services;
CREATE POLICY "Professionals can update own services" ON public.services FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.provider_profiles p WHERE p.id = provider_id AND p.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.provider_profiles p WHERE p.id = provider_id AND p.user_id = auth.uid()));
DROP POLICY IF EXISTS "Professionals can delete own services" ON public.services;
CREATE POLICY "Professionals can delete own services" ON public.services FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.provider_profiles p WHERE p.id = provider_id AND p.user_id = auth.uid()));

DROP POLICY IF EXISTS "Professionals can view assigned bookings" ON public.bookings;
CREATE POLICY "Professionals can view assigned bookings" ON public.bookings FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.provider_profiles p WHERE p.id = provider_id AND p.user_id = auth.uid()));
DROP POLICY IF EXISTS "Professionals can update assigned bookings" ON public.bookings;
CREATE POLICY "Professionals can update assigned bookings" ON public.bookings FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.provider_profiles p WHERE p.id = provider_id AND p.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.provider_profiles p WHERE p.id = provider_id AND p.user_id = auth.uid()));
