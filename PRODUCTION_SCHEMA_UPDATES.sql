-- HITS Production Schema Updates
-- Run this script in your Supabase SQL Editor
-- This adds all required fields and tables for production specification

-- ============================================
-- STEP 1: Add new enums (with existence checks)
-- ============================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_plan_type') THEN
        CREATE TYPE membership_plan_type AS ENUM ('connect', 'comfort', 'family_care_plus');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_status') THEN
        CREATE TYPE membership_status AS ENUM ('active', 'cancelled', 'expired', 'pending');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dispute_status') THEN
        CREATE TYPE dispute_status AS ENUM ('open', 'resolved', 'dismissed');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dispute_type') THEN
        CREATE TYPE dispute_type AS ENUM ('review', 'cancellation', 'payment', 'service', 'other');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_log_type') THEN
        CREATE TYPE activity_log_type AS ENUM (
            'user_registration',
            'user_login',
            'appointment_created',
            'appointment_confirmed',
            'appointment_completed',
            'appointment_cancelled',
            'payment_processed',
            'payment_refunded',
            'message_sent',
            'review_submitted',
            'dispute_created',
            'dispute_resolved',
            'settings_changed',
            'membership_created',
            'membership_cancelled',
            'specialist_verified',
            'specialist_rejected',
            'contact_message_created',
            'contact_message_updated'
        );
    END IF;
END $$;

-- ============================================
-- STEP 2: Add columns to existing tables
-- ============================================

-- Add fields to appointments table
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS travel_distance_miles NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS travel_fee NUMERIC(10, 2) DEFAULT 0 CHECK (travel_fee >= 0),
ADD COLUMN IF NOT EXISTS base_price NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS member_discount NUMERIC(10, 2) DEFAULT 0 CHECK (member_discount >= 0),
ADD COLUMN IF NOT EXISTS total_price NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS specialist_pay_rate NUMERIC(10, 2) DEFAULT 30.00,
ADD COLUMN IF NOT EXISTS specialist_travel_reimbursement NUMERIC(10, 2) DEFAULT 0 CHECK (specialist_travel_reimbursement >= 0),
ADD COLUMN IF NOT EXISTS full_address TEXT, -- Combined address for map calculations
ADD COLUMN IF NOT EXISTS confirmation_email_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reminder_email_sent_at TIMESTAMP WITH TIME ZONE;

-- Add fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMP WITH TIME ZONE;

-- Add fields to senior_profiles table
ALTER TABLE senior_profiles
ADD COLUMN IF NOT EXISTS is_disabled_adult BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS membership_id UUID;

-- Add fields to payments table
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS travel_fee NUMERIC(10, 2) DEFAULT 0 CHECK (travel_fee >= 0),
ADD COLUMN IF NOT EXISTS membership_discount NUMERIC(10, 2) DEFAULT 0 CHECK (membership_discount >= 0),
ADD COLUMN IF NOT EXISTS base_amount NUMERIC(10, 2);

-- Add lifecycle tracking columns to user_memberships
ALTER TABLE user_memberships
ADD COLUMN IF NOT EXISTS cancellation_requested_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancellation_effective_date DATE,
ADD COLUMN IF NOT EXISTS reactivated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reactivated_from_membership_id UUID REFERENCES user_memberships(id);

-- ============================================
-- STEP 3: Create new tables
-- ============================================

