-- Debug First Visit Free Trigger
-- Run this to check if the trigger is working and debug any issues

-- ============================================
-- STEP 1: Check if trigger exists
-- ============================================

-- Check if the trigger function exists
SELECT
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc
WHERE proname = 'mark_first_visit_free_used';

-- Check if the trigger exists
SELECT
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgfoid::regproc as function_name
FROM pg_trigger
WHERE tgname = 'trigger_mark_first_visit_free_used';

-- ============================================
-- STEP 2: Check if columns exist
-- ============================================

-- Check if the new columns exist in senior_profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'senior_profiles'
AND column_name IN ('has_used_first_visit_free', 'has_used_online_first_free')
ORDER BY column_name;

-- ============================================
-- STEP 3: Check current data
-- ============================================

-- See current state of senior profiles
SELECT
    sp.user_id,
    u.full_name,
    u.email,
    sp.has_used_first_visit_free,
    sp.has_used_online_first_free,
    sp.created_at,
    sp.updated_at
FROM senior_profiles sp
JOIN users u ON sp.user_id = u.id
ORDER BY sp.created_at DESC
LIMIT 10;

-- ============================================
-- STEP 4: Check recent appointments (all statuses)
-- ============================================

-- See recent appointments that should have triggered the update
-- First visit free is now consumed when appointment is BOOKED (INSERT), not completed
SELECT
    a.id,
    a.senior_id,
    u.full_name as senior_name,
    a.status,
    a.location_type,
    a.created_at,
    sp.has_used_first_visit_free,
    sp.has_used_online_first_free
FROM appointments a
JOIN users u ON a.senior_id = u.id
LEFT JOIN senior_profiles sp ON sp.user_id = a.senior_id
ORDER BY a.created_at DESC
LIMIT 10;

-- ============================================
-- STEP 5: Manual trigger test (run after creating a test appointment)
-- ============================================

-- If you want to test the trigger manually, uncomment and modify this:
/*
-- First, find a senior who has completed appointments but hasn't used first visit free
SELECT sp.user_id, u.full_name, sp.has_used_first_visit_free
FROM senior_profiles sp
JOIN users u ON sp.user_id = u.id
WHERE sp.has_used_first_visit_free = FALSE
AND EXISTS (
    SELECT 1 FROM appointments a
    WHERE a.senior_id = sp.user_id
    AND a.status = 'completed'
);

-- Then manually update to test the logic (replace USER_ID with actual ID)
-- UPDATE senior_profiles
-- SET has_used_first_visit_free = TRUE, updated_at = NOW()
-- WHERE user_id = 'USER_ID';
*/

-- ============================================
-- STEP 6: Fix trigger if needed (run if trigger is missing)
-- ============================================

-- If the trigger is missing, run this to recreate it:
CREATE OR REPLACE FUNCTION public.mark_first_visit_free_used()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger on INSERT (when appointment is first created)
  -- This prevents users from booking multiple free appointments

  -- Check if this is the first appointment ever created for this senior (for first visit free)
  -- Use a more robust check: see if this user has any other appointments
  IF NOT EXISTS (
    SELECT 1 FROM appointments a
    WHERE a.senior_id = NEW.senior_id
    AND a.id != NEW.id  -- Exclude the current appointment being inserted
  ) THEN
    -- This is the first appointment ever for this user
    UPDATE senior_profiles
    SET has_used_first_visit_free = TRUE,
        updated_at = NOW()
    WHERE user_id = NEW.senior_id;

    -- Log the update for debugging
    RAISE NOTICE 'Marked first visit free as used for user % (first appointment booked)', NEW.senior_id;
  END IF;

  -- Check if this is the first remote appointment ever created for this senior (for online free)
  IF NEW.location_type = 'remote' AND NOT EXISTS (
    SELECT 1 FROM appointments a
    WHERE a.senior_id = NEW.senior_id
    AND a.location_type = 'remote'
    AND a.id != NEW.id  -- Exclude the current appointment being inserted
  ) THEN
    -- This is the first remote appointment ever for this user
    UPDATE senior_profiles
    SET has_used_online_first_free = TRUE,
        updated_at = NOW()
    WHERE user_id = NEW.senior_id;

    -- Log the update for debugging
    RAISE NOTICE 'Marked online first free as used for user % (first remote appointment booked)', NEW.senior_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically mark first visit benefits as used when appointment is booked
DROP TRIGGER IF EXISTS trigger_mark_first_visit_free_used ON appointments;
CREATE TRIGGER trigger_mark_first_visit_free_used
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.mark_first_visit_free_used();

-- ============================================
-- STEP 7: Test the trigger manually
-- ============================================

-- To test the trigger, create a new appointment:
-- INSERT INTO appointments (senior_id, specialist_id, scheduled_at, duration_minutes, status, location_type)
-- VALUES ('YOUR_USER_ID', 'SPECIALIST_ID', NOW() + INTERVAL '1 day', 60, 'pending', 'in-person');
--
-- Then check:
-- SELECT * FROM senior_profiles WHERE user_id = 'YOUR_USER_ID';
-- (Check if has_used_first_visit_free changed to true immediately)