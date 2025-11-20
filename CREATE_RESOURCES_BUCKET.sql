-- Create Resources Storage Bucket in Supabase
-- Run this in your Supabase SQL Editor

-- Create the resources bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can upload resources" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update resources" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete resources" ON storage.objects;
DROP POLICY IF EXISTS "Public can read resources" ON storage.objects;
DROP POLICY IF EXISTS "Service role can manage resources" ON storage.objects;

-- Set up storage policies for the resources bucket
-- Allow authenticated users to upload (admins only in practice)
CREATE POLICY "Authenticated users can upload resources"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resources');

-- Allow authenticated users to update resources
CREATE POLICY "Authenticated users can update resources"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'resources')
WITH CHECK (bucket_id = 'resources');

-- Allow authenticated users to delete resources
CREATE POLICY "Authenticated users can delete resources"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'resources');

-- Allow public to read resources (since bucket is public)
CREATE POLICY "Public can read resources"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resources');

-- Allow service role to manage all resources (for admin operations)
CREATE POLICY "Service role can manage resources"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'resources')
WITH CHECK (bucket_id = 'resources');

-- Verify the bucket was created
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id = 'resources';

