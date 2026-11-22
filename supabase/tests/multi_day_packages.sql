-- Run on an empty disposable database: load fixtures/multi_day_schema.sql,
-- then supabase_migrations/add_multi_day_packages.sql, then this file.
-- All test records are rolled back.
BEGIN;
DO $$
DECLARE service_a bigint; service_b bigint; package_a bigint; booking_a bigint; cart_a bigint; trip_end date; days integer; occupied bigint;
BEGIN
  INSERT INTO public.services(service_name, daily_slots) VALUES ('Test multi-day service', 2) RETURNING id INTO service_a;
  INSERT INTO public.services(service_name, daily_slots) VALUES ('Test other service', 5) RETURNING id INTO service_b;
  INSERT INTO public.packages(service_id, name, duration_days, itinerary) VALUES (service_a, 'Five days', 5, '[{"day":1,"title":"Arrival"}]') RETURNING id INTO package_a;
  INSERT INTO public.bookings(service_id, package_id, booking_date, payment_status) VALUES (service_a, package_a, '2028-02-27', 'succeeded') RETURNING id INTO booking_a;
  SELECT booking_end_date, duration_days INTO trip_end, days FROM public.bookings WHERE id = booking_a;
  IF trip_end <> '2028-03-02' OR days <> 5 THEN RAISE EXCEPTION 'Inclusive leap-year trip dates are incorrect'; END IF;

  INSERT INTO public.cart_items(service_id, package_id, booking_date) VALUES (service_a, package_a, '2028-12-30') RETURNING id INTO cart_a;
  SELECT booking_end_date INTO trip_end FROM public.cart_items WHERE id = cart_a;
  IF trip_end <> '2029-01-03' THEN RAISE EXCEPTION 'Cart year boundary is incorrect'; END IF;

  UPDATE public.packages SET duration_days = 7 WHERE id = package_a;
  UPDATE public.bookings SET booking_date = '2028-03-01', duration_days = 99, booking_end_date = '2030-01-01' WHERE id = booking_a;
  SELECT booking_end_date, duration_days INTO trip_end, days FROM public.bookings WHERE id = booking_a;
  IF trip_end <> '2028-03-05' OR days <> 5 THEN RAISE EXCEPTION 'Existing booking length must remain a snapshot'; END IF;
  UPDATE public.cart_items SET booking_date = '2029-01-01' WHERE id = cart_a;
  SELECT booking_end_date INTO trip_end FROM public.cart_items WHERE id = cart_a;
  IF trip_end <> '2029-01-05' THEN RAISE EXCEPTION 'Cart length snapshot changed'; END IF;

  -- A booking starting before the requested window still occupies every day it overlaps.
  SELECT slots_booked INTO occupied FROM public.get_trip_availability(service_a, '2028-03-04', '2028-03-04');
  IF occupied <> 1 THEN RAISE EXCEPTION 'Overlapping multi-day booking was missed'; END IF;
  SELECT slots_booked INTO occupied FROM public.get_trip_availability(service_a, '2028-03-06', '2028-03-06');
  IF occupied <> 0 THEN RAISE EXCEPTION 'End date must be inclusive, without blocking the following day'; END IF;
  UPDATE public.bookings SET payment_status = 'failed' WHERE id = booking_a;
  SELECT slots_booked INTO occupied FROM public.get_trip_availability(service_a, '2028-03-04', '2028-03-04');
  IF occupied <> 0 THEN RAISE EXCEPTION 'Failed payment blocks availability'; END IF;
  UPDATE public.bookings SET payment_status = 'succeeded', voucher_status = 'cancelled' WHERE id = booking_a;
  SELECT slots_booked INTO occupied FROM public.get_trip_availability(service_a, '2028-03-04', '2028-03-04');
  IF occupied <> 0 THEN RAISE EXCEPTION 'Cancelled booking blocks availability'; END IF;

  BEGIN
    INSERT INTO public.bookings(service_id, package_id, booking_date) VALUES (service_b, package_a, '2028-03-01');
    RAISE EXCEPTION 'Cross-service package should have been rejected';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM = 'Cross-service package should have been rejected' THEN RAISE; END IF;
  END;
  BEGIN
    UPDATE public.packages SET duration_days = 0 WHERE id = package_a;
    RAISE EXCEPTION 'Zero-day package should have been rejected';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  INSERT INTO public.bookings(service_id, booking_date) VALUES (service_a, '2028-04-01') RETURNING id INTO booking_a;
  SELECT booking_end_date, duration_days INTO trip_end, days FROM public.bookings WHERE id = booking_a;
  IF trip_end <> '2028-04-01' OR days <> 1 THEN RAISE EXCEPTION 'Single-day compatibility failed'; END IF;
  RAISE NOTICE 'Multi-day SQL assertions passed';
END $$;
SET LOCAL ROLE anon;
SELECT count(*) AS public_availability_days FROM public.get_trip_availability(0, '2028-03-01', '2028-03-05');
ROLLBACK;
