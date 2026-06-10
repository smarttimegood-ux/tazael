-- Explicit deny policies for eco_reports. All client access is blocked.
-- Reads/writes go only through trusted server functions using the service role,
-- which bypasses RLS. This makes intent explicit and satisfies the linter.

CREATE POLICY "Deny all client select on eco_reports"
  ON public.eco_reports FOR SELECT
  TO anon, authenticated
  USING (false);

CREATE POLICY "Deny all client insert on eco_reports"
  ON public.eco_reports FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "Deny all client update on eco_reports"
  ON public.eco_reports FOR UPDATE
  TO anon, authenticated
  USING (false) WITH CHECK (false);

CREATE POLICY "Deny all client delete on eco_reports"
  ON public.eco_reports FOR DELETE
  TO anon, authenticated
  USING (false);