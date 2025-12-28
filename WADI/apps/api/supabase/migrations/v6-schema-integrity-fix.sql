-- Migration: v6-schema-integrity-fix.sql
-- Purpose: Ensure all required tables and columns for gamification and core logic exist.
-- Including redundant checks for v4 and v5 features to fix any "missing column" 500 errors.

-- 1. PROFILES (Gamification)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure Gamification Columns Exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS efficiency_rank TEXT DEFAULT 'GENERADOR_DE_HUMO';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS efficiency_points INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_focus TEXT;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies (Re-define to ensure they exist)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
    CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
    
    EXCEPTION WHEN OTHERS THEN NULL; -- Ignore policy creation errors if any weird race condition
END $$;


-- 2. PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure v5 Columns Exist (Smoke Index)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS noise_count INTEGER DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS total_items_audited INTEGER DEFAULT 0;

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Projects Policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view only their own projects" ON public.projects;
    CREATE POLICY "Users can view only their own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert their own projects" ON public.projects;
    CREATE POLICY "Users can insert their own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
    CREATE POLICY "Users can update their own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
    CREATE POLICY "Users can delete their own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

    EXCEPTION WHEN OTHERS THEN NULL;
END $$;


-- 3. RUNS
CREATE TABLE IF NOT EXISTS public.runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;

-- Runs Policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view only their own runs" ON public.runs;
    CREATE POLICY "Users can view only their own runs" ON public.runs FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert their own runs" ON public.runs;
    CREATE POLICY "Users can insert their own runs" ON public.runs FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update their own runs" ON public.runs;
    CREATE POLICY "Users can update their own runs" ON public.runs FOR UPDATE USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete their own runs" ON public.runs;
    CREATE POLICY "Users can delete their own runs" ON public.runs FOR DELETE USING (auth.uid() = user_id);
    
    EXCEPTION WHEN OTHERS THEN NULL;
END $$;
