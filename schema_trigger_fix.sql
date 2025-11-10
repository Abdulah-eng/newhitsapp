-- Database Trigger Fix for User Registration
-- This automatically creates a user record when a new auth user signs up
-- Run this in your Supabase SQL Editor

-- ============================================
-- FUNCTION: Auto-create user record on signup
-- ============================================

-- Create a function that will be triggered when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into users table
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'senior')
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent errors if user already exists
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires when a new user is created in auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- UPDATE RLS POLICIES
-- ============================================

-- Drop existing INSERT policy (we don't need it anymore since trigger handles it)
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- But keep it for manual inserts if needed (e.g., admin creating users)
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- UPDATE REGISTRATION FLOW
-- ============================================
-- After running this, you can simplify the registration code:
-- 1. The trigger will automatically create the user record
-- 2. You only need to create the role-specific profile (senior_profiles or specialist_profiles)
-- 3. The insert into users table can be removed from the registration code