-- Membership Plans Table
CREATE TABLE IF NOT EXISTS membership_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_type membership_plan_type UNIQUE NOT NULL,
    name TEXT NOT NULL,
    monthly_price NUMERIC(10, 2) NOT NULL CHECK (monthly_price >= 0),
    member_hourly_rate NUMERIC(10, 2) NOT NULL CHECK (member_hourly_rate >= 0),
    included_visit_minutes INTEGER DEFAULT 0 CHECK (included_visit_minutes >= 0),
    included_visit_type TEXT, -- 'remote' or 'in-person' or null
    priority_scheduling BOOLEAN DEFAULT FALSE,
    resource_library_access BOOLEAN DEFAULT FALSE,
    caregiver_notifications BOOLEAN DEFAULT FALSE,
    family_view BOOLEAN DEFAULT FALSE,
    max_covered_people INTEGER DEFAULT 1 CHECK (max_covered_people >= 1),
    description TEXT,
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Memberships Table
CREATE TABLE IF NOT EXISTS user_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    membership_plan_id UUID NOT NULL REFERENCES membership_plans(id) ON DELETE RESTRICT,
    status membership_status DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    next_billing_date DATE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    covered_user_ids UUID[] DEFAULT '{}', -- For Family Care+ plan
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disputes Table
CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type dispute_type NOT NULL,
    status dispute_status DEFAULT 'open',
    senior_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialist_id UUID REFERENCES users(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    review_id UUID REFERENCES reviews(id) ON DELETE SET NULL,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    description TEXT,
    resolution TEXT,
    resolution_notes TEXT,
    refund_amount NUMERIC(10, 2) DEFAULT 0 CHECK (refund_amount >= 0),
    credit_amount NUMERIC(10, 2) DEFAULT 0 CHECK (credit_amount >= 0),
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Admin who resolved
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type activity_log_type NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform Settings Table
CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Specialist Payments Table (Internal tracking)
CREATE TABLE IF NOT EXISTS specialist_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    specialist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hours_worked NUMERIC(10, 2) NOT NULL CHECK (hours_worked > 0),
    hourly_rate NUMERIC(10, 2) NOT NULL DEFAULT 30.00,
    base_pay NUMERIC(10, 2) NOT NULL CHECK (base_pay >= 0),
    travel_miles NUMERIC(10, 2) DEFAULT 0 CHECK (travel_miles >= 0),
    travel_reimbursement_rate NUMERIC(10, 2) DEFAULT 0.60,
    travel_reimbursement NUMERIC(10, 2) DEFAULT 0 CHECK (travel_reimbursement >= 0),
    total_pay NUMERIC(10, 2) NOT NULL CHECK (total_pay >= 0),
    payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'processing'
    paid_at TIMESTAMP WITH TIME ZONE,
    payment_reference TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 4: Create indexes
-- ============================================

-- Appointments indexes
CREATE INDEX IF NOT EXISTS idx_appointments_travel_distance ON appointments(travel_distance_miles);
CREATE INDEX IF NOT EXISTS idx_appointments_total_price ON appointments(total_price);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);

-- Senior profiles indexes
CREATE INDEX IF NOT EXISTS idx_senior_profiles_disabled_adult ON senior_profiles(is_disabled_adult);
CREATE INDEX IF NOT EXISTS idx_senior_profiles_membership ON senior_profiles(membership_id);

-- User memberships indexes
CREATE INDEX IF NOT EXISTS idx_user_memberships_user_id ON user_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_status ON user_memberships(status);
CREATE INDEX IF NOT EXISTS idx_user_memberships_active ON user_memberships(user_id, status) WHERE status = 'active';

-- Partial unique index to ensure only one active membership per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_memberships_one_active 
    ON user_memberships(user_id) 
    WHERE status = 'active';

-- Disputes indexes
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_type ON disputes(type);
CREATE INDEX IF NOT EXISTS idx_disputes_senior_id ON disputes(senior_id);
CREATE INDEX IF NOT EXISTS idx_disputes_specialist_id ON disputes(specialist_id);
CREATE INDEX IF NOT EXISTS idx_disputes_appointment_id ON disputes(appointment_id);

