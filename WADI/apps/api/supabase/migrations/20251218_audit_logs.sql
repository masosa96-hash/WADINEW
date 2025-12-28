-- Migration script for audit_logs table
-- Created at: 2025-12-18

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT now(),
    error_type TEXT,
    severity TEXT CHECK (severity IN ('Critical', 'Warning', 'Info')),
    scouter_triggered BOOLEAN DEFAULT false,
    details JSONB
);

-- Enable RLS (Row Level Security)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow Service Role (Backend) to Insert
CREATE POLICY "Enable insert for service role only" ON audit_logs
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Policy: Allow Authenticated Users to View (Read-only for debugging if needed, or restrict to detailed roles)
-- For now, allowing read if user is authenticated (simplification for dashboard viewing)
CREATE POLICY "Enable select for authenticated users" ON audit_logs
    FOR SELECT
    TO authenticated
    USING (true);
