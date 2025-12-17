-- FIXED Test the First Visit Free Trigger
-- Replace the USER_ID_HERE with the actual user ID from your database

-- First, find a senior who hasn't used first visit free yet
SELECT
    sp.user_id,
    u.full_name,
    sp.has_used_first_visit_free,
    sp.has_used_online_first_free
FROM senior_profiles sp
JOIN users u ON sp.user_id = u.id
WHERE sp.has_used_first_visit_free = false
ORDER BY sp.created_at DESC
LIMIT 3;

-- USE THIS USER ID: ecfa3a31-e579-4cc9-b3cd-cb471d280e77 (Muhammad Abdullah Arshad)
-- Check how many appointments they currently have
SELECT COUNT(*) as appointment_count
FROM appointments
WHERE senior_id = 'ecfa3a31-e579-4cc9-b3cd-cb471d280e77';

-- The user already has 1 appointment, so the trigger SHOULD NOT fire
-- because it's not their first appointment

-- Let's test with a user who has 0 appointments
-- Find users with 0 appointments
SELECT
    sp.user_id,
    u.full_name,
    COUNT(a.id) as appointment_count,
    sp.has_used_first_visit_free
FROM senior_profiles sp
JOIN users u ON sp.user_id = u.id
LEFT JOIN appointments a ON a.senior_id = sp.user_id
GROUP BY sp.user_id, u.full_name, sp.has_used_first_visit_free
HAVING COUNT(a.id) = 0
LIMIT 3;

-- Pick a user with 0 appointments and test the trigger
-- Replace USER_ID_ZERO with the actual user ID from above
/*
-- Check their current status
SELECT has_used_first_visit_free, has_used_online_first_free
FROM senior_profiles
WHERE user_id = 'USER_ID_ZERO';

-- Create a test appointment (this should trigger the function)
INSERT INTO appointments (
    senior_id,
    specialist_id,
    scheduled_at,
    duration_minutes,
    status,
    location_type,
    issue_description
)
VALUES (
    'USER_ID_ZERO',
    'cd9429f1-d362-4d5e-a694-c21b72798f8a',  -- Use the same specialist ID
    NOW() + INTERVAL '1 day',
    60,
    'pending',
    'in-person',
    'Test appointment for trigger - should be first appointment'
);

-- Check if the trigger worked (should now be TRUE)
SELECT
    sp.has_used_first_visit_free,
    sp.has_used_online_first_free,
    sp.updated_at
FROM senior_profiles sp
WHERE sp.user_id = 'USER_ID_ZERO';

-- Clean up: delete the test appointment
DELETE FROM appointments WHERE issue_description = 'Test appointment for trigger - should be first appointment';
*/