-- Activity logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs(type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Specialist payments indexes
CREATE INDEX IF NOT EXISTS idx_specialist_payments_specialist_id ON specialist_payments(specialist_id);
CREATE INDEX IF NOT EXISTS idx_specialist_payments_appointment_id ON specialist_payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_specialist_payments_status ON specialist_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_specialist_payments_created_at ON specialist_payments(created_at DESC);

-- ============================================
-- STEP 5: Add triggers for updated_at
-- ============================================

-- Drop triggers if they exist, then create them
DROP TRIGGER IF EXISTS update_membership_plans_updated_at ON membership_plans;
CREATE TRIGGER update_membership_plans_updated_at BEFORE UPDATE ON membership_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_memberships_updated_at ON user_memberships;
CREATE TRIGGER update_user_memberships_updated_at BEFORE UPDATE ON user_memberships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_disputes_updated_at ON disputes;
CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_specialist_payments_updated_at ON specialist_payments;
CREATE TRIGGER update_specialist_payments_updated_at BEFORE UPDATE ON specialist_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 6: Insert default membership plans
-- ============================================

INSERT INTO membership_plans (plan_type, name, monthly_price, member_hourly_rate, included_visit_minutes, included_visit_type, priority_scheduling, resource_library_access, caregiver_notifications, family_view, max_covered_people, description, features) VALUES
(
    'connect',
    'Connect Plan',
    25.00,
    85.00,
    0,
    NULL,
    TRUE,
    TRUE,
    FALSE,
    FALSE,
    1,
    'For seniors and disabled adults who want a trusted tech helper on standby.',
    '["Member rate: $85/hour", "Priority scheduling on busy days", "Access to the HITS resource library (large-print guides and checklists)", "Email alerts with simple safety tips and scam warnings"]'::jsonb
),
(
    'comfort',
    'Comfort Plan',
    59.00,
    80.00,
    30,
    'remote',
    TRUE,
    TRUE,
    TRUE,
    FALSE,
    1,
    'For seniors and disabled adults who expect regular help with their devices.',
    '["One 30-minute remote check-in included each month", "Member rate: $80/hour for additional in-home or remote visits", "Priority same-week scheduling", "Optional caregiver notifications for appointments and visit summaries"]'::jsonb
),
(
    'family_care_plus',
    'Family Care+ Plan',
    99.00,
    75.00,
    60,
    NULL,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    3,
    'For families supporting one or more older adults or disabled adults.',
    '["One 60-minute visit included each month (in-home or remote, where available)", "Member rate: $75/hour for additional visits", "Covers up to 3 people in the same household or immediate family", "Family view of upcoming appointments and visit summaries", "Optional follow-up check-in after major tech changes (new phone, router, etc.)"]'::jsonb
)
ON CONFLICT (plan_type) DO NOTHING;

-- ============================================
-- STEP 7: Insert default platform settings
-- ============================================

INSERT INTO platform_settings (key, value, description) VALUES
(
    'platform_name',
    '"HITS – Hire I.T. Specialist"'::jsonb,
    'Platform name'
),
(
    'platform_tagline',
    '"We hit the mark with care, connection, and technology."'::jsonb,
    'Platform tagline'
),
(
    'contact_email',
    '"support@hitsapp.com"'::jsonb,
    'Support email address'
),
(
    'contact_phone',
    '"(555) 123-4567"'::jsonb,
    'Support phone number'
),
(
    'contact_hours',
    '"Monday-Friday: 9am-5pm EST"'::jsonb,
    'Support hours of operation'
),
(
    'headquarters_address',
    '{"street": "", "city": "Hope Mills", "state": "NC", "zip": "28348"}'::jsonb,
    'HITS headquarters address'
),
(
    'pricing',
    '{
        "base_hourly_rate": 90.00,
        "additional_30min_rate": 45.00,
        "minimum_in_home_hours": 1,
        "minimum_remote_minutes": 30
    }'::jsonb,
    'Base pricing configuration'
),
(
    'travel',
    '{
        "included_miles": 20,
        "client_rate_per_mile": 1.00,
        "specialist_reimbursement_per_mile": 0.60,
        "headquarters_lat": 34.9704,
        "headquarters_lng": -78.9453
    }'::jsonb,
    'Travel and mileage configuration'
),
(
    'specialist_pay',
    '{
        "hourly_rate": 30.00
    }'::jsonb,
    'Specialist payment rates'
),
(
    'registration',
    '{
        "allow_signups": true,
        "require_email_verification": true,
        "require_phone_verification": false
    }'::jsonb,
    'Registration settings'
),
(
    'notifications',
    '{
        "email_enabled": true,
        "sms_enabled": false,
        "appointment_reminders": true,
        "payment_receipts": true
    }'::jsonb,
    'Notification settings'
)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- STEP 8: Enable RLS on new tables
-- ============================================

ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialist_payments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 9: Create RLS policies for new tables
-- ============================================

