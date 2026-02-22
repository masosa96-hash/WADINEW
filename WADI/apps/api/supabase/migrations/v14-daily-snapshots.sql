-- Daily snapshots for Cold Freeze monitoring
CREATE TABLE IF NOT EXISTS daily_snapshots (
    date DATE PRIMARY KEY,
    total_projects INT DEFAULT 0,
    crystallize_count INT DEFAULT 0,
    edit_count INT DEFAULT 0,
    return_user_count INT DEFAULT 0,
    avg_llm_duration_ms FLOAT DEFAULT 0,
    structure_failed_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Enable RLS for daily_snapshots (Admin only generally, but for now we follow the project pattern)
ALTER TABLE daily_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read for snapshots" ON daily_snapshots FOR
SELECT TO authenticated USING (true);