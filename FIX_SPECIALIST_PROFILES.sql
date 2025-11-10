-- Fix RLS Policies for specialist_profiles INSERT
-- Run this in your Supabase SQL Editor

-- ============================================
-- FIX SPECIALIST_PROFILES POLICIES
-- ============================================

-- Drop all existing policies on specialist_profiles
DROP POLICY IF EXISTS "Anyone can view verified specialist profiles" ON specialist_profiles;
DROP POLICY IF EXISTS "Specialists can update own profile" ON specialist_profiles;
DROP POLICY IF EXISTS "Specialists can insert own profile" ON specialist_profiles;
DROP POLICY IF EXISTS "Specialists can view own profile" ON specialist_profiles;

-- Allow specialists to INSERT their own profile (for registration)
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
-- FIX SENIOR_PROFILES POLICIES (for consistency)
-- ============================================

-- Drop all existing policies on senior_profiles
DROP POLICY IF EXISTS "Users can view own senior profile" ON senior_profiles;
DROP POLICY IF EXISTS "Users can update own senior profile" ON senior_profiles;
DROP POLICY IF EXISTS "Seniors can insert own profile" ON senior_profiles;
DROP POLICY IF EXISTS "Specialists can view senior profiles for appointments" ON senior_profiles;

-- Allow seniors to INSERT their own profile (for registration)
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
-- VERIFICATION
-- ============================================
-- Check policies:
-- SELECT * FROM pg_policies WHERE tablename = 'specialist_profiles';
-- SELECT * FROM pg_policies WHERE tablename = 'senior_profiles';

