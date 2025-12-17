-- Test the First Visit Free Trigger
-- Run this in Supabase to manually test if the trigger works

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

-- Pick one user ID from above (replace USER_ID_HERE)
-- Check how many appointments they currently have
SELECT COUNT(*) as appointment_count
FROM appointments
WHERE senior_id = 'USER_ID_HERE';

-- Now manually insert a test appointment to trigger the function
-- (This will test if the trigger fires)
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
    'USER_ID_HERE',  -- Replace with actual user ID
    '00000000-0000-0000-0000-000000000000',  -- Dummy specialist ID
    NOW() + INTERVAL '1 day',
    60,
    'pending',
    'in-person',
    'Test appointment for trigger'
);

-- Check if the trigger worked
SELECT
    sp.has_used_first_visit_free,
    sp.has_used_online_first_free,
    sp.updated_at
FROM senior_profiles sp
WHERE sp.user_id = 'USER_ID_HERE';

-- Clean up: delete the test appointment
-- DELETE FROM appointments WHERE issue_description = 'Test appointment for trigger';