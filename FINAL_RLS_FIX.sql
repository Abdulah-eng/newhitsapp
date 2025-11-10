-- FINAL RLS FIX - Run this to fix all 401 errors
-- This will ensure all INSERT policies are correctly set
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: DISABLE TRIGGER (to avoid conflicts)
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ============================================
-- STEP 2: DROP ALL EXISTING POLICIES
-- ============================================

-- Users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Authenticated users can view user profiles" ON users;

-- Specialist profiles
DROP POLICY IF EXISTS "Anyone can view verified specialist profiles" ON specialist_profiles;
DROP POLICY IF EXISTS "Specialists can update own profile" ON specialist_profiles;
DROP POLICY IF EXISTS "Specialists can insert own profile" ON specialist_profiles;
DROP POLICY IF EXISTS "Specialists can view own profile" ON specialist_profiles;

-- Senior profiles
DROP POLICY IF EXISTS "Users can view own senior profile" ON senior_profiles;
DROP POLICY IF EXISTS "Users can update own senior profile" ON senior_profiles;
DROP POLICY IF EXISTS "Seniors can insert own profile" ON senior_profiles;
DROP POLICY IF EXISTS "Specialists can view senior profiles for appointments" ON senior_profiles;

-- ============================================
-- STEP 3: CREATE USERS TABLE POLICIES
-- ============================================

-- CRITICAL: Allow INSERT for authenticated users (they can insert their own record)
-- This is the key policy that was missing
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Allow authenticated users to read user profiles
CREATE POLICY "Authenticated users can view user profiles" ON users
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE 
    USING (auth.uid() = id);

-- ============================================
-- STEP 4: CREATE SPECIALIST_PROFILES POLICIES
-- ============================================

-- CRITICAL: Allow INSERT for specialists (they can insert their own profile)
-- This is the key policy that was missing
CREATE POLICY "Specialists can insert own profile" ON specialist_profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Allow anyone (including unauthenticated) to view verified specialist profiles
CREATE POLICY "Anyone can view verified specialist profiles" ON specialist_profiles
    FOR SELECT 
    USING (verification_status = 'verified');

-- Allow specialists to view their own profile (even if not verified)
CREATE POLICY "Specialists can view own profile" ON specialist_profiles
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Allow specialists to update their own profile
CREATE POLICY "Specialists can update own profile" ON specialist_profiles
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- ============================================
-- STEP 5: CREATE SENIOR_PROFILES POLICIES
-- ============================================

-- CRITICAL: Allow INSERT for seniors (they can insert their own profile)
CREATE POLICY "Seniors can insert own profile" ON senior_profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own senior profile
CREATE POLICY "Users can view own senior profile" ON senior_profiles
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Allow users to update their own senior profile
CREATE POLICY "Users can update own senior profile" ON senior_profiles
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Allow specialists to view senior profiles for appointments they're involved in
CREATE POLICY "Specialists can view senior profiles for appointments" ON senior_profiles
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM appointments
            WHERE appointments.senior_id = senior_profiles.user_id
            AND appointments.specialist_id = auth.uid()
        )
    );

-- ============================================
-- VERIFICATION
-- ============================================
-- Run these queries to verify policies are created:

-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE tablename IN ('users', 'specialist_profiles', 'senior_profiles')
-- ORDER BY tablename, policyname;

-- ============================================
-- TROUBLESHOOTING
-- ============================================
-- If you still get 401 errors after running this:
-- 1. Make sure you're logged in (check auth.uid() is not null)
-- 2. Verify the session is established before INSERT
-- 3. Check that the user ID matches: auth.uid() = id (for users) or auth.uid() = user_id (for profiles)

