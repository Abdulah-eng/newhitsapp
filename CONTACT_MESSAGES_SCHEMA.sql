-- Contact Messages Table for storing contact form submissions
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    user_type TEXT NOT NULL, -- Senior / Disabled Adult, Caregiver, Partner, Specialist, Other
    topic TEXT NOT NULL, -- Billing, Appointment, Technical Issue, Safety Concern, General Question
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'in_progress', 'resolved', 'archived')),
    admin_notes TEXT,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- If submitted by logged-in user
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for contact_messages
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_user_id ON contact_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_topic ON contact_messages(topic);

-- RLS Policies for contact_messages
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all contact messages
CREATE POLICY "Admins can view all contact messages"
    ON contact_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND (users.role = 'admin' OR users.email = 'admin@hitsapp.com')
        )
    );

-- Policy: Admins can update contact messages
CREATE POLICY "Admins can update contact messages"
    ON contact_messages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND (users.role = 'admin' OR users.email = 'admin@hitsapp.com')
        )
    );

-- Policy: Anyone can insert contact messages (public form)
-- This policy allows anonymous users to submit contact forms
CREATE POLICY "Anyone can create contact messages"
    ON contact_messages FOR INSERT
    WITH CHECK (true);

-- Alternative: If the above doesn't work, try this more explicit policy:
-- DROP POLICY IF EXISTS "Anyone can create contact messages" ON contact_messages;
-- CREATE POLICY "Anyone can create contact messages"
--     ON contact_messages FOR INSERT
--     TO anon, authenticated
--     WITH CHECK (true);

-- Add activity log type for contact messages
-- Note: This assumes activity_log_type enum already exists
-- If not, you may need to add 'contact_message_created' to the enum first

