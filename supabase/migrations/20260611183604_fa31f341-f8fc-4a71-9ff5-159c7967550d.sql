CREATE TABLE public.volunteer_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, group_id)
);
GRANT SELECT, INSERT, DELETE ON public.volunteer_memberships TO authenticated;
GRANT SELECT ON public.volunteer_memberships TO anon;
GRANT ALL ON public.volunteer_memberships TO service_role;
ALTER TABLE public.volunteer_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "memberships are public readable" ON public.volunteer_memberships FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "users can join groups" ON public.volunteer_memberships FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users can leave own groups" ON public.volunteer_memberships FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fund_id text NOT NULL,
  amount integer NOT NULL CHECK (amount > 0 AND amount <= 100000000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.donations TO authenticated;
GRANT SELECT ON public.donations TO anon;
GRANT ALL ON public.donations TO service_role;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "donations are public readable" ON public.donations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "users insert own donations" ON public.donations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_memberships_group ON public.volunteer_memberships(group_id);
CREATE INDEX idx_donations_fund ON public.donations(fund_id);