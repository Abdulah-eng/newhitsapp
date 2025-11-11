-- Verify Admin Setup and Fix Issues
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: Verify is_admin() function exists
-- ============================================
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'is_admin';

-- ============================================
-- STEP 2: Check if admin user exists in users table
-- ============================================
-- First, get the auth user ID for admin@hitsapp.com
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'admin@hitsapp.com';

-- Then check if that user exists in the users table
-- Replace 'YOUR_ADMIN_USER_ID' with the actual ID from above
-- SELECT * FROM users WHERE email = 'admin@hitsapp.com';

-- ============================================
-- STEP 3: Create/Update admin user in users table
-- ============================================
-- If admin user doesn't exist in users table, create it
-- First get the auth user ID:
DO $$
DECLARE
    admin_auth_id UUID;
    admin_exists BOOLEAN;
BEGIN
    -- Get the auth user ID
    SELECT id INTO admin_auth_id
    FROM auth.users
    WHERE email = 'admin@hitsapp.com'
    LIMIT 1;
    
    IF admin_auth_id IS NOT NULL THEN
        -- Check if user exists in users table
        SELECT EXISTS(SELECT 1 FROM users WHERE id = admin_auth_id) INTO admin_exists;
        
        IF NOT admin_exists THEN
            -- Create the user record
            INSERT INTO users (id, email, full_name, role)
            VALUES (
                admin_auth_id,
                'admin@hitsapp.com',
                'Admin User',
                'admin'
            )
            ON CONFLICT (id) DO UPDATE
            SET role = 'admin', email = 'admin@hitsapp.com';
            
            RAISE NOTICE 'Admin user created/updated in users table';
        ELSE
            -- Update existing user to ensure role is admin
            UPDATE users
            SET role = 'admin', email = 'admin@hitsapp.com'
            WHERE id = admin_auth_id;
            
            RAISE NOTICE 'Admin user role updated';
        END IF;
    ELSE
        RAISE NOTICE 'Admin user not found in auth.users. Please create the user first.';
    END IF;
END $$;

-- ============================================
-- STEP 4: Verify RLS policies are correct
-- ============================================
-- Check if admin policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('specialist_profiles', 'users', 'appointments', 'payments')
AND policyname LIKE '%admin%' OR policyname LIKE '%Admin%';

-- ============================================
-- STEP 5: Test is_admin() function
-- ============================================
-- This will show if the function works (run as the admin user)
-- SELECT is_admin();

-- ============================================
-- STEP 6: Check all specialist profiles (for debugging)
-- ============================================
-- This should work if RLS policies are correct
-- SELECT id, user_id, verification_status, created_at
-- FROM specialist_profiles
-- ORDER BY created_at DESC;

