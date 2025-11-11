-- Fix RLS Policies for specialist_availability table
-- Run this in your Supabase SQL Editor
-- This fixes the 403 error when specialists try to save their availability

-- ============================================
-- DROP EXISTING POLICIES (if any)
-- ============================================
DROP POLICY IF EXISTS "Specialists can view own availability" ON specialist_availability;
DROP POLICY IF EXISTS "Specialists can insert own availability" ON specialist_availability;
DROP POLICY IF EXISTS "Specialists can update own availability" ON specialist_availability;
DROP POLICY IF EXISTS "Specialists can delete own availability" ON specialist_availability;
DROP POLICY IF EXISTS "Anyone can view verified specialist availability" ON specialist_availability;
DROP POLICY IF EXISTS "Seniors can view verified specialist availability" ON specialist_availability;

-- ============================================
-- SELECT POLICIES
-- ============================================

-- Allow specialists to view their own availability
CREATE POLICY "Specialists can view own availability" ON specialist_availability
    FOR SELECT 
    USING (auth.uid() = specialist_id);

-- Allow anyone (including seniors) to view availability for verified specialists
-- This is needed for booking appointments
CREATE POLICY "Anyone can view verified specialist availability" ON specialist_availability
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM specialist_profiles
            WHERE specialist_profiles.user_id = specialist_availability.specialist_id
            AND specialist_profiles.verification_status = 'verified'
        )
    );

-- ============================================
-- INSERT POLICIES
-- ============================================

-- Allow specialists to insert their own availability
CREATE POLICY "Specialists can insert own availability" ON specialist_availability
    FOR INSERT 
    WITH CHECK (auth.uid() = specialist_id);

-- ============================================
-- UPDATE POLICIES
-- ============================================

-- Allow specialists to update their own availability
CREATE POLICY "Specialists can update own availability" ON specialist_availability
    FOR UPDATE 
    USING (auth.uid() = specialist_id)
    WITH CHECK (auth.uid() = specialist_id);

-- ============================================
-- DELETE POLICIES
-- ============================================

-- Allow specialists to delete their own availability
CREATE POLICY "Specialists can delete own availability" ON specialist_availability
    FOR DELETE 
    USING (auth.uid() = specialist_id);

-- ============================================
-- VERIFY POLICIES
-- ============================================
-- Run this query to verify the policies were created:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE tablename = 'specialist_availability'
-- ORDER BY cmd, policyname;

