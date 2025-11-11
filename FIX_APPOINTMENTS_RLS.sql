-- Fix RLS Policies for appointments table
-- Run this in your Supabase SQL Editor
-- This ensures users can view their own appointments

-- ============================================
-- DROP EXISTING POLICIES (if any)
-- ============================================
DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Seniors can create appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update own appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can view all appointments" ON appointments;

-- ============================================
-- SELECT POLICIES
-- ============================================

-- Allow users to view appointments where they are the senior or specialist
CREATE POLICY "Users can view own appointments" ON appointments
    FOR SELECT 
    USING (auth.uid() = senior_id OR auth.uid() = specialist_id);

-- Allow admins to view all appointments (using is_admin() function if it exists)
-- If is_admin() function doesn't exist, this will fail - run ADMIN_RLS_POLICY.sql first
CREATE POLICY "Admins can view all appointments" ON appointments
    FOR SELECT 
    USING (is_admin());

-- ============================================
-- INSERT POLICIES
-- ============================================

-- Allow seniors to create appointments
CREATE POLICY "Seniors can create appointments" ON appointments
    FOR INSERT 
    WITH CHECK (auth.uid() = senior_id);

-- ============================================
-- UPDATE POLICIES
-- ============================================

-- Allow users to update appointments where they are the senior or specialist
CREATE POLICY "Users can update own appointments" ON appointments
    FOR UPDATE 
    USING (auth.uid() = senior_id OR auth.uid() = specialist_id)
    WITH CHECK (auth.uid() = senior_id OR auth.uid() = specialist_id);

-- ============================================
-- DELETE POLICIES (if needed)
-- ============================================
-- Uncomment if you want to allow users to delete their own appointments
-- CREATE POLICY "Users can delete own appointments" ON appointments
--     FOR DELETE 
--     USING (auth.uid() = senior_id OR auth.uid() = specialist_id);

-- ============================================
-- VERIFY POLICIES
-- ============================================
-- Run this query to verify the policies were created:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'appointments'
-- ORDER BY cmd, policyname;

