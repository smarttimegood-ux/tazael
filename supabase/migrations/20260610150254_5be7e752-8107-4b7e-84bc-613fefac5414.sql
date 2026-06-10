DROP POLICY IF EXISTS "Anyone can read reports" ON public.eco_reports;
DROP POLICY IF EXISTS "Anyone can submit reports" ON public.eco_reports;
REVOKE ALL ON public.eco_reports FROM anon;
REVOKE ALL ON public.eco_reports FROM authenticated;
GRANT ALL ON public.eco_reports TO service_role;