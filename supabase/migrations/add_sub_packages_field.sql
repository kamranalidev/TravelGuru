-- Add sub_packages field to packages table
-- This replaces pricing_type, pricing_unit_label, and guests_per_unit
-- Sub-packages allow admin to create options like "30 min ride - 200 AED", "1 hour ride - 350 AED"

ALTER TABLE public.packages
  ADD COLUMN IF NOT EXISTS sub_packages jsonb DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.packages.sub_packages IS 'Array of sub-packages, each with name and price (e.g., [{"name": "30 min ride", "price": 200}, {"name": "1 hour ride", "price": 350}])';

-- Drop old pricing unit columns (keeping for backwards compatibility, you can remove them later)
-- ALTER TABLE public.packages DROP COLUMN IF EXISTS pricing_type;
-- ALTER TABLE public.packages DROP COLUMN IF EXISTS pricing_unit_label;
-- ALTER TABLE public.packages DROP COLUMN IF EXISTS guests_per_unit;
