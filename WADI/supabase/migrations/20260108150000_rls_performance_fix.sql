 DROP POLICY IF EXISTS "strict_system_read_audit" ON public.audit_logs';
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