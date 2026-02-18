-- Add transfer and time selection options to packages table
-- These are optional features that admins can toggle per package

-- Time selection feature
ALTER TABLE public.packages
  ADD COLUMN IF NOT EXISTS enable_time_selection boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS available_times jsonb DEFAULT '[]'::jsonb;

-- Transfer/pickup feature  
ALTER TABLE public.packages
  ADD COLUMN IF NOT EXISTS enable_transfer boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS transfer_price numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS round_trip_price numeric DEFAULT 0;

-- Add transfer columns to bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS transfer_type text CHECK (transfer_type IS NULL OR transfer_type = ANY (ARRAY['none'::text, 'one_way'::text, 'round_trip'::text])),
  ADD COLUMN IF NOT EXISTS transfer_price numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS selected_time text;

-- Add transfer columns to cart_items
ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS transfer_type text CHECK (transfer_type IS NULL OR transfer_type = ANY (ARRAY['none'::text, 'one_way'::text, 'round_trip'::text])),
  ADD COLUMN IF NOT EXISTS transfer_price_micros bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS selected_time text;

COMMENT ON COLUMN public.packages.enable_time_selection IS 'When true, users must select a time slot when booking this package';
COMMENT ON COLUMN public.packages.available_times IS 'JSON array of available time strings, e.g. ["04:00 PM", "04:30 PM", "06:00 PM"]';
COMMENT ON COLUMN public.packages.enable_transfer IS 'When true, users can optionally add pickup/transfer to their booking';
COMMENT ON COLUMN public.packages.transfer_price IS 'Price for one-way transfer in AED';
COMMENT ON COLUMN public.packages.round_trip_price IS 'Price for round-trip transfer in AED';
