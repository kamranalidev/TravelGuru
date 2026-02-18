-- Migration: Add count_children_in_slots field to services table
-- This allows admin to decide whether children should count towards slot limits
-- Infants are always excluded from slot counts (they're with parents)

-- Add the column to services table
ALTER TABLE services
ADD COLUMN IF NOT EXISTS count_children_in_slots BOOLEAN DEFAULT true;

-- Comment explaining the field
COMMENT ON COLUMN services.count_children_in_slots IS 'When true, children count towards daily_slots limit. When false, only adults count. Infants never count (they are with parents).';

-- Update existing services to have the default value
UPDATE services SET count_children_in_slots = true WHERE count_children_in_slots IS NULL;
