-- RLS Policy Fixes for H.I.T.S. Platform
-- Run this AFTER running schema.sql to fix 401 authentication errors
-- Execute this in your Supabase SQL Editor

-- ============================================
-- FIX USERS TABLE POLICIES
-- ============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Allow users to insert their own record (for registration)
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow authenticated users to read basic user info (for messaging, profiles, etc.)
-- This is needed for displaying names in messages, appointments, specialist profiles, etc.
CREATE POLICY "Authenticated users can view user profiles" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- FIX SENIOR PROFILES POLICIES
-- ============================================

-- Allow seniors to insert their own profile
DROP POLICY IF EXISTS "Users can view own senior profile" ON senior_profiles;
DROP POLICY IF EXISTS "Users can update own senior profile" ON senior_profiles;

CREATE POLICY "Seniors can insert own profile" ON senior_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own senior profile" ON senior_profiles
    FOR SELECT USING (auth.uid() = user_id);

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
-- FIX SPECIALIST PROFILES POLICIES
-- ============================================

-- Allow specialists to insert their own profile
CREATE POLICY "Specialists can insert own profile" ON specialist_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update the view policy to allow reading user info
DROP POLICY IF EXISTS "Anyone can view verified specialist profiles" ON specialist_profiles;
DROP POLICY IF EXISTS "Specialists can update own profile" ON specialist_profiles;

-- Allow anyone (including unauthenticated) to view verified specialist profiles
CREATE POLICY "Anyone can view verified specialist profiles" ON specialist_profiles
    FOR SELECT USING (verification_status = 'verified');

-- Allow specialists to view and update their own profile (even if not verified)
CREATE POLICY "Specialists can view own profile" ON specialist_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Specialists can update own profile" ON specialist_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- VERIFICATION
-- ============================================
-- After running this script, verify the policies:
-- SELECT * FROM pg_policies WHERE tablename = 'users';
-- SELECT * FROM pg_policies WHERE tablename = 'specialist_profiles';
