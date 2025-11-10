-- DEFINITIVE FIX for 401 Errors
-- This will completely reset and recreate all RLS policies
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: DISABLE TRIGGER
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ============================================
-- STEP 2: VERIFY RLS IS ENABLED
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE senior_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: DROP ALL EXISTING POLICIES (Clean Slate)
-- ============================================

-- Users
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view own profile" ON users;
    DROP POLICY IF EXISTS "Users can update own profile" ON users;
    DROP POLICY IF EXISTS "Users can insert own profile" ON users;
    DROP POLICY IF EXISTS "Authenticated users can view user profiles" ON users;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Specialist profiles
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Anyone can view verified specialist profiles" ON specialist_profiles;
    DROP POLICY IF EXISTS "Specialists can update own profile" ON specialist_profiles;
    DROP POLICY IF EXISTS "Specialists can insert own profile" ON specialist_profiles;
    DROP POLICY IF EXISTS "Specialists can view own profile" ON specialist_profiles;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Senior profiles
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view own senior profile" ON senior_profiles;
    DROP POLICY IF EXISTS "Users can update own senior profile" ON senior_profiles;
    DROP POLICY IF EXISTS "Seniors can insert own profile" ON senior_profiles;
    DROP POLICY IF EXISTS "Specialists can view senior profiles for appointments" ON senior_profiles;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================
-- STEP 4: CREATE USERS TABLE POLICIES
-- ============================================

-- INSERT: Users can insert their own record
CREATE POLICY "users_insert_own" ON users
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- SELECT: Authenticated users can view all user profiles
CREATE POLICY "users_select_authenticated" ON users
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- UPDATE: Users can update their own profile
CREATE POLICY "users_update_own" ON users
    FOR UPDATE 
    USING (auth.uid() = id);

-- ============================================
-- STEP 5: CREATE SPECIALIST_PROFILES POLICIES
-- ============================================

-- INSERT: Specialists can insert their own profile
CREATE POLICY "specialist_profiles_insert_own" ON specialist_profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- SELECT: Anyone can view verified specialist profiles
CREATE POLICY "specialist_profiles_select_verified" ON specialist_profiles
    FOR SELECT 
    USING (verification_status = 'verified');

-- SELECT: Specialists can view their own profile (even if not verified)
CREATE POLICY "specialist_profiles_select_own" ON specialist_profiles
    FOR SELECT 
    USING (auth.uid() = user_id);

-- UPDATE: Specialists can update their own profile
CREATE POLICY "specialist_profiles_update_own" ON specialist_profiles
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- ============================================
-- STEP 6: CREATE SENIOR_PROFILES POLICIES
-- ============================================

-- INSERT: Seniors can insert their own profile
CREATE POLICY "senior_profiles_insert_own" ON senior_profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- SELECT: Users can view their own senior profile
CREATE POLICY "senior_profiles_select_own" ON senior_profiles
    FOR SELECT 
    USING (auth.uid() = user_id);

-- UPDATE: Users can update their own senior profile
CREATE POLICY "senior_profiles_update_own" ON senior_profiles
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- SELECT: Specialists can view senior profiles for appointments
CREATE POLICY "senior_profiles_select_appointments" ON senior_profiles
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM appointments
            WHERE appointments.senior_id = senior_profiles.user_id
            AND appointments.specialist_id = auth.uid()
        )
    );

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify:

-- Check users policies
-- SELECT policyname, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename = 'users';

-- Check specialist_profiles policies
-- SELECT policyname, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename = 'specialist_profiles';

-- Check senior_profiles policies
-- SELECT policyname, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename = 'senior_profiles';

