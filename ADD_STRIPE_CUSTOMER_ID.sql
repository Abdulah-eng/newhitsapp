-- Quick fix: Add stripe_customer_id column to users table
-- Run this in your Supabase SQL Editor

ALTER TABLE users
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'stripe_customer_id';

