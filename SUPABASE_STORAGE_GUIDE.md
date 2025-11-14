# Supabase Storage Setup for User Avatars

## Overview

This guide sets up Supabase Storage to handle user avatar uploads in the TravelGuru application.

## Setup Steps

### 1. Database Migration (if not done already)

First, run the user profile table migration:

```sql
-- Add missing columns to user_profiles table
ALTER TABLE public.user_profiles
ALTER COLUMN phone_number TYPE text USING phone_number::text;

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS nationality text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS emergency_contact_name text,
ADD COLUMN IF NOT EXISTS emergency_contact_phone text,
ADD COLUMN IF NOT EXISTS passport_number text,
ADD COLUMN IF NOT EXISTS travel_preferences text;
```

### 2. Storage Bucket Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-avatars', 'user-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies
CREATE POLICY "Public Avatar Access" ON storage.objects
FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "User can upload avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "User can update own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "User can delete own avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

### 3. Bucket Configuration (Alternative via Supabase Dashboard)

If you prefer using the Supabase Dashboard:

1. Go to Storage > Create bucket
2. Name: `user-avatars`
3. Set as Public: ✅ (checked)
4. Click "Create bucket"

### 4. Features Implemented

#### File Upload

- ✅ Click camera icon to upload image files
- ✅ Supports common image formats (jpg, png, gif, webp)
- ✅ File size validation (max 5MB)
- ✅ Automatic file type validation

#### File Organization

- Files stored in user-specific folders: `user-avatars/{user_id}/avatar-{timestamp}.{ext}`
- Old avatars automatically deleted when new ones are uploaded
- Unique filenames prevent conflicts

#### Security

- ✅ Users can only upload to their own folders
- ✅ Public read access for profile display
- ✅ Row Level Security (RLS) policies applied
- ✅ File type and size validation

#### UX Features

- ✅ Upload progress indicator
- ✅ Success/error messages
- ✅ Fallback to URL input for external images
- ✅ Avatar preview updates immediately
- ✅ Fallback to user initials when no avatar

## Usage

### For Users

1. Open Profile modal from header dropdown
2. Click camera icon on avatar
3. Select image file from device
4. File uploads automatically
5. Avatar updates immediately
6. Can also paste external image URLs in text field

### For Developers

The `handleAvatarUpload` function:

- Validates file type and size
- Deletes old avatar files
- Uploads new file to Supabase Storage
- Updates profile with new URL
- Provides user feedback

## File Structure

```
supabase storage bucket: user-avatars/
├── {user_id_1}/
│   └── avatar-{timestamp}.{ext}
├── {user_id_2}/
│   └── avatar-{timestamp}.{ext}
└── ...
```

## Error Handling

- Invalid file types show error message
- File size limits enforced (5MB max)
- Network errors handled gracefully
- Old file cleanup errors logged but don't block upload

## Security Notes

- Files are organized by user ID to prevent access conflicts
- RLS policies ensure users can only manage their own avatars
- Public bucket allows profile images to be displayed everywhere
- File paths include timestamps to prevent caching issues
