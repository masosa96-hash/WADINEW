-- Migración: Wadi Conversation State
-- Guarda el estado conversacional del pipeline de Wadi por usuario
-- El estado vive aquí (no en el frontend) para mantener coherencia entre sesiones
create table if not exists wadi_conversation_states (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    stage text not null default 'exploration',
    state jsonb not null default '{}',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);
-- Índice para búsqueda rápida por usuario
create index if not exists idx_wadi_states_user_id on wadi_conversation_states(user_id);
-- Única fila por usuario (un pipeline activo a la vez)
create unique index if not exists idx_wadi_states_user_unique on wadi_conversation_states(user_id);
-- RLS: cada usuario ve solo sus propios estados
alter table wadi_conversation_states enable row level security;
create policy "Users access own wadi state" on wadi_conversation_states for all using (auth.uid() = user_id);
-- Trigger: actualizar updated_at automáticamente
create or replace function update_wadi_state_timestamp() returns trigger as $$ begin new.updated_at = now();
return new;
end;
$$ language plpgsql;
create trigger wadi_state_updated before
update on wadi_conversation_states for each row execute function update_wadi_state_timestamp();