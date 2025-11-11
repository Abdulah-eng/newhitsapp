-- Fix Admin Access to View All Data
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: Ensure Admin User Exists in users table
-- ============================================
-- This will create/update the admin user in the users table
DO $$
DECLARE
    admin_auth_id UUID;
BEGIN
    -- Get the auth user ID for admin@hitsapp.com
    SELECT id INTO admin_auth_id
    FROM auth.users
    WHERE email = 'admin@hitsapp.com'
    LIMIT 1;
    
    IF admin_auth_id IS NOT NULL THEN
        -- Insert or update the admin user in users table
        INSERT INTO users (id, email, full_name, role)
        VALUES (
            admin_auth_id,
            'admin@hitsapp.com',
            'Admin User',
            'admin'
        )
        ON CONFLICT (id) DO UPDATE
        SET 
            role = 'admin',
            email = 'admin@hitsapp.com',
            full_name = COALESCE(users.full_name, 'Admin User');
        
        RAISE NOTICE 'Admin user ensured in users table with ID: %', admin_auth_id;
    ELSE
        RAISE NOTICE 'WARNING: Admin user not found in auth.users. Please create the user first in Supabase Auth.';
    END IF;
END $$;

-- ============================================
-- STEP 2: Test is_admin() function
-- ============================================
-- Verify the function exists and works
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'is_admin';

-- ============================================
-- STEP 3: Verify Admin Can See All Specialist Profiles
-- ============================================
-- Test query (should return all profiles if admin is logged in)
-- Run this while logged in as admin to verify
SELECT 
    sp.id,
    sp.user_id,
    sp.verification_status,
    u.email,
    u.full_name,
    sp.created_at
FROM specialist_profiles sp
LEFT JOIN users u ON u.id = sp.user_id
ORDER BY sp.created_at DESC;

-- ============================================
-- STEP 4: Check if specialist_profiles table has any data
-- ============================================
SELECT COUNT(*) as total_profiles,
       COUNT(*) FILTER (WHERE verification_status = 'pending') as pending_count,
       COUNT(*) FILTER (WHERE verification_status = 'verified') as verified_count,
       COUNT(*) FILTER (WHERE verification_status = 'rejected') as rejected_count
FROM specialist_profiles;

-- ============================================
-- STEP 5: Show all specialist users and their profiles
-- ============================================
SELECT 
    u.id as user_id,
    u.email,
    u.full_name,
    u.role,
    CASE 
        WHEN sp.id IS NOT NULL THEN 'Has Profile'
        ELSE 'No Profile'
    END as profile_status,
    sp.verification_status,
    sp.id as profile_id
FROM users u
LEFT JOIN specialist_profiles sp ON sp.user_id = u.id
WHERE u.role = 'specialist'
ORDER BY u.created_at DESC;

