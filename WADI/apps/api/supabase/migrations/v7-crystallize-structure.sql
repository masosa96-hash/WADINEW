-- Migration: v7-crystallize-structure.sql
-- Purpose: Add structure JSONB and structure_version to projects for Crystallize v1
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS structure JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS structure_version INT DEFAULT 1,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
-- Optional GIN index for future structure queries
CREATE INDEX IF NOT EXISTS idx_projects_structure_gin ON public.projects USING GIN (structure);