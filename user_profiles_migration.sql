-- Add missing columns to user_profiles table
ALTER TABLE public.user_profiles 

-- Change phone_number from numeric to text to handle international formats
ALTER COLUMN phone_number TYPE text USING phone_number::text,

-- Add missing profile fields
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS nationality text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS emergency_contact_name text,
ADD COLUMN IF NOT EXISTS emergency_contact_phone text,
ADD COLUMN IF NOT EXISTS passport_number text,
ADD COLUMN IF NOT EXISTS travel_preferences text;

-- Recommended additional columns for a travel app
-- ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'en',
-- ADD COLUMN IF NOT EXISTS dietary_restrictions text,
-- ADD COLUMN IF NOT EXISTS accessibility_needs text,
-- ADD COLUMN IF NOT EXISTS travel_insurance_provider text,
-- ADD COLUMN IF NOT EXISTS loyalty_programs jsonb,
-- ADD COLUMN IF NOT EXISTS is_profile_complete boolean DEFAULT false,
-- ADD COLUMN IF NOT EXISTS last_login timestamp with time zone,
-- ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"email": true, "sms": false, "push": true}'::jsonb;
