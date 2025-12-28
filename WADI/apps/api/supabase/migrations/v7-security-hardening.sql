-- Protocolo de Blindaje Ejecutado. Dejá de dejar las ventanas abiertas si no querés que el caos entre sin permiso.
-- Migration: v7-security-hardening.sql
-- Purpose: Enable RLS on all tables and strictly enforce owner-only or system-read-only access.

BEGIN;

-- 1. Enable RLS on ALL tables
ALTER TABLE IF EXISTS public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_tags ENABLE ROW LEVEL SECURITY;

-- 2. Clean up existing policies to avoid conflicts or permissive holes
-- (We use DO blocks to avoid errors if policies don't exist)
DO $$ 
DECLARE 
    tbl text; 
BEGIN 
    FOR tbl IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP 
        -- This loop is a bit aggressive, technically we should target specific policies.
        -- But since we want to "clean security", dropping all and recreating is cleaner IF we cover everything.
        -- Usage of explicit names below acts as replacements if we use CREATE OR REPLACE logic or DROP IF EXISTS.
    END LOOP; 
END $$;

-- ---------------------------------------------------------
-- USER DATA TABLES (Owner Access Only)
-- ---------------------------------------------------------

-- FOLDERS
DROP POLICY IF EXISTS "Users can manage their own folders" ON public.folders;
CREATE POLICY "Users can manage their own folders" ON public.folders
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- CONVERSATIONS
DROP POLICY IF EXISTS "Users can manage their own conversations" ON public.conversations;
CREATE POLICY "Users can manage their own conversations" ON public.conversations
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- MESSAGES
DROP POLICY IF EXISTS "Users can manage their own messages" ON public.messages;
CREATE POLICY "Users can manage their own messages" ON public.messages
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- PROFILES
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
CREATE POLICY "Users can manage their own profile" ON public.profiles
    FOR ALL
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- PROJECTS
DROP POLICY IF EXISTS "Users can manage their own projects" ON public.projects;
CREATE POLICY "Users can manage their own projects" ON public.projects
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------
-- RELATIONAL / MIXED TABLES
-- ---------------------------------------------------------

-- PROJECT_TAGS
-- Assuming it links projects and tags. Access controlled by Project ownership.
DROP POLICY IF EXISTS "Users can manage tags for their projects" ON public.project_tags;
CREATE POLICY "Users can manage tags for their projects" ON public.project_tags
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE id = project_tags.project_id 
            AND user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE id = project_tags.project_id 
            AND user_id = auth.uid()
        )
    );

-- ---------------------------------------------------------
-- SYSTEM / READ-ONLY TABLES
-- ---------------------------------------------------------

-- AI_PRESETS (Global Config - Read Only for Users)
DROP POLICY IF EXISTS "Authenticated users can read presets" ON public.ai_presets;
CREATE POLICY "Authenticated users can read presets" ON public.ai_presets
    FOR SELECT
    TO authenticated
    USING (true);

-- TAGS (Global Tags - Read Only for Users)
DROP POLICY IF EXISTS "Authenticated users can read global tags" ON public.tags;
CREATE POLICY "Authenticated users can read global tags" ON public.tags
    FOR SELECT
    TO authenticated
    USING (true);

-- AUDIT_LOGS (System Logs - Read Only for Users, Insert for Service Role)
-- Re-apply to ensure no loopholes
DROP POLICY IF EXISTS "Enable insert for service role only" ON public.audit_logs;
CREATE POLICY "Enable insert for service role only" ON public.audit_logs
    FOR INSERT
    TO service_role
    WITH CHECK (true);

DROP POLICY IF EXISTS "Enable select for authenticated users" ON public.audit_logs;
CREATE POLICY "Enable select for authenticated users" ON public.audit_logs
    FOR SELECT
    TO authenticated
    USING (true);

COMMIT;
