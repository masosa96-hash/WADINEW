-- Migration: v5-smoke-index.sql
-- Add noise metrics to projects table

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS noise_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_items_audited INTEGER DEFAULT 0;
