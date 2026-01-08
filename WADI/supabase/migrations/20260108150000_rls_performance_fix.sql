-- MIGRATION: 20260108150000_rls_performance_fix.sql
-- GOAL: Optimize RLS for scale and resolve 'multiple_permissive_policies'
-- Ref: https://supabase.com/docs/guides/database/postgres/row-level-security#performance-recommendations
BEGIN;
---------------------------------------------------------
-- 1. CLEANUP: Drop old/redundant/warned policies
---------------------------------------------------------
-- Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles select" ON public.profiles;
DROP POLICY IF EXISTS "strict_owner_all_profiles" ON public.profiles;
-- Conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can manage their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "WADI Permissive Policy" ON public.conversations;
DROP POLICY IF EXISTS "strict_owner_all_conversations" ON public.conversations;
-- Messages
DROP POLICY IF EXISTS "Users can manage their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;
DROP POLICY IF EXISTS "messages select" ON public.messages;
DROP POLICY IF EXISTS "strict_owner_all_messages" ON public.messages;
-- Projects
DROP POLICY IF EXISTS "Users can view only their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
DROP POLICY IF EXISTS "projects select" ON public.projects;
DROP POLICY IF EXISTS "projects insert" ON public.projects;
DROP POLICY IF EXISTS "projects update" ON public.projects;
DROP POLICY IF EXISTS "projects delete" ON public.projects;
DROP POLICY IF EXISTS "strict_owner_all_projects" ON public.projects;
-- Runs
DROP POLICY IF EXISTS "Users can view only their own runs" ON public.runs;
DROP POLICY IF EXISTS "Users can insert their own runs" ON public.runs;
DROP POLICY IF EXISTS "Users can update their own runs" ON public.runs;
DROP POLICY IF EXISTS "Users can delete their own runs" ON public.runs;
DROP POLICY IF EXISTS "strict_owner_all_runs" ON public.runs;
-- Others (Safely handle potentially missing tables)
DO $$ BEGIN -- Folders
IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE tablename = 'folders'
) THEN DROP POLICY IF EXISTS "Users can manage their own folders" ON public.folders;
DROP POLICY IF EXISTS "strict_owner_all_folders" ON public.folders;
END IF;
-- Documents (From RAG v1)
IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE tablename = 'documents'
) THEN DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can select their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;
DROP POLICY IF EXISTS "strict_owner_all_documents" ON public.documents;
END IF;
-- Workspaces
IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE tablename = 'workspaces'
) THEN DROP POLICY IF EXISTS "Members can view workspace" ON public.workspaces;
DROP POLICY IF EXISTS "strict_owner_all_workspaces" ON public.workspaces;
END IF;
-- Workspace Members
IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE tablename = 'workspace_members'
) THEN DROP POLICY IF EXISTS "Owners can manage members" ON public.workspace_members;
DROP POLICY IF EXISTS "strict_owner_manage_members" ON public.workspace_members;
END IF;
-- User Usage
IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE tablename = 'user_usage'
) THEN DROP POLICY IF EXISTS "strict_owner_all_usage" ON public.user_usage;
END IF;
-- Project Tags
IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE tablename = 'project_tags'
) THEN DROP POLICY IF EXISTS "Users can manage project tags" ON public.project_tags;
DROP POLICY IF EXISTS "Users can manage tags for their projects" ON public.project_tags;
DROP POLICY IF EXISTS "strict_project_owner_tags" ON public.project_tags;
END IF;
-- Cloud Reports
IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE tablename = 'wadi_cloud_reports'
) THEN DROP POLICY IF EXISTS "Users can view own cloud reports" ON public.wadi_cloud_reports;
DROP POLICY IF EXISTS "Users can insert own cloud reports" ON public.wadi_cloud_reports;
DROP POLICY IF EXISTS "strict_owner_all_reports" ON public.wadi_cloud_reports;
END IF;
END $$;
---------------------------------------------------------
-- 2. OPTIMIZED POLICIES
---------------------------------------------------------
-- Profile (Qualify to avoid ambiguity with auth.uid())
CREATE POLICY "strict_owner_all_profiles" ON public.profiles FOR ALL TO authenticated USING (
    (
        SELECT auth.uid()
    ) = public.profiles.id
) WITH CHECK (
    (
        SELECT auth.uid()
    ) = public.profiles.id
);
-- Conversations
CREATE POLICY "strict_owner_all_conversations" ON public.conversations FOR ALL TO authenticated USING (
    (
        SELECT auth.uid()
    ) = user_id
) WITH CHECK (
    (
        SELECT auth.uid()
    ) = user_id
);
-- Messages
CREATE POLICY "strict_owner_all_messages" ON public.messages FOR ALL TO authenticated USING (
    (
        SELECT auth.uid()
    ) = user_id
) WITH CHECK (
    (
        SELECT auth.uid()
    ) = user_id
);
-- Projects
CREATE POLICY "strict_owner_all_projects" ON public.projects FOR ALL TO authenticated USING (
    (
        SELECT auth.uid()
    ) = user_id
) WITH CHECK (
    (
        SELECT auth.uid()
    ) = user_id
);
-- Runs
CREATE POLICY "strict_owner_all_runs" ON public.runs FOR ALL TO authenticated USING (
    (
        SELECT auth.uid()
    ) = user_id
) WITH CHECK (
    (
        SELECT auth.uid()
    ) = user_id
);
-- DYNAMIC CREATION FOR OPTIONAL TABLES
DO $$ BEGIN -- Folders
IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE tablename = 'folders'
) THEN CREATE POLICY "strict_owner_all_folders" ON public.folders FOR ALL TO authenticated USING (
    (
        SELECT auth.uid()
    ) = user_id
) WITH CHECK (
    (
        SELECT auth.uid()
    ) = user_id
);
END IF;
-- Documents
IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE tablename = 'documents'
) THEN CREATE POLICY "strict_owner_all_documents" ON public.documents FOR ALL TO authenticated USING (
    (
        SELECT auth.uid()
    ) = user_id
) WITH CHECK (
    (
        SELECT auth.uid()
    ) = user_id
);
END IF;
-- Cloud Reports
IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE tablename = 'wadi_cloud_reports'
) THEN CREATE POLICY "strict_owner_all_reports" ON public.wadi_cloud_reports FOR ALL TO authenticated USING (
    (
        SELECT auth.uid()
    ) = user_id
) WITH CHECK (
    (
        SELECT auth.uid()
    ) = user_id
);
END IF;
-- Knowledge Base
IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE tablename = 'wadi_knowledge_base'
) THEN DROP POLICY IF EXISTS "strict_owner_all_knowledge" ON public.wadi_knowledge_base;
CREATE POLICY "strict_owner_all_knowledge" ON public.wadi_knowledge_base FOR ALL TO authenticated USING (
    (
        SELECT auth.uid()
    ) = user_id
) WITH CHECK (
    (
        SELECT auth.uid()
    ) = user_id
);
END IF;
END $$;
---------------------------------------------------------
-- 3. GLOBAL READ-ONLY TABLES
---------------------------------------------------------
CREATE POLICY "optimized_public_read_presets" ON public.ai_presets FOR
SELECT TO public USING (true);
CREATE POLICY "optimized_public_read_tags" ON public.tags FOR
SELECT TO public USING (true);
-- Workspaces and related (The most likely source of 'id' errors)
-- We use a DO block to execute these ONLY if columns are verified
DO $$ BEGIN -- Check Workspaces
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'workspaces'
        AND column_name = 'user_id'
) THEN EXECUTE 'CREATE POLICY "strict_owner_all_workspaces" ON public.workspaces FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id)';
ELSIF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'workspaces'
        AND column_name = 'owner_id'
) THEN EXECUTE 'CREATE POLICY "strict_owner_all_workspaces" ON public.workspaces FOR ALL TO authenticated USING ((SELECT auth.uid()) = owner_id) WITH CHECK ((SELECT auth.uid()) = owner_id)';
END IF;
-- Check project_tags (Many-to-many often lacks its own 'id')
IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE tablename = 'project_tags'
) THEN -- If we are here, project_tags and projects should exist.
EXECUTE 'CREATE POLICY "strict_project_owner_tags" ON public.project_tags FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_tags.project_id AND p.user_id = (SELECT auth.uid())))';
END IF;
END $$;
COMMIT;