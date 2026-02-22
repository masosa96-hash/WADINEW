-- Migration: v15-ttv-metric.sql
-- Purpose: Track Time-to-Value (TTV) metric for project crystallization
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS ttv_ms BIGINT,
    ADD COLUMN IF NOT EXISTS first_message_at TIMESTAMPTZ;
COMMENT ON COLUMN public.projects.ttv_ms IS 'Milliseconds elapsed between the first chat message and crystallization crystallization.';
COMMENT ON COLUMN public.projects.first_message_at IS 'Timestamp of the first user message in the session that led to this project.';