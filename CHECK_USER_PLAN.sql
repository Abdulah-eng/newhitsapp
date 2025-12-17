-- Check what membership plan the user has
-- Replace USER_ID with the actual user ID

SELECT
    u.id,
    u.full_name,
    u.email,
    sp.has_used_first_visit_free,
    sp.has_used_online_first_free,
    um.membership_plan_id,
    mp.plan_type,
    mp.name as plan_name,
    mp.monthly_price,
    mp.service_category
FROM users u
LEFT JOIN senior_profiles sp ON sp.user_id = u.id
LEFT JOIN user_memberships um ON um.user_id = u.id AND um.status = 'active'
LEFT JOIN membership_plans mp ON mp.id = um.membership_plan_id
WHERE u.id = 'ecfa3a31-e579-4cc9-b3cd-cb471d280e77'; -- Replace with actual user ID

-- Also check their appointment history
SELECT
    a.id,
    a.scheduled_at,
    a.duration_minutes,
    a.location_type,
    a.status,
    a.total_price,
    mp.plan_type,
    mp.name as plan_name
FROM appointments a
LEFT JOIN user_memberships um ON um.user_id = a.senior_id AND um.status = 'active'
LEFT JOIN membership_plans mp ON mp.id = um.membership_plan_id
WHERE a.senior_id = 'ecfa3a31-e579-4cc9-b3cd-cb471d280e77'
ORDER BY a.scheduled_at DESC;