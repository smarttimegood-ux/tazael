
CREATE TABLE public.volunteer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  city text,
  about text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.volunteer_profiles TO authenticated;
GRANT SELECT ON public.volunteer_profiles TO anon;
GRANT ALL ON public.volunteer_profiles TO service_role;

ALTER TABLE public.volunteer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "volunteer profiles public read" ON public.volunteer_profiles FOR SELECT USING (true);
CREATE POLICY "users insert own volunteer profile" ON public.volunteer_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own volunteer profile" ON public.volunteer_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own volunteer profile" ON public.volunteer_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_volunteer_profiles_updated_at
BEFORE UPDATE ON public.volunteer_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
