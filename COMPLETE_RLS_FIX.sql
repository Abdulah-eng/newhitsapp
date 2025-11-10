-- COMPLETE RLS FIX for All Tables
-- Run this in your Supabase SQL Editor to fix all 401 errors
-- This includes fixes for users, specialist_profiles, and senior_profiles

-- ============================================
-- FIX USERS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Authenticated users can view user profiles" ON users;

-- Allow INSERT for authenticated users (they can insert their own record)
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow authenticated users to read user profiles
CREATE POLICY "Authenticated users can view user profiles" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- FIX SPECIALIST_PROFILES POLICIES
-- ============================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view verified specialist profiles" ON specialist_profiles;
DROP POLICY IF EXISTS "Specialists can update own profile" ON specialist_profiles;
DROP POLICY IF EXISTS "Specialists can insert own profile" ON specialist_profiles;
DROP POLICY IF EXISTS "Specialists can view own profile" ON specialist_profiles;

-- CRITICAL: Allow specialists to INSERT their own profile (for registration)
CREATE POLICY "Specialists can insert own profile" ON specialist_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow anyone (including unauthenticated) to view verified specialist profiles
CREATE POLICY "Anyone can view verified specialist profiles" ON specialist_profiles
    FOR SELECT USING (verification_status = 'verified');

-- Allow specialists to view their own profile (even if not verified)
CREATE POLICY "Specialists can view own profile" ON specialist_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Allow specialists to update their own profile
CREATE POLICY "Specialists can update own profile" ON specialist_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- FIX SENIOR_PROFILES POLICIES
-- ============================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own senior profile" ON senior_profiles;
DROP POLICY IF EXISTS "Users can update own senior profile" ON senior_profiles;
DROP POLICY IF EXISTS "Seniors can insert own profile" ON senior_profiles;
DROP POLICY IF EXISTS "Specialists can view senior profiles for appointments" ON senior_profiles;

-- CRITICAL: Allow seniors to INSERT their own profile (for registration)
CREATE POLICY "Seniors can insert own profile" ON senior_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own senior profile
CREATE POLICY "Users can view own senior profile" ON senior_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update their own senior profile
CREATE POLICY "Users can update own senior profile" ON senior_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow specialists to view senior profiles for appointments they're involved in
CREATE POLICY "Specialists can view senior profiles for appointments" ON senior_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM appointments
            WHERE appointments.senior_id = senior_profiles.user_id
            AND appointments.specialist_id = auth.uid()
        )
    );

-- ============================================
-- DATABASE TRIGGER (Optional but Recommended)
-- ============================================

-- Function to auto-create user record when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'senior')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    role = COALESCE(EXCLUDED.role, users.role);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify policies are created:

-- SELECT * FROM pg_policies WHERE tablename = 'users';
-- SELECT * FROM pg_policies WHERE tablename = 'specialist_profiles';
-- SELECT * FROM pg_policies WHERE tablename = 'senior_profiles';
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

