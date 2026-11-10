/*
# Link professional profiles to the signed-in account

1. Why this change
- `provider_profiles.user_id` has no default and is not in the column-level INSERT grant, so an
  authenticated browser client cannot create a profile that satisfies the
  "Professionals can create own profile" policy (`WITH CHECK (auth.uid() = user_id)`).
  Every professional registration therefore failed with a row-level security violation.

2. Security
- `user_id` now defaults to `auth.uid()`, so ownership is derived by the database, never trusted from the client.
- The INSERT and UPDATE column grants include `user_id` so the existing policy can be satisfied on create.
- No policy is widened: providers still only read, write, and delete their own profile.

3. Important Notes
- Existing seeded directory profiles keep `user_id IS NULL` and stay public, unowned records.
- `user_id` remains UNIQUE, so one account can hold exactly one professional profile.
- Idempotent and safe to replay.
*/

ALTER TABLE public.provider_profiles
  ALTER COLUMN user_id SET DEFAULT auth.uid();

GRANT INSERT (user_id, full_name, professional_title, bio, location, experience_years, avatar_url)
  ON public.provider_profiles TO authenticated;

GRANT UPDATE (user_id, full_name, professional_title, bio, location, experience_years, avatar_url)
  ON public.provider_profiles TO authenticated;
