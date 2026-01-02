
-- Tabla para reportes de texto completo (Journal Cloud)
CREATE TABLE IF NOT EXISTS public.wadi_cloud_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- "2024-01-01_evolution_log.txt"
    content TEXT NOT NULL,
    type TEXT DEFAULT 'EVOLUTION_LOG', -- 'EVOLUTION_LOG', 'ERROR_DUMP'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.wadi_cloud_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cloud reports" ON public.wadi_cloud_reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cloud reports" ON public.wadi_cloud_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);
