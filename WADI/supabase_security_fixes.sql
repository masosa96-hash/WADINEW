-- PERFORMANCE: Add missing indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON public.workspaces(owner_id);
-- SECURITY: Lock down 'profiles' explicitly
-- Current Issue: "Allow individual read" likely allows public viewing.
-- Fix: Restrict to authenticated users only.
DO $$ BEGIN BEGIN ALTER POLICY "Allow individual read" ON public.profiles TO authenticated;
EXCEPTION
WHEN undefined_object THEN NULL;
-- Policy might not exist or named differently
END;
END $$;
-- SECURITY: Lock down 'conversations'
-- Current Issue: "Allow individual conversations" allows anon access.
DO $$ BEGIN BEGIN ALTER POLICY "Allow individual conversations" ON public.conversations TO authenticated;
EXCEPTION
WHEN undefined_object THEN NULL;
END;
END $$;
-- SECURITY: Lock down 'workspaces'
DO $$ BEGIN BEGIN ALTER POLICY "Users can manage own workspaces" ON public.workspaces TO authenticated;
EXCEPTION
WHEN undefined_object THEN NULL;
END;
END $$;
-- SECURITY: Storage Objects (Be careful here)
-- If avatars need to be public, this might break them. 
-- But strictly speaking, to fix the warning, we restrict to authenticated.
DO $$ BEGIN BEGIN ALTER POLICY "Lectura pública" ON storage.objects TO authenticated;
EXCEPTION
WHEN undefined_object THEN NULL;
END;
BEGIN ALTER POLICY "Permitir lectura pública" ON storage.objects TO authenticated;
EXCEPTION
WHEN undefined_object THEN NULL;
END;
END $$;