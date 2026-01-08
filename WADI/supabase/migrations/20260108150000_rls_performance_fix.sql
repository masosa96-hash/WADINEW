-- MIGRATION: 20260108150000_rls_performance_fix.sql
-- GOAL: Resolve all 'multiple_permissive_policies' and cleanup RLS ghosts.
-- Consolidated into a single script for easy copy-paste.
DO $$
DECLARE pol record;
BEGIN ---------------------------------------------------------
-- 1. LIMPIEZA TOTAL DE "FANTASMAS"
---------------------------------------------------------
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
---------------------------------------------------------
-- 2. POLÍTICAS UNIFICADAS Y OPTIMIZADAS
---------------------------------------------------------
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
-- WORKSPACE MEMBERS
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
-- AUDIT LOGS
IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = 'audit_logs'
) THEN EXECUTE 'DROP POLICY IF EXISTS "strict_system_read_audit" ON public.audit_logs';
EXECUTE 'CREATE POLICY "strict_system_read_audit" ON public.audit_logs FOR SELECT TO authenticated USING (true)';
END IF;
---------------------------------------------------------
-- 3. TABLAS DE LECTURA PÚBLICA
---------------------------------------------------------
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
END $$;