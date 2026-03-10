-- 1. Tabla de Beta Invites
create table beta_invites (
    code text primary key,
    used boolean default false,
    used_by uuid references auth.users(id),
    created_at timestamp with time zone default now()
);
-- Insertar algunos códigos semilla para los testers
insert into beta_invites (code)
values ('WADI-BETA-2026'),
    ('FOUNDER-SEED'),
    ('EARLY-ACCESS-1');
-- 2. Seeds de Demo Proyectos (Opcional: triggers para inyectar a usuarios nuevos)
-- Se podrían crear directamente en la tabla projects al momento en que el usuario se registra