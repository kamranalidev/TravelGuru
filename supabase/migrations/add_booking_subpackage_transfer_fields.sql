-- Add sub-package and transfer fields to bookings table
-- These fields store the selected sub-package option and transfer details

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS selected_sub_package jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS transfer_type text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS transfer_price numeric DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.bookings.selected_sub_package IS 'Selected sub-package option (JSON object with name and price)';
COMMENT ON COLUMN public.bookings.transfer_type IS 'Transfer type: none, one_way, or round_trip';
COMMENT ON COLUMN public.bookings.transfer_price IS 'Price of the selected transfer option';