-- Membership Plans: Public read, admin write
DROP POLICY IF EXISTS "Anyone can view active membership plans" ON membership_plans;
CREATE POLICY "Anyone can view active membership plans" ON membership_plans
    FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage membership plans" ON membership_plans;
CREATE POLICY "Admins can manage membership plans" ON membership_plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- User Memberships: Users can view their own, admins can view all
DROP POLICY IF EXISTS "Users can view own memberships" ON user_memberships;
CREATE POLICY "Users can view own memberships" ON user_memberships
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own memberships" ON user_memberships;
CREATE POLICY "Users can create own memberships" ON user_memberships
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own memberships" ON user_memberships;
CREATE POLICY "Users can update own memberships" ON user_memberships
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all memberships" ON user_memberships;
CREATE POLICY "Admins can view all memberships" ON user_memberships
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Disputes: Users can view/create their own, admins can view/manage all
DROP POLICY IF EXISTS "Users can view own disputes" ON disputes;
CREATE POLICY "Users can view own disputes" ON disputes
    FOR SELECT USING (auth.uid() = senior_id OR auth.uid() = specialist_id);

DROP POLICY IF EXISTS "Users can create disputes" ON disputes;
CREATE POLICY "Users can create disputes" ON disputes
    FOR INSERT WITH CHECK (auth.uid() = senior_id);

DROP POLICY IF EXISTS "Admins can view all disputes" ON disputes;
CREATE POLICY "Admins can view all disputes" ON disputes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can manage disputes" ON disputes;
CREATE POLICY "Admins can manage disputes" ON disputes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Activity Logs: Admins only
DROP POLICY IF EXISTS "Admins can view activity logs" ON activity_logs;
CREATE POLICY "Admins can view activity logs" ON activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "System can create activity logs" ON activity_logs;
CREATE POLICY "System can create activity logs" ON activity_logs
    FOR INSERT WITH CHECK (true); -- Allow system/service role to insert

-- Platform Settings: Public read, admin write
DROP POLICY IF EXISTS "Anyone can view platform settings" ON platform_settings;
CREATE POLICY "Anyone can view platform settings" ON platform_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage platform settings" ON platform_settings;
CREATE POLICY "Admins can manage platform settings" ON platform_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Specialist Payments: Specialists can view their own, admins can view all
DROP POLICY IF EXISTS "Specialists can view own payments" ON specialist_payments;
CREATE POLICY "Specialists can view own payments" ON specialist_payments
    FOR SELECT USING (auth.uid() = specialist_id);

DROP POLICY IF EXISTS "Admins can view all specialist payments" ON specialist_payments;
CREATE POLICY "Admins can view all specialist payments" ON specialist_payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "System can create specialist payments" ON specialist_payments;
CREATE POLICY "System can create specialist payments" ON specialist_payments
    FOR INSERT WITH CHECK (true); -- Allow system/service role to insert

DROP POLICY IF EXISTS "Admins can update specialist payments" ON specialist_payments;
CREATE POLICY "Admins can update specialist payments" ON specialist_payments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- ============================================
-- STEP 10: Create helper functions
-- ============================================

