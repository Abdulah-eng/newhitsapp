-- RLS Policy Fixes for H.I.T.S. Platform (Version 2)
-- Run this AFTER running schema.sql and schema_trigger_fix.sql
-- This ensures all policies work correctly with the trigger

-- ============================================
-- FIX USERS TABLE POLICIES
-- ============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Authenticated users can view user profiles" ON users;

-- Allow authenticated users to read basic user info (for messaging, profiles, etc.)
CREATE POLICY "Authenticated users can view user profiles" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to insert their own record (for manual registration if trigger fails)
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- FIX SENIOR PROFILES POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own senior profile" ON senior_profiles;
DROP POLICY IF EXISTS "Users can update own senior profile" ON senior_profiles;
DROP POLICY IF EXISTS "Seniors can insert own profile" ON senior_profiles;
DROP POLICY IF EXISTS "Specialists can view senior profiles for appointments" ON senior_profiles;

CREATE POLICY "Seniors can insert own profile" ON senior_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own senior profile" ON senior_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own senior profile" ON senior_profiles
    FOR UPDATE USING (auth.uid() = user_id);

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

DROP POLICY IF EXISTS "Anyone can view verified specialist profiles" ON specialist_profiles;
DROP POLICY IF EXISTS "Specialists can update own profile" ON specialist_profiles;
DROP POLICY IF EXISTS "Specialists can insert own profile" ON specialist_profiles;
DROP POLICY IF EXISTS "Specialists can view own profile" ON specialist_profiles;

CREATE POLICY "Specialists can insert own profile" ON specialist_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view verified specialist profiles" ON specialist_profiles
    FOR SELECT USING (verification_status = 'verified');

CREATE POLICY "Specialists can view own profile" ON specialist_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Specialists can update own profile" ON specialist_profiles
    FOR UPDATE USING (auth.uid() = user_id);

