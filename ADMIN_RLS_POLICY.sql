-- RLS Policy for Admin to Update Specialist Verification Status
-- Run this in your Supabase SQL Editor
-- IMPORTANT: This fixes the infinite recursion issue by using a security definer function

-- First, create a function to check if current user is admin (bypasses RLS)
-- This function checks both the users table and email as fallback
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_email TEXT;
BEGIN
  -- First check users table
  IF EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Fallback: check email from auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Return true if email is admin@hitsapp.com
  RETURN COALESCE(user_email, '') = 'admin@hitsapp.com';
END;
$$;

-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Admins can update specialist verification status" ON specialist_profiles;
DROP POLICY IF EXISTS "Admins can view all specialist profiles" ON specialist_profiles;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;

-- Allow admins to update verification_status in specialist_profiles
CREATE POLICY "Admins can update specialist verification status" ON specialist_profiles
    FOR UPDATE 
    USING (is_admin())
    WITH CHECK (is_admin());

-- Allow admins to view all specialist profiles (not just verified ones)
CREATE POLICY "Admins can view all specialist profiles" ON specialist_profiles
    FOR SELECT 
    USING (is_admin());

-- Note: For users table, we don't need a separate admin policy
-- The existing "Authenticated users can view user profiles" policy already allows
-- authenticated users (including admins) to view all users.
-- If you need admins to have special permissions, you can add them here:
-- CREATE POLICY "Admins can view all users" ON users
--     FOR SELECT 
--     USING (is_admin() OR auth.role() = 'authenticated');

-- Allow admins to view all appointments
CREATE POLICY "Admins can view all appointments" ON appointments
    FOR SELECT 
    USING (is_admin());

-- Allow admins to view all payments
CREATE POLICY "Admins can view all payments" ON payments
    FOR SELECT 
    USING (is_admin());

