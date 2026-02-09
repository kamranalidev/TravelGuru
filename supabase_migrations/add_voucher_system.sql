-- Add voucher system to bookings table
-- Run this in your Supabase SQL Editor

-- Add voucher columns to bookings table
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS voucher_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS voucher_status text DEFAULT 'active' CHECK (voucher_status IN ('active', 'used', 'expired', 'cancelled')),
  ADD COLUMN IF NOT EXISTS voucher_verified_at timestamp with time zone DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS voucher_verified_by uuid DEFAULT NULL;

-- Create index for faster voucher lookups
CREATE INDEX IF NOT EXISTS idx_bookings_voucher_code ON public.bookings(voucher_code);
CREATE INDEX IF NOT EXISTS idx_bookings_voucher_status ON public.bookings(voucher_status);

-- Add comments for documentation
COMMENT ON COLUMN public.bookings.voucher_code IS 'Unique voucher code for the booking (e.g., TG-ABC12345)';
COMMENT ON COLUMN public.bookings.voucher_status IS 'Status of the voucher: active, used, expired, or cancelled';
COMMENT ON COLUMN public.bookings.voucher_verified_at IS 'Timestamp when the voucher was verified/redeemed';
COMMENT ON COLUMN public.bookings.voucher_verified_by IS 'Admin user ID who verified the voucher';

-- Function to automatically expire vouchers for past bookings
CREATE OR REPLACE FUNCTION expire_past_vouchers()
RETURNS void AS $$
BEGIN
  UPDATE public.bookings
  SET voucher_status = 'expired'
  WHERE voucher_status = 'active'
    AND booking_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a cron job to run this daily (requires pg_cron extension)
-- SELECT cron.schedule('expire-vouchers', '0 0 * * *', 'SELECT expire_past_vouchers()');
