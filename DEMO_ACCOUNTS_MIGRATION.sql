-- Demo Accounts Migration Script
-- Run this script in your Supabase SQL Editor
-- This script removes old demo accounts and creates new ones

-- ============================================
-- STEP 1: DEACTIVATE OLD DEMO ACCOUNTS
-- ============================================

-- Deactivate old demo accounts in users table
UPDATE users 
SET is_active = false 
WHERE email IN (
  'ashafiq.bese23seecs@seecs.edu.pk',
  'mabdulaharshad@gmail.com',
  'admin@hitsapp.com'
);

-- Note: Auth users will remain in auth.users but will be inactive
-- You may want to delete them from Supabase Auth Dashboard manually if desired

-- ============================================
-- STEP 2: CREATE NEW DEMO ACCOUNTS
-- ============================================
-- Note: These accounts need to be created in Supabase Auth first
-- Then run the INSERT statements below

-- After creating auth users in Supabase Dashboard, get their IDs and run:

-- Senior Demo Account (a_granted@yahoo.com)
-- Replace 'USER_ID_FROM_AUTH' with the actual auth user ID
/*
INSERT INTO users (id, email, full_name, role, is_active)
VALUES (
  'USER_ID_FROM_AUTH',  -- Replace with actual auth user ID
  'a_granted@yahoo.com',
  'Demo Senior User',
  'senior',
  true
)
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_active = true;

-- Create senior profile
INSERT INTO senior_profiles (user_id)
VALUES ('USER_ID_FROM_AUTH')
ON CONFLICT (user_id) DO NOTHING;
*/

-- Specialist Demo Account (access525@yahoo.com)
/*
INSERT INTO users (id, email, full_name, role, is_active)
VALUES (
  'USER_ID_FROM_AUTH',  -- Replace with actual auth user ID
  'access525@yahoo.com',
  'Demo Specialist',
  'specialist',
  true
)
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_active = true;

-- Create specialist profile
INSERT INTO specialist_profiles (user_id, verification_status, hourly_rate, specialties)
VALUES (
  'USER_ID_FROM_AUTH',  -- Replace with actual auth user ID
  'verified',
  30.00,
  ARRAY['General Tech Support', 'Device Setup']
)
ON CONFLICT (user_id) DO UPDATE
SET verification_status = 'verified';
*/

-- Admin Demo Account (admin@hitspecialist.com)
/*
INSERT INTO users (id, email, full_name, role, is_active)
VALUES (
  'USER_ID_FROM_AUTH',  -- Replace with actual auth user ID
  'admin@hitspecialist.com',
  'Admin User',
  'admin',
  true
)
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_active = true;
*/

-- ============================================
-- ALTERNATIVE: USE ADMIN API TO CREATE USERS
-- ============================================
-- Instead of manual SQL, you can use the admin user creation feature
-- in the admin dashboard at /admin/users
-- 
-- Or use the Supabase Admin API to create auth users first,
-- then the INSERT statements above will work

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check old accounts are deactivated
SELECT email, full_name, role, is_active 
FROM users 
WHERE email IN (
  'ashafiq.bese23seecs@seecs.edu.pk',
  'mabdulaharshad@gmail.com',
  'admin@hitsapp.com'
);

-- Check new accounts exist and are active
SELECT email, full_name, role, is_active 
FROM users 
WHERE email IN (
  'a_granted@yahoo.com',
  'access525@yahoo.com',
  'admin@hitspecialist.com'
);

