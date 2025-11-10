-- H.I.T.S. Platform Database Schema
-- Run this script in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Create custom types/enums
CREATE TYPE user_role AS ENUM ('senior', 'specialist', 'admin');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'in-progress', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'refunded', 'failed');
CREATE TYPE location_type AS ENUM ('remote', 'in-person');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'senior',
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- SENIOR PROFILES TABLE
-- ============================================
CREATE TABLE senior_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    preferred_contact_method TEXT DEFAULT 'email',
    accessibility_needs JSONB DEFAULT '{}',
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for senior profiles
CREATE INDEX idx_senior_profiles_user_id ON senior_profiles(user_id);

-- ============================================
-- SPECIALIST PROFILES TABLE
-- ============================================
CREATE TABLE specialist_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    specialties TEXT[] DEFAULT '{}',
    certifications JSONB DEFAULT '[]',
    hourly_rate NUMERIC(10, 2) NOT NULL,
    service_areas TEXT[] DEFAULT '{}',
    verification_status verification_status DEFAULT 'pending',
    rating_average NUMERIC(3, 2) DEFAULT 0.00 CHECK (rating_average >= 0 AND rating_average <= 5),
    total_reviews INTEGER DEFAULT 0,
    total_appointments INTEGER DEFAULT 0,
    years_experience INTEGER,
    languages_spoken TEXT[] DEFAULT '{}',
    background_check_date DATE,
    insurance_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for specialist profiles
CREATE INDEX idx_specialist_profiles_user_id ON specialist_profiles(user_id);
CREATE INDEX idx_specialist_profiles_verification_status ON specialist_profiles(verification_status);
CREATE INDEX idx_specialist_profiles_rating ON specialist_profiles(rating_average DESC);
CREATE INDEX idx_specialist_profiles_specialties ON specialist_profiles USING GIN(specialties);

-- ============================================
-- SPECIALIST AVAILABILITY TABLE
-- ============================================
CREATE TABLE specialist_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    specialist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(specialist_id, day_of_week, start_time, end_time)
);

-- Index for availability
CREATE INDEX idx_specialist_availability_specialist_id ON specialist_availability(specialist_id);
CREATE INDEX idx_specialist_availability_day ON specialist_availability(day_of_week);

-- ============================================
-- APPOINTMENTS TABLE
-- ============================================
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    senior_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
    status appointment_status DEFAULT 'pending',
    issue_description TEXT NOT NULL,
    location_type location_type NOT NULL DEFAULT 'remote',
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    meeting_link TEXT, -- For remote appointments
    notes TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (
        (location_type = 'remote' AND address IS NULL) OR
        (location_type = 'in-person' AND address IS NOT NULL)
    )
);

-- Indexes for appointments
CREATE INDEX idx_appointments_senior_id ON appointments(senior_id);
CREATE INDEX idx_appointments_specialist_id ON appointments(specialist_id);
CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_senior_status ON appointments(senior_id, status);
CREATE INDEX idx_appointments_specialist_status ON appointments(specialist_id, status);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID UNIQUE NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    senior_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    response_text TEXT, -- Specialist's response to the review
    response_created_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for reviews
CREATE INDEX idx_reviews_specialist_id ON reviews(specialist_id);
CREATE INDEX idx_reviews_senior_id ON reviews(senior_id);
CREATE INDEX idx_reviews_appointment_id ON reviews(appointment_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]', -- Array of file URLs/metadata
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (sender_id != receiver_id)
);

-- Indexes for messages
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_appointment_id ON messages(appointment_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id, created_at DESC);

-- ============================================
-- PAYMENTS TABLE
-- ============================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    senior_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'USD',
    status payment_status DEFAULT 'pending',
    payment_method TEXT,
    stripe_payment_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    refund_amount NUMERIC(10, 2) DEFAULT 0 CHECK (refund_amount >= 0),
    refund_reason TEXT,
    refunded_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for payments
