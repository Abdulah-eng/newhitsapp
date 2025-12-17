-- Add First Visit Free Benefit Tracking
-- This tracks whether users have used their free first visit benefit
-- Benefits are consumed when appointments are BOOKED (not completed) to prevent abuse
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: Add tracking field to senior_profiles
-- ============================================

-- Add field to track if first visit free benefit has been used
ALTER TABLE senior_profiles
ADD COLUMN IF NOT EXISTS has_used_first_visit_free BOOLEAN DEFAULT FALSE;

-- Add field to track if first online free benefit has been used
ALTER TABLE senior_profiles
ADD COLUMN IF NOT EXISTS has_used_online_first_free BOOLEAN DEFAULT FALSE;

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_senior_profiles_first_visit_free ON senior_profiles(has_used_first_visit_free);
CREATE INDEX IF NOT EXISTS idx_senior_profiles_online_first_free ON senior_profiles(has_used_online_first_free);

-- ============================================
-- STEP 2: Create function to update first visit tracking
-- ============================================

-- Function to mark first visit free as used when appointment is booked
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

-- ============================================
-- STEP 3: Create trigger to automatically track first visit usage
-- ============================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_mark_first_visit_free_used ON appointments;

-- Create trigger to automatically mark first visit benefits as used when appointment is booked
CREATE TRIGGER trigger_mark_first_visit_free_used
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.mark_first_visit_free_used();

-- ============================================
-- STEP 4: Backfill existing data (optional)
-- ============================================

-- For existing users who already have appointments (any status),
-- mark their first visit free benefits as used
-- This prevents existing users from getting free benefits on future bookings
-- Uncomment the following if you want to run this:

-- UPDATE senior_profiles
-- SET has_used_first_visit_free = TRUE
-- WHERE user_id IN (
--   SELECT DISTINCT senior_id
--   FROM appointments
-- );

-- UPDATE senior_profiles
-- SET has_used_online_first_free = TRUE
-- WHERE user_id IN (
--   SELECT DISTINCT senior_id
--   FROM appointments
--   WHERE location_type = 'remote'
-- );

-- ============================================
-- STEP 5: Enable RLS for the new fields
-- ============================================

-- Users can view their own first visit tracking
DROP POLICY IF EXISTS "Users can view own first visit tracking" ON senior_profiles;
CREATE POLICY "Users can view own first visit tracking" ON senior_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Only service role can update first visit tracking (done via trigger)
DROP POLICY IF EXISTS "Service can update first visit tracking" ON senior_profiles;
CREATE POLICY "Service can update first visit tracking" ON senior_profiles
  FOR UPDATE USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');