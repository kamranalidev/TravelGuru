-- Apply before deploying the country-aware dashboard and storefront.
BEGIN;
CREATE TABLE IF NOT EXISTS public.countries (
  code text PRIMARY KEY CHECK (code ~ '^[A-Z]{2}$'),
  name text NOT NULL CHECK (length(trim(name)) > 0),
  destination_label text NOT NULL CHECK (length(trim(destination_label)) > 0),
  description text NOT NULL DEFAULT '',
  hero_image text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.countries (code, name, destination_label, description) VALUES
 ('AE', 'United Arab Emirates', 'Dubai & Abu Dhabi', 'Discover desert adventures, city landmarks, and unforgettable experiences.'),
 ('AZ', 'Azerbaijan', 'Baku', 'Explore Baku and discover the culture and landscapes of Azerbaijan.'),
 ('MY', 'Malaysia', 'Malaysia', 'Discover vibrant cities, tropical escapes, and memorable adventures.')
ON CONFLICT (code) DO NOTHING;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS country_code text REFERENCES public.countries(code);
-- Existing application was UAE-focused. Assign known international locations first.
-- Review assignments after applying: unrecognized/empty locations default to AE.
-- SELECT id, service_name, location, country_code FROM public.services ORDER BY country_code, id;
-- Country reporting follows the service's current country, including past bookings.
UPDATE public.services SET country_code = CASE
 WHEN location ~* '(baku|azerbaijan)' THEN 'AZ'
 WHEN location ~* '(malaysia|kuala lumpur|langkawi|penang)' THEN 'MY'
 ELSE 'AE' END WHERE country_code IS NULL;
ALTER TABLE public.services ALTER COLUMN country_code SET NOT NULL;
CREATE INDEX IF NOT EXISTS services_country_code_idx ON public.services(country_code);
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS countries_read ON public.countries;
CREATE POLICY countries_read ON public.countries FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS countries_admin_insert ON public.countries;
CREATE POLICY countries_admin_insert ON public.countries FOR INSERT TO authenticated
 WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND user_role = 1));
DROP POLICY IF EXISTS countries_admin_update ON public.countries;
CREATE POLICY countries_admin_update ON public.countries FOR UPDATE TO authenticated
 USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND user_role = 1))
 WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND user_role = 1));
GRANT SELECT ON public.countries TO anon, authenticated;
GRANT INSERT, UPDATE ON public.countries TO authenticated;
COMMIT;
