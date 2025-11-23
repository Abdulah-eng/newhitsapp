-- HITS Membership Tier Update - PART 2: Insert Online-Only Plans
-- Run this script AFTER PART 1 has completed successfully
-- The enum values from PART 1 must be committed before these INSERT statements

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

