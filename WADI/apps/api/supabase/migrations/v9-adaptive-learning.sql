-- Migration: v9-adaptive-learning.sql
-- Purpose: Schema for Adaptive Learning System (User Cognitive Profile & Edits Tracking)
-- 1. Logging de ediciones por campo
CREATE TABLE IF NOT EXISTS public.project_edits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    field TEXT NOT NULL,
    original_value TEXT,
    edited_value TEXT,
    diff_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 2. Perfil cognitivo actual (un registro por usuario)
CREATE TABLE IF NOT EXISTS public.user_cognitive_profile_current (
    user_id UUID PRIMARY KEY,
    stack_complexity_score INT DEFAULT 0,
    milestone_length_score INT DEFAULT 0,
    risk_tolerance_score INT DEFAULT 0,
    scope_bias_score INT DEFAULT 0,
    profile_version INT DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 3. Historial de snapshots del perfil
CREATE TABLE IF NOT EXISTS public.user_cognitive_profile_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    profile_snapshot JSONB NOT NULL,
    profile_version INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 4. Versiones en projects para trazabilidad
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS profile_version INT DEFAULT 1,
    ADD COLUMN IF NOT EXISTS prompt_version INT DEFAULT 1;
-- RLS (Security) - Simple owner-based policies
ALTER TABLE public.project_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cognitive_profile_current ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cognitive_profile_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own edits" ON public.project_edits FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own profile" ON public.user_cognitive_profile_current FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own history" ON public.user_cognitive_profile_history FOR
SELECT USING (auth.uid() = user_id);