CREATE INDEX idx_payments_appointment_id ON payments(appointment_id);
CREATE INDEX idx_payments_senior_id ON payments(senior_id);
CREATE INDEX idx_payments_specialist_id ON payments(specialist_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_payment_id ON payments(stripe_payment_id);

-- ============================================
-- NOTIFICATIONS TABLE (Optional but recommended)
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'appointment', 'message', 'payment', 'review', etc.
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_senior_profiles_updated_at BEFORE UPDATE ON senior_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_specialist_profiles_updated_at BEFORE UPDATE ON specialist_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_specialist_availability_updated_at BEFORE UPDATE ON specialist_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update specialist rating when review is added/updated
CREATE OR REPLACE FUNCTION update_specialist_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE specialist_profiles
    SET 
        rating_average = (
            SELECT COALESCE(AVG(rating)::NUMERIC(3, 2), 0.00)
            FROM reviews
            WHERE specialist_id = NEW.specialist_id
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM reviews
            WHERE specialist_id = NEW.specialist_id
        )
    WHERE user_id = NEW.specialist_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update rating on review insert/update
CREATE TRIGGER update_rating_on_review_insert
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_specialist_rating();

-- Function to update specialist appointment count
CREATE OR REPLACE FUNCTION update_specialist_appointment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE specialist_profiles
        SET total_appointments = total_appointments + 1
        WHERE user_id = NEW.specialist_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update appointment count
CREATE TRIGGER update_appointment_count
    AFTER UPDATE ON appointments
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE FUNCTION update_specialist_appointment_count();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Note: Enable RLS on tables and configure policies based on your security requirements
-- These are basic examples - adjust based on your needs

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE senior_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialist_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (You may want to customize these)
-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Senior profiles
CREATE POLICY "Users can view own senior profile" ON senior_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own senior profile" ON senior_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Specialist profiles (public read, own write)
CREATE POLICY "Anyone can view verified specialist profiles" ON specialist_profiles
    FOR SELECT USING (verification_status = 'verified');

CREATE POLICY "Specialists can update own profile" ON specialist_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Appointments
CREATE POLICY "Users can view own appointments" ON appointments
    FOR SELECT USING (auth.uid() = senior_id OR auth.uid() = specialist_id);

CREATE POLICY "Seniors can create appointments" ON appointments
    FOR INSERT WITH CHECK (auth.uid() = senior_id);

CREATE POLICY "Users can update own appointments" ON appointments
    FOR UPDATE USING (auth.uid() = senior_id OR auth.uid() = specialist_id);

-- Messages
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Reviews
CREATE POLICY "Anyone can view reviews" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Seniors can create reviews for own appointments" ON reviews
    FOR INSERT WITH CHECK (
        auth.uid() = senior_id AND
        EXISTS (
            SELECT 1 FROM appointments
            WHERE appointments.id = reviews.appointment_id
            AND appointments.senior_id = auth.uid()
        )
    );

-- Payments
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid() = senior_id OR auth.uid() = specialist_id);

-- Notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKETS (For file uploads)
-- ============================================
-- Note: Create these buckets in Supabase Dashboard > Storage
-- Or use the following SQL (if your Supabase version supports it):

-- Avatars bucket
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Documents bucket (for certifications, etc.)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Message attachments bucket
-- INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', false);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- Uncomment and modify as needed for initial testing

/*
-- Sample admin user (you'll need to create auth user first in Supabase Auth)
INSERT INTO users (id, email, role, full_name) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@hits.com', 'admin', 'Admin User');

-- Sample senior user
INSERT INTO users (id, email, role, full_name, phone) VALUES
('00000000-0000-0000-0000-000000000002', 'senior@example.com', 'senior', 'John Senior', '555-0100');

-- Sample specialist user
INSERT INTO users (id, email, role, full_name, phone) VALUES
('00000000-0000-0000-0000-000000000003', 'specialist@example.com', 'specialist', 'Jane Specialist', '555-0200');
*/

-- ============================================
-- END OF SCHEMA
-- ============================================

