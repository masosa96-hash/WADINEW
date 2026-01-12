-- Tabla para almacenar los resultados del procesamiento de IA
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id TEXT NOT NULL,
    -- El ID de BullMQ
    type TEXT CHECK (type IN ('SUGGESTION', 'WARNING', 'INFO')),
    message TEXT NOT NULL,
    related_project_id UUID REFERENCES projects(id) ON DELETE
    SET NULL,
        confidence FLOAT DEFAULT 0.0,
        metadata JSONB,
        -- Para guardar el output original completo si es necesario
        created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Índice para consultas rápidas por usuario
CREATE INDEX idx_ai_insights_user ON ai_insights(user_id);