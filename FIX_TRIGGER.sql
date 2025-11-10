-- Fix Database Trigger for User Creation
-- The 500 error is likely caused by the trigger failing
-- Run this in your Supabase SQL Editor

-- ============================================
-- DROP AND RECREATE TRIGGER WITH BETTER ERROR HANDLING
-- ============================================

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Try to insert user record, but don't fail if it already exists or if there's an error
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
    ON CONFLICT (id) DO NOTHING; -- Silently ignore if user already exists
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't fail the auth signup
      RAISE WARNING 'Error creating user record: %', SQLERRM;
      -- Return NEW to allow auth signup to succeed
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ALTERNATIVE: DISABLE TRIGGER IF STILL CAUSING ISSUES
-- ============================================
-- If the trigger is still causing problems, you can disable it:
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- 
-- Then rely on the client-side INSERT in the registration code

