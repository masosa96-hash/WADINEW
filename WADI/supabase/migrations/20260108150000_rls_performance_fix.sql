-- MIGRATION: 20260108150000_rls_performance_fix.sql
-- GOAL: Resolve all 'multiple_permissive_policies' and cleanup RLS ghosts.
-- Fixed: Dynamic column detection for workspaces within workspace_members policy.
BEGIN;
---------------------------------------------------------
-- 1. LIMPIEZA TOTAL DE "FANTASMAS"
---------------------------------------------------------
DO $$
DECLARE pol record;
BEGIN FOR pol IN
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
END $$;
---------------------------------------------------------
-- 2. POLÍTICAS UNIFICADAS Y OPTIMIZADAS
---------------------------------------------------------
DO $$ BEGIN -- PROFILES
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
        AND column_name = 'user_id'
) THEN DROP POLICY IF EXISTS "strict_owner_all_profiles" ON public.profiles;
CREATE POLICY "strict_owner_all_profiles" ON public.profiles FOR ALL TO authenticated USING (
    (
        SELECT auth.uid()
    ) = user_id
) WITH CHECK (
    (
        SELECT auth.uid()
    ) = user_id
);
ELSIF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
        AND column_name = 'id'
) THEN DROP POLICY IF EXISTS "strict_owner_all_profiles" ON public.profiles;
CREATE POLICY "strict_owner_all_profiles" ON public.profiles FOR ALL TO authenticated USING (
    (
        SELECT auth.uid()
    ) = id
) WITH CHECK (
    (
        SELECT auth.uid()
    ) = id
);
END IF;
-- CONVERSATIONS
DROP POLICY IF EXISTS "strict_owner_all_conversations" ON public.conversations;
CREATE POLICY "strict_owner_all_conversations" ON public.conversations FOR ALL TO authenticated USING (
    (
        SELECT auth.uid()
    ) = user_id
) WITH CHECK (
    (
        SELECT auth.uid()
    ) = user_id
);
-- MESSAGES
DROP POLICY IF EXISTS "strict_owner_all_messages" ON public.messages;
CREATE POLICY "strict_owner_all_messages" ON public.messages FOR ALL TO authenticated USING (
    (
        SELECT auth.uid()
    ) = user_id
) WITH CHECK (
    (
        SELECT auth.uid()
    ) = user_id
);
-- PROJECTS
DROP POLICY IF EXISTS "strict_owner_all_projects" ON public.projects;
CREATE POLICY "strict_owner_all_projects" ON public.projects FOR ALL TO authenticated USING (
    (
        SELECT auth.uid()
    ) = user_id
) WITH CHECK (
    (
        SELECT auth.uid()
    ) = user_id
);
-- RUNS
DROP POLICY IF EXISTS "strict_owner_all_runs" ON public.runs;
CREATE POLICY "strict_owner_all_runs" ON public.runs FOR ALL TO authenticated USING (
    (
        SELECT auth.uid()
    ) = user_id
) WITH CHECK (
    (
        SELECT auth.uid()
    ) = user_id
);
-- WORKSPACES
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'workspaces'
        AND column_name = 'user_id'
) THEN DROP POLICY IF EXISTS "strict_owner_all_workspaces" ON public.workspaces;
CREATE POLICY "strict_owner_all_workspaces" ON public.workspaces FOR ALL TO authenticated USING (
    (
        SELECT auth.uid()
    ) = user_id
) WITH CHECK (
    (
        SELECT auth.uid()
    ) = user_id
);
ELSIF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'workspaces'
        AND column_name = 'owner_id'
) THEN DROP POLICY IF EXISTS "strict_owner_all_workspaces" ON public.workspaces;
CREATE POLICY "strict_owner_all_workspaces" ON public.workspaces FOR ALL TO authenticated USING (
    (
        SELECT auth.uid()
    ) = owner_id
) WITH CHECK (
    (
        SELECT auth.uid()
    ) = owner_id
);
END IF;
-- WORKSPACE MEMBERS (Fix: Dynamic column check for workspaces join)
IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE tablename = 'workspace_members'
) THEN DROP POLICY IF EXISTS "strict_owner_manage_members" ON public.workspace_members;
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'workspaces'
        AND column_name = 'user_id'
) THEN CREATE POLICY "strict_owner_manage_members" ON public.workspace_members FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM public.workspaces w
        WHERE w.id = workspace_members.workspace_id
            AND w.user_id = (
                SELECT auth.uid()
            )
    )
);
ELSIF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'workspaces'
        AND column_name = 'owner_id'
) THEN CREATE POLICY "strict_owner_manage_members" ON public.workspace_members FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM public.workspaces w
        WHERE w.id = workspace_members.workspace_id
            AND w.owner_id = (
                SELECT auth.uid()
            )
    )
);
END IF;
END IF;
-- FOLDERS & DOCUMENTS
IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE tablename = 'folders'
) THEN DROP POLICY IF EXISTS "strict_owner_all_folders" ON public.folders;
CREATE POLICY "strict_owner_all_folders" ON public.folders FOR ALL TO authenticated USING (
    (
        SELECT auth.uid()
    ) = user_id
) WITH CHECK (
    (
        SELECT auth.uid()
    ) = user_id
);
END IF;
IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE tablename = 'documents'
) THEN DROP POLICY IF EXISTS "strict_owner_all_documents" ON public.documents;
CREATE POLICY "strict_owner_all_documents" ON public.documents FOR ALL TO authenticated USING (
    (
        SELECT auth.uid()
    ) = user_id
) WITH CHECK (
    (
        SELECT auth.uid()
    ) = user_id
);
END IF;
-- AUDIT LOGS
IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE tablename = 'audit_logs'
) THEN DROP POLICY IF EXISTS "strict_system_read_audit" ON public.audit_logs;
CREATE POLICY "strict_system_read_audit" ON public.audit_logs FOR
SELECT TO authenticated USING (true);
END IF;
END $$;
---------------------------------------------------------
-- 3. TABLAS DE LECTURA PÚBLICA (Optimización Final)
---------------------------------------------------------
DROP POLICY IF EXISTS "optimized_public_read_presets" ON public.ai_presets;
CREATE POLICY "optimized_public_read_presets" ON public.ai_presets FOR
SELECT TO public USING (true);
DROP POLICY IF EXISTS "optimized_public_read_tags" ON public.tags;
CREATE POLICY "optimized_public_read_tags" ON public.tags FOR
SELECT TO public USING (true);
COMMIT;