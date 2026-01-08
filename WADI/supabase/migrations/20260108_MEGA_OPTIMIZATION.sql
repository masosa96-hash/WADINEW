-- MEGA-MIGRATION: 20260108_WADI_OPTIMIZED_V1.sql
-- COMBINES: Performance Indexes + RLS Hardening + Multi-Column detection.
-- Use this script as a SINGLE execution in Supabase SQL Editor.
BEGIN;
---------------------------------------------------------
-- 1. INDICES DE TERCERA GENERACIÓN (Turbo Mode)
---------------------------------------------------------
-- Conversaciones y Mensajes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations (user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages (user_id);
-- Proyectos y Corridas
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects (user_id);
CREATE INDEX IF NOT EXISTS idx_runs_user_id ON public.runs (user_id);
-- Folders y Documentos
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON public.folders (user_id);
CREATE INDEX IF NOT EXISTS idx_documents_folder_id ON public.documents (folder_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents (user_id);
-- Workspace Members
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON public.workspace_members (workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON public.workspace_members (user_id);
---------------------------------------------------------
-- 2. BLOQUE PROCEDURAL (RLS & DYNAMIC COLUMNS)
---------------------------------------------------------
DO $BODY$
DECLARE pol record;
BEGIN -- A. Detección de columna para Índices de Workspaces
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'workspaces'
        AND column_name = 'user_id'
) THEN IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
        AND tablename = 'workspaces'
        AND indexname = 'idx_workspaces_user_id'
) THEN EXECUTE 'CREATE INDEX idx_workspaces_user_id ON public.workspaces (user_id)';
END IF;
END IF;
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'workspaces'
        AND column_name = 'owner_id'
) THEN IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
        AND tablename = 'workspaces'
        AND indexname = 'idx_workspaces_owner_id'
) THEN EXECUTE 'CREATE INDEX idx_workspaces_owner_id ON public.workspaces (owner_id)';
END IF;
END IF;
-- B. Limpieza de Políticas "Fantasmales" (Legacy cleanup)
FOR pol IN
SELECT policyname,
    tablename
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN (
        'ai_presets',
        'tags',
        'conversations',
        'messages',
        'projects',
        'runs',
        'folders',
        'documents',
        'profiles',
        'project_tags',
        'user_usage',
        'wadi_cloud_reports',
        'workspace_members',
        'workspaces',
        'audit_logs'
    )
    AND policyname NOT LIKE 'strict_%'
    AND policyname NOT LIKE 'optimized_%' LOOP EXECUTE format(
        'DROP POLICY IF EXISTS %I ON public.%I',
        pol.policyname,
        pol.tablename
    );
END LOOP;
-- C. Aplicación de Políticas Estrictas (TO authenticated)
-- PROFILES
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'user_id'
) THEN EXECUTE 'DROP POLICY IF EXISTS "strict_owner_all_profiles" ON public.profiles';
EXECUTE 'CREATE POLICY "strict_owner_all_profiles" ON public.profiles FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id)';
ELSIF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'id'
) THEN EXECUTE 'DROP POLICY IF EXISTS "strict_owner_all_profiles" ON public.profiles';
EXECUTE 'CREATE POLICY "strict_owner_all_profiles" ON public.profiles FOR ALL TO authenticated USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id)';
END IF;
-- CONVERSATIONS
IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = 'conversations'
) THEN EXECUTE 'DROP POLICY IF EXISTS "strict_owner_all_conversations" ON public.conversations';
EXECUTE 'CREATE POLICY "strict_owner_all_conversations" ON public.conversations FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id)';
END IF;
-- MESSAGES
IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = 'messages'
) THEN EXECUTE 'DROP POLICY IF EXISTS "strict_owner_all_messages" ON public.messages';
EXECUTE 'CREATE POLICY "strict_owner_all_messages" ON public.messages FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id)';
END IF;
-- PROJECTS
IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = 'projects'
) THEN EXECUTE 'DROP POLICY IF EXISTS "strict_owner_all_projects" ON public.projects';
EXECUTE 'CREATE POLICY "strict_owner_all_projects" ON public.projects FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id)';
END IF;
-- RUNS
IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = 'runs'
) THEN EXECUTE 'DROP POLICY IF EXISTS "strict_owner_all_runs" ON public.runs';
EXECUTE 'CREATE POLICY "strict_owner_all_runs" ON public.runs FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id)';
END IF;
-- WORKSPACES
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'workspaces'
        AND column_name = 'user_id'
) THEN EXECUTE 'DROP POLICY IF EXISTS "strict_owner_all_workspaces" ON public.workspaces';
EXECUTE 'CREATE POLICY "strict_owner_all_workspaces" ON public.workspaces FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id)';
ELSIF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'workspaces'
        AND column_name = 'owner_id'
) THEN EXECUTE 'DROP POLICY IF EXISTS "strict_owner_all_workspaces" ON public.workspaces';
EXECUTE 'CREATE POLICY "strict_owner_all_workspaces" ON public.workspaces FOR ALL TO authenticated USING ((SELECT auth.uid()) = owner_id) WITH CHECK ((SELECT auth.uid()) = owner_id)';
END IF;
-- WORKSPACE MEMBERS (Con seguridad heredada)
IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = 'workspace_members'
) THEN EXECUTE 'DROP POLICY IF EXISTS "strict_owner_manage_members" ON public.workspace_members';
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'workspaces'
        AND column_name = 'user_id'
) THEN EXECUTE 'CREATE POLICY "strict_owner_manage_members" ON public.workspace_members FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_members.workspace_id AND w.user_id = (SELECT auth.uid())))';
ELSIF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'workspaces'
        AND column_name = 'owner_id'
) THEN EXECUTE 'CREATE POLICY "strict_owner_manage_members" ON public.workspace_members FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_members.workspace_id AND w.owner_id = (SELECT auth.uid())))';
END IF;
END IF;
-- PUBLIC READ (AI Presets & Tags)
IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = 'ai_presets'
) THEN EXECUTE 'DROP POLICY IF EXISTS "optimized_public_read_presets" ON public.ai_presets';
EXECUTE 'CREATE POLICY "optimized_public_read_presets" ON public.ai_presets FOR SELECT TO public USING (true)';
END IF;
IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = 'tags'
) THEN EXECUTE 'DROP POLICY IF EXISTS "optimized_public_read_tags" ON public.tags';
EXECUTE 'CREATE POLICY "optimized_public_read_tags" ON public.tags FOR SELECT TO public USING (true)';
END IF;
END $BODY$;
COMMIT;