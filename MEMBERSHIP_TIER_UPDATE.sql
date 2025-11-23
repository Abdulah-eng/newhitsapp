-- HITS Membership Tier Update
-- Adds support for two separate membership systems:
-- 1. Online-Only Membership Tier (Concierge/Consumer Page): Starter, Essential, Family
-- 2. In-Person Membership Tier (Main Pricing Page): Connect, Comfort, Family Care+
--
-- IMPORTANT: Due to PostgreSQL enum limitations, this script has been split into two parts.
-- If you encounter "unsafe use of new value" errors, use the split scripts instead:
-- 1. Run MEMBERSHIP_TIER_UPDATE_PART1.sql first (adds enum values)
-- 2. Wait for it to complete, then run MEMBERSHIP_TIER_UPDATE_PART2.sql (inserts plans)

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
-- IMPORTANT: Enum values must be committed before they can be used in INSERT statements
-- Each ALTER TYPE statement will commit separately
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

-- ============================================
-- STEP 4: Insert online-only membership plans
-- ============================================

-- Starter Plan (Online-Only)
INSERT INTO membership_plans (
    plan_type,
    name,
    monthly_price,
    member_hourly_rate,
    included_visit_minutes,
    included_visit_type,
    priority_scheduling,
    resource_library_access,
    caregiver_notifications,
    family_view,
    max_covered_people,
    description,
    features,
    service_category,
    is_active
) VALUES (
    'starter'::membership_plan_type,
    'Starter',
    39.00,
    0.00, -- Online-only plans don't have hourly rates for in-person visits
    0,
    'remote', -- All online-only plans are remote
    FALSE,
    TRUE, -- Unlimited access to guide library
    FALSE,
    FALSE,
    1,
    'Ideal for staying connected and solving occasional tech hiccups.',
    '["1 live concierge session / month", "Unlimited access to guide library", "Security alerts & scam watch"]'::jsonb,
    'online-only',
    TRUE
) ON CONFLICT (plan_type) DO UPDATE SET
    name = EXCLUDED.name,
    monthly_price = EXCLUDED.monthly_price,
    member_hourly_rate = EXCLUDED.member_hourly_rate,
    included_visit_minutes = EXCLUDED.included_visit_minutes,
    included_visit_type = EXCLUDED.included_visit_type,
    priority_scheduling = EXCLUDED.priority_scheduling,
    resource_library_access = EXCLUDED.resource_library_access,
    caregiver_notifications = EXCLUDED.caregiver_notifications,
    family_view = EXCLUDED.family_view,
    max_covered_people = EXCLUDED.max_covered_people,
    description = EXCLUDED.description,
    features = EXCLUDED.features,
    service_category = EXCLUDED.service_category,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Essential Plan (Online-Only)
INSERT INTO membership_plans (
    plan_type,
    name,
    monthly_price,
    member_hourly_rate,
    included_visit_minutes,
    included_visit_type,
    priority_scheduling,
    resource_library_access,
    caregiver_notifications,
    family_view,
    max_covered_people,
    description,
    features,
    service_category,
    is_active
) VALUES (
    'essential'::membership_plan_type,
    'Essentials',
    69.00,
    0.00,
    0,
    'remote',
    TRUE, -- Priority same-day scheduling
    TRUE,
    FALSE,
    FALSE,
    1,
    'Best for active users who want consistent coaching and rapid help.',
    '["3 live concierge sessions / month", "Priority same-day scheduling", "Quarterly digital wellness review"]'::jsonb,
    'online-only',
    TRUE
) ON CONFLICT (plan_type) DO UPDATE SET
    name = EXCLUDED.name,
    monthly_price = EXCLUDED.monthly_price,
    member_hourly_rate = EXCLUDED.member_hourly_rate,
    included_visit_minutes = EXCLUDED.included_visit_minutes,
    included_visit_type = EXCLUDED.included_visit_type,
    priority_scheduling = EXCLUDED.priority_scheduling,
    resource_library_access = EXCLUDED.resource_library_access,
    caregiver_notifications = EXCLUDED.caregiver_notifications,
    family_view = EXCLUDED.family_view,
    max_covered_people = EXCLUDED.max_covered_people,
    description = EXCLUDED.description,
    features = EXCLUDED.features,
    service_category = EXCLUDED.service_category,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Family Plan (Online-Only)
INSERT INTO membership_plans (
    plan_type,
    name,
    monthly_price,
    member_hourly_rate,
    included_visit_minutes,
    included_visit_type,
    priority_scheduling,
    resource_library_access,
    caregiver_notifications,
    family_view,
    max_covered_people,
    description,
    features,
    service_category,
    is_active
) VALUES (
    'family'::membership_plan_type,
    'Family+',
    119.00,
    0.00,
    0,
    'remote',
    TRUE,
    TRUE,
    TRUE, -- Caregiver coordination hub
    TRUE, -- Family progress dashboard
    3, -- Covers up to 3 people
    'Share support with loved ones while keeping everyone informed and safe.',
    '["Unlimited live sessions for household", "Family progress dashboard", "Caregiver coordination hub"]'::jsonb,
    'online-only',
    TRUE
) ON CONFLICT (plan_type) DO UPDATE SET
    name = EXCLUDED.name,
    monthly_price = EXCLUDED.monthly_price,
    member_hourly_rate = EXCLUDED.member_hourly_rate,
    included_visit_minutes = EXCLUDED.included_visit_minutes,
    included_visit_type = EXCLUDED.included_visit_type,
    priority_scheduling = EXCLUDED.priority_scheduling,
    resource_library_access = EXCLUDED.resource_library_access,
    caregiver_notifications = EXCLUDED.caregiver_notifications,
    family_view = EXCLUDED.family_view,
    max_covered_people = EXCLUDED.max_covered_people,
    description = EXCLUDED.description,
    features = EXCLUDED.features,
    service_category = EXCLUDED.service_category,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ============================================
-- STEP 5: Verify data
-- ============================================

-- Check that we have both categories
SELECT 
    service_category,
    COUNT(*) as plan_count,
    array_agg(name ORDER BY monthly_price) as plans
FROM membership_plans
WHERE is_active = TRUE
GROUP BY service_category;

