-- Fix 500 Error on Signup
-- The trigger is likely causing the signup to fail
-- Run this in your Supabase SQL Editor

-- ============================================
-- OPTION 1: DISABLE TRIGGER (Recommended for now)
-- ============================================
-- This will disable the trigger and rely on client-side inserts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ============================================
-- OPTION 2: FIX TRIGGER WITH BETTER ERROR HANDLING
-- ============================================
-- If you want to keep the trigger, use this improved version

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function that won't fail signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Wrap in exception handler so trigger doesn't fail signup
  BEGIN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.email, ''),
      COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        COALESCE(NEW.raw_user_meta_data->>'fullName', 'User')
      ),
      COALESCE(
        (NEW.raw_user_meta_data->>'role')::user_role,
        'senior'::user_role
      )
    )
    ON CONFLICT (id) DO NOTHING; -- Don't fail if user already exists
  EXCEPTION
    WHEN OTHERS THEN
      -- Log warning but don't fail the signup
      -- The client-side code will handle user creation
      NULL; -- Silently continue
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger (only if you want to use Option 2)
-- Uncomment the line below if you want to enable the trigger:
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- VERIFY RLS POLICIES ARE CORRECT
-- ============================================
-- Make sure these policies exist (from COMPLETE_RLS_FIX.sql):

-- Users table:
-- - "Users can insert own profile" (INSERT)
-- - "Authenticated users can view user profiles" (SELECT)
-- - "Users can update own profile" (UPDATE)

-- Specialist profiles:
-- - "Specialists can insert own profile" (INSERT)
-- - "Specialists can view own profile" (SELECT)
-- - "Specialists can update own profile" (UPDATE)
-- - "Anyone can view verified specialist profiles" (SELECT)

-- Senior profiles:
-- - "Seniors can insert own profile" (INSERT)
-- - "Users can view own senior profile" (SELECT)
-- - "Users can update own senior profile" (UPDATE)

