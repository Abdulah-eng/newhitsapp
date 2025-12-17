-- Quick Debug: Check if first visit free trigger is working
-- Run this in Supabase SQL Editor

-- Check if the new columns exist
SELECT
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'senior_profiles'
AND column_name IN ('has_used_first_visit_free', 'has_used_online_first_free');

-- Check if trigger exists
SELECT
    tgname as trigger_name,
    tgenabled as enabled
FROM pg_trigger
WHERE tgname = 'trigger_mark_first_visit_free_used';

-- Check recent appointments and their senior profile status
SELECT
    a.id,
    a.senior_id,
    a.status,
    a.location_type,
    a.created_at,
    sp.has_used_first_visit_free,
    sp.has_used_online_first_free,
    sp.updated_at
FROM appointments a
LEFT JOIN senior_profiles sp ON sp.user_id = a.senior_id
ORDER BY a.created_at DESC
LIMIT 5;

-- Check if any seniors have the flag set to true
SELECT
    sp.user_id,
    u.full_name,
    sp.has_used_first_visit_free,
    sp.has_used_online_first_free,
    sp.updated_at
FROM senior_profiles sp
JOIN users u ON sp.user_id = u.id
WHERE sp.has_used_first_visit_free = true
   OR sp.has_used_online_first_free = true;

-- Check if the specific appointment from the error exists
SELECT
    a.id,
    a.senior_id,
    a.specialist_id,
    a.status,
    a.location_type,
    a.created_at,
    u.full_name as senior_name
FROM appointments a
JOIN users u ON a.senior_id = u.id
WHERE a.id = '8a9a755b-5897-49ce-8398-2eb77eb4ef5d';

-- If trigger is missing, run this to create it:
-- (Copy from FIRST_VISIT_FREE_TRACKING.sql)