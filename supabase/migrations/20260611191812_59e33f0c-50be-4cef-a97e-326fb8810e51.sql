
-- donations: restrict SELECT to owner
DROP POLICY IF EXISTS "donations are public readable" ON public.donations;
CREATE POLICY "users view own donations" ON public.donations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
REVOKE SELECT ON public.donations FROM anon;

-- volunteer_profiles: restrict SELECT to owner
DROP POLICY IF EXISTS "volunteer profiles public read" ON public.volunteer_profiles;
CREATE POLICY "users view own volunteer profile" ON public.volunteer_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
REVOKE SELECT ON public.volunteer_profiles FROM anon;

-- volunteer_memberships: restrict SELECT to owner
DROP POLICY IF EXISTS "memberships are public readable" ON public.volunteer_memberships;
CREATE POLICY "users view own memberships" ON public.volunteer_memberships
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
REVOKE SELECT ON public.volunteer_memberships FROM anon;
