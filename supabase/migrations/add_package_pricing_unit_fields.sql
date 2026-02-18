-- Add pricing unit fields to packages table
-- These fields support custom pricing units like "Per Jet Ski (2 people)"

ALTER TABLE public.packages
  ADD COLUMN IF NOT EXISTS pricing_unit_label text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS guests_per_unit integer DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.packages.pricing_unit_label IS 'Custom label for pricing unit (e.g., "Jet Ski", "Vehicle", "Boat")';
COMMENT ON COLUMN public.packages.guests_per_unit IS 'Number of guests included per unit (e.g., 2 people per Jet Ski)';
