-- [SECURITY_HARDENING]: El búnker no tiene puertas para extraños. Solo los autorizados dejan huella.

-- -----------------------------------------------------------------------------
-- 1. Tablas Privadas: Blindaje Total (Solo Authenticated)
-- -----------------------------------------------------------------------------

-- Habilitar RLS en todas las tablas sensibles
ALTER TABLE IF EXISTS conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS workspace_members ENABLE ROW LEVEL SECURITY;

-- Revocar TODOS los privilegios del rol 'anon' y 'public' para asegurar que no puedan ni leer
-- (RLS es una segunda capa, pero esto cierra la puerta a nivel privilegios)
REVOKE ALL ON conversations FROM anon, public;
REVOKE ALL ON messages FROM anon, public;
REVOKE ALL ON profiles FROM anon, public;
REVOKE ALL ON folders FROM anon, public;
REVOKE ALL ON projects FROM anon, public;
REVOKE ALL ON runs FROM anon, public;
REVOKE ALL ON user_usage FROM anon, public;
REVOKE ALL ON workspace_members FROM anon, public;

-- Garantizar acceso completo solo a usuarios autenticados
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON folders TO authenticated;
GRANT ALL ON projects TO authenticated;
GRANT ALL ON runs TO authenticated;
GRANT ALL ON user_usage TO authenticated;
GRANT ALL ON workspace_members TO authenticated;
GRANT ALL ON workspace_members TO service_role;

-- Eliminar políticas antiguas (Limpieza de "Puertas Traseras")
-- Nota: Como no sabemos los nombres exactos, creamos políticas "Sledgehammer" que aseguran el acceso correcto.
-- PostgreSQL aplica políticas con OR. Si queda una política anon vieja, podría permitir acceso.
-- Lo ideal es borrar manualmente políticas nombradas "Enable read access for all users" etc.
-- Pero con los REVOKE de arriba, las políticas RLS para anon se vuelven irrelevantes (no tienen permiso de tabla).

-- Política Estándar para Authenticated (Ejemplo para conversations)
DROP POLICY IF EXISTS "Users can own conversations" ON conversations;
CREATE POLICY "Users can own conversations" ON conversations
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- (Repetir patrón strict para otras tablas si se desea RLS granular, 
-- pero el REVOKE anon es la clave del pedido del usuario).

-- -----------------------------------------------------------------------------
-- 2. Tablas de Sistema: Lectura Pública Controlada (System Read-Only)
-- -----------------------------------------------------------------------------

ALTER TABLE IF EXISTS ai_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public_project_tags ENABLE ROW LEVEL SECURITY;

-- Permitir SELECT a public/anon/authenticated
GRANT SELECT ON ai_presets TO anon, public, authenticated;
GRANT SELECT ON tags TO anon, public, authenticated;
GRANT SELECT ON public_project_tags TO anon, public, authenticated;

-- PROHIBIR escritura a todos menos service_role (Backend)
REVOKE INSERT, UPDATE, DELETE ON ai_presets FROM anon, public, authenticated;
REVOKE INSERT, UPDATE, DELETE ON tags FROM anon, public, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public_project_tags FROM anon, public, authenticated;

-- Políticas RLS de Lectura Pública
DROP POLICY IF EXISTS "Public Read Presets" ON ai_presets;
CREATE POLICY "Public Read Presets" ON ai_presets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Tags" ON tags;
CREATE POLICY "Public Read Tags" ON tags FOR SELECT USING (true);
