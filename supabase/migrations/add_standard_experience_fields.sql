-- Add standard experience configuration to services table
-- These fields define the details for the "Standard Experience" base package

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS standard_cancellation_policy jsonb DEFAULT '{"type": "no_cancellation", "details": "No cancellations, refunds, or changes can be made"}'::jsonb,
  ADD COLUMN IF NOT EXISTS standard_confirmation_type text DEFAULT 'instant',
  ADD COLUMN IF NOT EXISTS standard_voucher_type text DEFAULT 'mobile',
  ADD COLUMN IF NOT EXISTS standard_how_to_use jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS standard_eligibility jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS standard_terms jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS standard_opening_hours text,
  ADD COLUMN IF NOT EXISTS standard_address text,
  ADD COLUMN IF NOT EXISTS standard_how_to_get_there text,
  ADD COLUMN IF NOT EXISTS standard_includes jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS standard_excludes jsonb DEFAULT '[]'::jsonb,
  -- Standard experience transfer/time options
  ADD COLUMN IF NOT EXISTS standard_enable_time_selection boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS standard_available_times jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS standard_enable_transfer boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS standard_transfer_price numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS standard_round_trip_price numeric DEFAULT 0;

COMMENT ON COLUMN public.services.standard_cancellation_policy IS 'Cancellation policy for the standard/base package';
COMMENT ON COLUMN public.services.standard_confirmation_type IS 'Confirmation type for standard package (instant, 24_hours, 48_hours, manual)';
COMMENT ON COLUMN public.services.standard_voucher_type IS 'Voucher type for standard package (mobile, print, both)';
COMMENT ON COLUMN public.services.standard_how_to_use IS 'JSON array of steps for how to use the standard package';
COMMENT ON COLUMN public.services.standard_eligibility IS 'JSON array of eligibility requirements for standard package';
COMMENT ON COLUMN public.services.standard_terms IS 'JSON array of terms and conditions for standard package';
COMMENT ON COLUMN public.services.standard_opening_hours IS 'Opening hours for standard package';
COMMENT ON COLUMN public.services.standard_address IS 'Venue address for standard package';
COMMENT ON COLUMN public.services.standard_how_to_get_there IS 'Directions for standard package';
COMMENT ON COLUMN public.services.standard_includes IS 'JSON array of what is included in standard package';
COMMENT ON COLUMN public.services.standard_excludes IS 'JSON array of what is not included in standard package';
COMMENT ON COLUMN public.services.standard_enable_time_selection IS 'Enable time selection for standard package';
COMMENT ON COLUMN public.services.standard_available_times IS 'Available time slots for standard package';
COMMENT ON COLUMN public.services.standard_enable_transfer IS 'Enable transfer option for standard package';
COMMENT ON COLUMN public.services.standard_transfer_price IS 'One-way transfer price for standard package';
COMMENT ON COLUMN public.services.standard_round_trip_price IS 'Round-trip transfer price for standard package';
