-- Resources Table for HITS Platform
-- Run this script in your Supabase SQL Editor

-- ============================================
-- RESOURCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER, -- in bytes
    file_type TEXT, -- 'pdf', 'doc', 'docx', etc.
    access_level TEXT NOT NULL DEFAULT 'free', -- 'free' or 'members_only'
    category TEXT, -- optional category for organization
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Indexes for resources
CREATE INDEX IF NOT EXISTS idx_resources_access_level ON resources(access_level);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_is_active ON resources(is_active);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at DESC);

-- Enable RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resources
-- Anyone can read free resources
CREATE POLICY "Anyone can view free resources"
    ON resources FOR SELECT
    USING (access_level = 'free' AND is_active = true);

-- Members can read members_only resources
CREATE POLICY "Members can view members_only resources"
    ON resources FOR SELECT
    USING (
        (access_level = 'members_only' AND is_active = true) AND
        EXISTS (
            SELECT 1 FROM user_memberships
            WHERE user_memberships.user_id = auth.uid()
            AND user_memberships.status = 'active'
        )
    );

-- Admins can do everything
CREATE POLICY "Admins can manage all resources"
    ON resources FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND (users.role = 'admin' OR users.email = 'admin@hitspecialist.com')
        )
    );

