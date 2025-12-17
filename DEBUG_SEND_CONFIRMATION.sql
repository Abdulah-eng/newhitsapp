-- Debug the send-confirmation API 404 issue

-- Check the appointment details
SELECT
    a.id,
    a.senior_id,
    a.specialist_id,
    a.status,
    a.location_type,
    a.created_at,
    senior_user.full_name as senior_name,
    senior_user.email as senior_email,
    specialist_user.full_name as specialist_name,
    specialist_user.email as specialist_email
FROM appointments a
JOIN users senior_user ON a.senior_id = senior_user.id
JOIN users specialist_user ON a.specialist_id = specialist_user.id
WHERE a.id = '8a9a755b-5897-49ce-8398-2eb77eb4ef5d';

-- Check if the senior user exists and has the right role
SELECT
    u.id,
    u.email,
    u.full_name,
    u.role
FROM users u
WHERE u.id = 'ecfa3a31-e579-4cc9-b3cd-cb471d280e77';

-- Check if the specialist user exists and has the right role
SELECT
    u.id,
    u.email,
    u.full_name,
    u.role
FROM users u
WHERE u.id = 'cd9429f1-d362-4d5e-a694-c21b72798f8a';

-- The API call is probably failing because:
-- 1. The user making the API call is not authenticated
-- 2. The user doesn't have permission to access this appointment
-- 3. There's an issue with the API route itself

-- Let's check if there are any other appointments and see the pattern
SELECT
    a.id,
    a.senior_id,
    a.specialist_id,
    a.status,
    a.confirmation_email_sent_at,
    senior_user.full_name as senior_name,
    specialist_user.full_name as specialist_name
FROM appointments a
JOIN users senior_user ON a.senior_id = senior_user.id
JOIN users specialist_user ON a.specialist_id = specialist_user.id
ORDER BY a.created_at DESC
LIMIT 5;