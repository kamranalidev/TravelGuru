-- Apply after add_countries.sql and before deploying the multi-day booking UI.
BEGIN;
ALTER TABLE public.packages
  ADD COLUMN IF NOT EXISTS duration_days integer NOT NULL DEFAULT 1 CHECK (duration_days > 0),
  ADD COLUMN IF NOT EXISTS itinerary jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(itinerary) = 'array');
-- Leave existing free-text hourly durations untouched. Review any legacy multi-day
-- packages and set their duration_days explicitly in the dashboard.
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS duration_days integer NOT NULL DEFAULT 1 CHECK (duration_days > 0),
  ADD COLUMN IF NOT EXISTS booking_end_date date;
UPDATE public.bookings SET booking_end_date = booking_date WHERE booking_end_date IS NULL;
ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS duration_days integer NOT NULL DEFAULT 1 CHECK (duration_days > 0),
  ADD COLUMN IF NOT EXISTS booking_end_date date;
UPDATE public.cart_items SET booking_end_date = booking_date WHERE booking_end_date IS NULL;
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_trip_dates;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_trip_dates CHECK (booking_end_date >= booking_date);
ALTER TABLE public.cart_items DROP CONSTRAINT IF EXISTS cart_items_trip_dates;
ALTER TABLE public.cart_items ADD CONSTRAINT cart_items_trip_dates CHECK (booking_end_date >= booking_date);
CREATE INDEX IF NOT EXISTS bookings_service_trip_dates_idx ON public.bookings(service_id, booking_date, booking_end_date);

-- Derive authoritative dates from the selected package. Booked lengths are snapshots:
-- later package edits must not change existing reservations or voucher validity.
CREATE OR REPLACE FUNCTION public.set_package_trip_dates() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
DECLARE package_days integer; package_service bigint;
BEGIN
  IF NEW.booking_date IS NULL THEN RAISE EXCEPTION 'A trip start date is required'; END IF;
  IF TG_OP = 'UPDATE' THEN
    IF NEW.package_id IS NOT DISTINCT FROM OLD.package_id THEN
      NEW.duration_days := OLD.duration_days;
    ELSE
      NEW.duration_days := NULL;
    END IF;
  ELSE
    NEW.duration_days := NULL;
  END IF;
  IF NEW.package_id IS NOT NULL THEN
    SELECT p.duration_days, p.service_id INTO package_days, package_service FROM public.packages p WHERE p.id = NEW.package_id;
    IF NOT FOUND OR package_service IS DISTINCT FROM NEW.service_id THEN
      RAISE EXCEPTION 'The selected package does not belong to this service';
    END IF;
    NEW.duration_days := COALESCE(NEW.duration_days, package_days);
  ELSE
    NEW.duration_days := 1;
  END IF;
  NEW.booking_end_date := NEW.booking_date + (NEW.duration_days - 1);
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS bookings_set_trip_dates ON public.bookings;
CREATE TRIGGER bookings_set_trip_dates BEFORE INSERT OR UPDATE OF booking_date, package_id, service_id, duration_days, booking_end_date
  ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_package_trip_dates();
DROP TRIGGER IF EXISTS cart_items_set_trip_dates ON public.cart_items;
CREATE TRIGGER cart_items_set_trip_dates BEFORE INSERT OR UPDATE OF booking_date, package_id, service_id, duration_days, booking_end_date
  ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.set_package_trip_dates();

-- Aggregate availability exposes no booking/customer data and is independent of
-- per-user booking read policies. Capacity retains the existing booking-slot model.
CREATE OR REPLACE FUNCTION public.get_trip_availability(p_service_id bigint, p_start_date date, p_end_date date)
RETURNS TABLE (trip_date date, slots_booked bigint, daily_capacity bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_start_date IS NULL OR p_end_date IS NULL OR p_end_date < p_start_date THEN
    RAISE EXCEPTION 'Invalid trip dates';
  END IF;
  RETURN QUERY
    SELECT d::date, count(b.id), s.daily_slots
    FROM public.services s
    CROSS JOIN generate_series(p_start_date::timestamp, p_end_date::timestamp, interval '1 day') d
    LEFT JOIN public.bookings b ON b.service_id = s.id
      AND b.booking_date <= d::date AND COALESCE(b.booking_end_date, b.booking_date) >= d::date
      AND COALESCE(b.payment_status, '') IN ('succeeded', 'paid', 'completed', 'processing', 'requires_capture')
      AND COALESCE(b.voucher_status, 'active') <> 'cancelled'
    WHERE s.id = p_service_id
    GROUP BY d, s.daily_slots ORDER BY d;
END $$;
REVOKE ALL ON FUNCTION public.get_trip_availability(bigint, date, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_trip_availability(bigint, date, date) TO anon, authenticated;
COMMIT;
