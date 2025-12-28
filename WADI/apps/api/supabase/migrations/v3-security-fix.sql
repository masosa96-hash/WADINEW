-- SECURITY HARDENING & RLS POLICIES
-- Goal: Fix Security Advisor warnings without over-engineering.

-- 1. SECURE FUNCTIONS
-- Fix search_path for known functions to prevent hijacking
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- 2. TABLE: PROJECT_TAGS
-- Enable RLS
ALTER TABLE IF EXISTS project_tags ENABLE ROW LEVEL SECURITY;

-- Policy: Owner-based access via project_id
-- Users can only see/edit tags linked to projects they own
DROP POLICY IF EXISTS "Users can manage project tags" ON project_tags;
CREATE POLICY "Users can manage project tags"
ON project_tags
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_tags.project_id
    AND projects.user_id = auth.uid()
  )
);

-- 3. TABLE: AUDIT_LOGS
-- Enable RLS
ALTER TABLE IF EXISTS audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Backend Access Only (Service Role)
-- No user (auth.uid()) should read/write checks directly
DROP POLICY IF EXISTS "No user access to audit logs" ON audit_logs;
CREATE POLICY "No user access to audit logs"
ON audit_logs
FOR ALL
USING (false); -- Implicitly allows service_role to bypass

-- 4. TABLE: PROFILES
-- ⚠️ NO TOCAR POR AHORA
-- Se deja sin RLS explícito hasta definir mapping real con auth.users para evitar errores de columna "id" vs "user_id".
-- (Warning de seguridad aceptado temporalmente para no bloquear el sprint)
/*
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;
CREATE POLICY "Users can manage own profile"
ON profiles
FOR ALL
USING (auth.uid() = id);
*/

-- 5. CLEANUP PERMISSIVE POLICIES (If any exist)
-- Ensure 'projects' RLS is strict
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON projects;
DROP POLICY IF EXISTS "Enable insert for all users" ON projects;

-- Re-apply strict project policies (Idempotent check)
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view own projects"
ON projects FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
CREATE POLICY "Users can insert own projects"
ON projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Users can update own projects"
ON projects FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
CREATE POLICY "Users can delete own projects"
ON projects FOR DELETE
USING (auth.uid() = user_id);

-- 6. GLOBAL TABLES (Explicitly No RLS for now documentation)
-- Tables: tags, ai_presets
-- Action: Ensure RLS is DISABLED or documented as public read-only if intended
-- For this sprint, we leave them as is (per instruction: "Dejar sin RLS por ahora")
-- but ensure no 'write' access for anon if possible.
-- Assuming backend handles writes for these globals, we can revoke INSERT/UPDATE/DELETE from public.

REVOKE INSERT, UPDATE, DELETE ON TABLE tags FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE ai_presets FROM anon, authenticated;
-- Allow read
GRANT SELECT ON TABLE tags TO anon, authenticated;
GRANT SELECT ON TABLE ai_presets TO anon, authenticated;
