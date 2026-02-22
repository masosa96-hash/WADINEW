-- Migration: v11-adaptive-analytics.sql
-- Purpose: Track convergence and stability of the adaptive system
CREATE TABLE IF NOT EXISTS public.adaptive_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    avg_edits_per_project FLOAT,
    profile_drift_total FLOAT,
    global_prompt_hits INT,
    sample_size INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_date UNIQUE (date)
);
-- RLS
ALTER TABLE public.adaptive_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view analytics" ON public.adaptive_analytics FOR
SELECT USING (true);