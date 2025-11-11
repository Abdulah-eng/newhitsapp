-- Fix RLS Policies for users table
-- Run this in your Supabase SQL Editor
-- This ensures authenticated users can view user profiles (needed for appointments, messages, etc.)

-- ============================================
-- DROP EXISTING POLICIES (if any)
-- ============================================
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Authenticated users can view user profiles" ON users;

-- ============================================
-- CREATE POLICIES
-- ============================================

-- Allow users to insert their own record (for registration)
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- CRITICAL: Allow authenticated users to view all user profiles
-- This is needed for:
-- - Displaying names in appointments (senior/specialist names)
-- - Displaying names in messages
-- - Displaying names in specialist profiles
-- - Any other feature that needs to show user information
CREATE POLICY "Authenticated users can view user profiles" ON users
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ============================================
-- VERIFY POLICIES
-- ============================================
-- Run this query to verify the policies were created:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'users'
-- ORDER BY cmd, policyname;

