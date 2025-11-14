-- Supabase Storage Setup for Profile Images
-- Run this in your Supabase SQL Editor (since you already have the profile-images bucket)

-- 1. Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policies for the profile-images bucket

-- Policy: Public read access to profile images
CREATE POLICY "Public Profile Images Access" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

-- Policy: Users can upload their own profile images
CREATE POLICY "User can upload profile image" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own profile images
CREATE POLICY "User can update own profile image" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own profile images
CREATE POLICY "User can delete own profile image" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Optional: If you want to limit file size at the database level (10MB example)
-- CREATE POLICY "Limit file size" ON storage.objects
-- FOR INSERT WITH CHECK (
--   bucket_id = 'profile-images' 
--   AND (metadata->>'size')::int < 10485760
-- );
