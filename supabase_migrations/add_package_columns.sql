-- Add new columns to packages table for enhanced package management
-- Run this in your Supabase SQL Editor

-- Package type and combo configuration
ALTER TABLE public.packages
  ADD COLUMN IF NOT EXISTS package_type text DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS original_price numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS combo_items jsonb DEFAULT '[]'::jsonb;

-- Cancellation policy (JSONB with type and details)
ALTER TABLE public.packages
  ADD COLUMN IF NOT EXISTS cancellation_policy jsonb DEFAULT NULL;

-- Package details for frontend display
ALTER TABLE public.packages
  ADD COLUMN IF NOT EXISTS confirmation_type text DEFAULT 'instant',
  ADD COLUMN IF NOT EXISTS voucher_type text DEFAULT 'mobile',
  ADD COLUMN IF NOT EXISTS how_to_use jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS eligibility jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS terms jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS opening_hours text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS address text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS how_to_get_there text DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.packages.package_type IS 'standard or combo';
COMMENT ON COLUMN public.packages.original_price IS 'For combo packages: total price if bought separately (used to calculate savings %)';
COMMENT ON COLUMN public.packages.combo_items IS 'Array of {name, price} objects defining combo contents';
COMMENT ON COLUMN public.packages.cancellation_policy IS '{type: "no_cancellation"|"free_cancellation"|"partial_refund"|"flexible", details: "..."}';
COMMENT ON COLUMN public.packages.confirmation_type IS 'instant, 24_hours, 48_hours, or manual';
COMMENT ON COLUMN public.packages.voucher_type IS 'mobile, print, or both';
COMMENT ON COLUMN public.packages.how_to_use IS 'Array of strings with redemption instructions';
COMMENT ON COLUMN public.packages.eligibility IS 'Array of eligibility requirements';
COMMENT ON COLUMN public.packages.terms IS 'Array of package-specific terms';
