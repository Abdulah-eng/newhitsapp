-- HITS Membership Tier Update - PART 1: Schema Changes
-- Run this script FIRST and wait for it to complete before running PART 2
-- This adds the enum values which must be committed before use

-- ============================================
-- STEP 1: Add service_category to membership_plans table
-- ============================================

-- Add service_category column to distinguish between online-only and in-person memberships
ALTER TABLE membership_plans
ADD COLUMN IF NOT EXISTS service_category TEXT DEFAULT 'in-person' CHECK (service_category IN ('online-only', 'in-person'));

-- Create index for efficient filtering by category
CREATE INDEX IF NOT EXISTS idx_membership_plans_service_category ON membership_plans(service_category);

-- ============================================
-- STEP 2: Update membership_plan_type enum to include online-only plans
-- IMPORTANT: These enum values must be committed before they can be used
-- ============================================

-- Add 'starter' enum value if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'starter' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'membership_plan_type')
    ) THEN
        ALTER TYPE membership_plan_type ADD VALUE 'starter';
    END IF;
END $$;

-- Add 'essential' enum value if it doesn't exist  
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'essential' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'membership_plan_type')
    ) THEN
        ALTER TYPE membership_plan_type ADD VALUE 'essential';
    END IF;
END $$;

-- Add 'family' enum value if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'family' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'membership_plan_type')
    ) THEN
        ALTER TYPE membership_plan_type ADD VALUE 'family';
    END IF;
END $$;

-- ============================================
-- STEP 3: Update existing in-person plans to have service_category = 'in-person'
-- ============================================

UPDATE membership_plans
SET service_category = 'in-person'
WHERE service_category IS NULL OR service_category = 'in-person';

