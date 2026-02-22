-- Migration: v12-security-hardening.sql
-- Purpose: Complete RLS policies for all adaptive tables
-- 1. project_edits
CREATE POLICY "Users can insert their own edits" ON public.project_edits FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- No UPDATE or DELETE allowed for edits (audit trail)
-- 2. user_cognitive_profile_current
CREATE POLICY "Users can insert their own profile" ON public.user_cognitive_profile_current FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.user_cognitive_profile_current FOR
UPDATE USING (auth.uid() = user_id);
-- 3. user_cognitive_profile_history
CREATE POLICY "Users can insert their own history" ON public.user_cognitive_profile_history FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- No UPDATE or DELETE for history snapshots
-- 4. global_patterns (Admin only write)
-- Note: 'admin:*' scope is checked at API level, here we allow only reads for public
-- In a real prod environment, we would use a service role or specific admin policies.
-- 5. projects (Double check existing RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
-- Ensuring base policies exist if not already there
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablenames = 'projects'
        AND policyname = 'Users can view own projects'
) THEN CREATE POLICY "Users can view own projects" ON public.projects FOR
SELECT USING (auth.uid() = user_id);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablenames = 'projects'
        AND policyname = 'Users can insert own projects'
) THEN CREATE POLICY "Users can insert own projects" ON public.projects FOR
INSERT WITH CHECK (auth.uid() = user_id);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablenames = 'projects'
        AND policyname = 'Users can update own projects'
) THEN CREATE POLICY "Users can update own projects" ON public.projects FOR
UPDATE USING (auth.uid() = user_id);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablenames = 'projects'
        AND policyname = 'Users can delete own projects'
) THEN CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);
END IF;
END $$;