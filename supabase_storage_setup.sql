-- Supabase Storage Setup for User Avatars
-- Run this in your Supabase SQL Editor

-- 1. Create the storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-avatars', 'user-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create RLS policies for the user-avatars bucket

-- Policy: Users can view all avatars (public read)
CREATE POLICY "Public Avatar Access" ON storage.objects
FOR SELECT USING (bucket_id = 'user-avatars');

-- Policy: Users can upload their own avatars
CREATE POLICY "User can upload avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own avatars
CREATE POLICY "User can update own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own avatars
CREATE POLICY "User can delete own avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