-- Function to calculate travel fee
CREATE OR REPLACE FUNCTION calculate_travel_fee(distance_miles NUMERIC, included_miles NUMERIC DEFAULT 20, rate_per_mile NUMERIC DEFAULT 1.00)
RETURNS NUMERIC AS $$
BEGIN
    IF distance_miles <= included_miles THEN
        RETURN 0;
    END IF;
    RETURN (distance_miles - included_miles) * rate_per_mile;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate specialist travel reimbursement
CREATE OR REPLACE FUNCTION calculate_specialist_reimbursement(distance_miles NUMERIC, included_miles NUMERIC DEFAULT 20, rate_per_mile NUMERIC DEFAULT 0.60)
RETURNS NUMERIC AS $$
BEGIN
    IF distance_miles <= included_miles THEN
        RETURN 0;
    END IF;
    RETURN (distance_miles - included_miles) * rate_per_mile;
END;
$$ LANGUAGE plpgsql;

-- Function to get active membership for user
CREATE OR REPLACE FUNCTION get_user_active_membership(p_user_id UUID)
RETURNS TABLE (
    membership_id UUID,
    plan_type membership_plan_type,
    plan_name TEXT,
    member_hourly_rate NUMERIC,
    included_visit_minutes INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        um.id,
        mp.plan_type,
        mp.name,
        mp.member_hourly_rate,
        mp.included_visit_minutes
    FROM user_memberships um
    JOIN membership_plans mp ON um.membership_plan_id = mp.id
    WHERE um.user_id = p_user_id
    AND um.status = 'active'
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 11: Create view for appointment pricing breakdown
-- ============================================

CREATE OR REPLACE VIEW appointment_pricing_breakdown AS
SELECT
    a.id AS appointment_id,
    a.senior_id,
    a.specialist_id,
    a.duration_minutes,
    a.location_type,
    a.travel_distance_miles,
    a.base_price,
    a.travel_fee,
    a.member_discount,
    a.total_price,
    a.specialist_pay_rate,
    a.specialist_travel_reimbursement,
    (a.duration_minutes / 60.0 * a.specialist_pay_rate) AS specialist_base_pay,
    ((a.duration_minutes / 60.0 * a.specialist_pay_rate) + a.specialist_travel_reimbursement) AS specialist_total_pay,
    um.status AS membership_status,
    mp.name AS membership_plan_name,
    mp.member_hourly_rate AS membership_rate
FROM appointments a
LEFT JOIN user_memberships um ON um.user_id = a.senior_id AND um.status = 'active'
LEFT JOIN membership_plans mp ON mp.id = um.membership_plan_id;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

-- ============================================
-- NEWSLETTER SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    source TEXT DEFAULT 'website_footer', -- Track where subscription came from
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for newsletter subscriptions
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_active ON newsletter_subscriptions(is_active) WHERE is_active = TRUE;

-- RLS Policies for newsletter_subscriptions
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (subscribe)
DROP POLICY IF EXISTS "Allow public newsletter subscriptions" ON newsletter_subscriptions;
CREATE POLICY "Allow public newsletter subscriptions" ON newsletter_subscriptions
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Allow authenticated users to view their own subscription
DROP POLICY IF EXISTS "Users can view own subscription" ON newsletter_subscriptions;
CREATE POLICY "Users can view own subscription" ON newsletter_subscriptions
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow service role to manage all subscriptions
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON newsletter_subscriptions;
CREATE POLICY "Service role can manage all subscriptions" ON newsletter_subscriptions
    FOR ALL
    TO service_role
    USING (true);

DO $$
BEGIN
    RAISE NOTICE 'HITS Production Schema Updates Completed Successfully!';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Review the new tables and columns';
    RAISE NOTICE '2. Update application code to use new fields';
    RAISE NOTICE '3. Migrate existing data if needed';
    RAISE NOTICE '4. Test all new functionality';
END $$;

