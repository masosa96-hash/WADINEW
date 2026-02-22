-- Migration: v13-optimization-indexes.sql
-- Purpose: Optimize user-specific queries for scale
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_project_edits_user_id ON public.project_edits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cognitive_profile_current_user_id ON public.user_cognitive_profile_current(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cognitive_profile_history_user_id ON public.user_cognitive_profile_history(user_id);
-- Optional: Index for projects by status for analytics
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);