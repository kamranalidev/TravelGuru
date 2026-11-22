-- Minimal schema fixture for multi-day migration tests. Use a NEW, EMPTY test database only.
-- These tables model only columns exercised by the migration, not the full application.
CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE TABLE public.services (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, service_name text, daily_slots bigint);
CREATE TABLE public.packages (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, service_id bigint REFERENCES public.services(id), name text, duration text);
CREATE TABLE public.bookings (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, service_id bigint REFERENCES public.services(id), package_id bigint REFERENCES public.packages(id), booking_date date, payment_status text, voucher_status text DEFAULT 'active');
CREATE TABLE public.cart_items (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, service_id bigint REFERENCES public.services(id), package_id bigint REFERENCES public.packages(id), booking_date date);
