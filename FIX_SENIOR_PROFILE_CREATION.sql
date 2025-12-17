-- Fix Senior Profile Creation During Registration
-- Issue: No INSERT policy for senior_profiles table, so registration fails
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: Add INSERT policy for senior_profiles
-- ============================================

-- Allow users to insert their own senior profile
DROP POLICY IF EXISTS "Users can insert own senior profile" ON senior_profiles;
CREATE POLICY "Users can insert own senior profile" ON senior_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- STEP 2: Alternative - Update registration to use API route
-- ============================================

-- If the INSERT policy still doesn't work due to auth timing issues,
-- modify the registration process to use an API route instead of direct client insert

-- The API route approach (recommended for reliability):
-- 1. Keep the INSERT policy above
-- 2. Or use an API route that uses service role client

-- ============================================
-- STEP 3: Verify the fix works
-- ============================================

-- Test query to check if senior profiles can be created:
-- INSERT INTO senior_profiles (user_id, is_disabled_adult)
-- VALUES ('test-user-id', false);