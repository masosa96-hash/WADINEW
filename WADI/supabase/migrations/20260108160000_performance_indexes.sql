-- MIGRATION: 20260108160000_performance_indexes.sql
-- GOAL: Optimize performance by indexing foreign keys and frequently filtered columns (Advisor 0001).
BEGIN;
-- Conversations & Messages (Core Chat)
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
-- Projects & Runs
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_runs_user_id ON public.runs(user_id);
-- Workspace Management
CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON public.workspaces(user_id)
WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON public.workspaces(owner_id)
WHERE owner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON public.workspace_members(user_id);
-- Folders & Documents
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON public.folders(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_folder_id ON public.documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
COMMIT;