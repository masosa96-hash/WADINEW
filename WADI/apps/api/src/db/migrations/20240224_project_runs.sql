-- Create project_runs table to track WADI's autonomous executions
CREATE TABLE IF NOT EXISTS project_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    step_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    -- PENDING, IN_PROGRESS, SUCCESS, FAILED
    logs TEXT,
    error_message TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Enable RLS
ALTER TABLE project_runs ENABLE ROW LEVEL SECURITY;
-- Policies
CREATE POLICY "Users can view runs of their own projects" ON project_runs FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM projects
            WHERE projects.id = project_runs.project_id
                AND projects.user_id = auth.uid()
        )
    );
CREATE POLICY "Admins can view all runs" ON project_runs FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE profiles.id = auth.uid()
                AND profiles.role = 'ADMIN'
        )
    );