
-- Tabla para almacenar el conocimiento consolidado (Memory Distiller)
CREATE TABLE IF NOT EXISTS public.wadi_knowledge_base (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    knowledge_point TEXT NOT NULL, -- "Prefiere TypeScript over JS"
    category TEXT DEFAULT 'PREFERENCE', -- PREFERENCE, FACT, PATTERN
    confidence_score INTEGER DEFAULT 1, -- Cuántas veces se validó
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tabla para reflexiones internas de WADI (Inner Sanctum)
CREATE TABLE IF NOT EXISTS public.wadi_reflections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'APRENDIZAJE', 'AUTOCRITICA', 'PROPUESTA'
    content TEXT NOT NULL,
    priority TEXT DEFAULT 'NORMAL', -- 'HIGH', 'NORMAL', 'LOW'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Políticas RLS (Row Level Security)
ALTER TABLE public.wadi_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wadi_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own knowledge" ON public.wadi_knowledge_base
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own knowledge" ON public.wadi_knowledge_base
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own reflections" ON public.wadi_reflections
    FOR SELECT USING (auth.uid() = user_id);

-- (Opcional) Trigger para updated_at
CREATE EXTENSION IF NOT EXISTS moddatetime;

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.wadi_knowledge_base
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);
