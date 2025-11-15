-- User Management Schema Updates
-- Run this script in your Supabase SQL Editor

-- ============================================
-- ADD is_active FIELD TO USERS TABLE
-- ============================================
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create index for is_active
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Update existing users to be active by default
UPDATE users SET is_active = TRUE WHERE is_active IS NULL;

-- ============================================
-- UPDATE RLS POLICIES TO RESPECT is_active
-- ============================================
-- Users should not be able to log in if is_active = false
-- This will be enforced at the application level, but we can add a policy
-- to prevent inactive users from accessing their data

-- Note: RLS policies will need to check is_active = true for most operations
-- The application should also check is_active before allowing login

