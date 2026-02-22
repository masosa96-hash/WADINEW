-- Migration: v10-global-learning.sql
-- Purpose: Schema for Global Product-Level Adaptive Learning
CREATE TABLE IF NOT EXISTS public.global_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern TEXT NOT NULL UNIQUE,
    frequency FLOAT DEFAULT 0.0,
    confidence_score FLOAT DEFAULT 0.0,
    sample_size INT DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);
-- RLS (Security) - Publicly viewable (read-only for users), admin-only write
ALTER TABLE public.global_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view global patterns" ON public.global_patterns FOR
SELECT USING (true);