-- Tabla de Eventos del Proyecto (Timeline)
create table project_feed (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid references projects(id) on delete cascade,
    type text not null,
    -- 'idea_created', 'deploy_success', 'insight_detected', 'pr_generated'
    message text not null,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default now()
);
-- RLS
alter table project_feed enable row level security;
create policy "Users can view their project feed" on project_feed for
select using (
        exists (
            select 1
            from projects
            where projects.id = project_id
                and projects.user_id = auth.uid()
        )
    );
create policy "Users can manage their project feed" on project_feed for all using (
    exists (
        select 1
        from projects
        where projects.id = project_id
            and projects.user_id = auth.uid()
    )
);
-- Tabla de Insights Evolutivos
create table evolution_insights (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid references projects(id) on delete cascade,
    insight_type text not null,
    -- 'signup_drop', 'low_retention', 'low_conversion', 'tech_debt'
    severity text not null default 'medium',
    -- 'low', 'medium', 'high', 'critical'
    description text not null,
    suggested_fix text,
    status text default 'open',
    -- 'open', 'pr_generated', 'resolved', 'ignored'
    created_at timestamp with time zone default now(),
    resolved_at timestamp with time zone
);
-- RLS
alter table evolution_insights enable row level security;
create policy "Users can view their project insights" on evolution_insights for
select using (
        exists (
            select 1
            from projects
            where projects.id = project_id
                and projects.user_id = auth.uid()
        )
    );
create policy "Users can manage their project insights" on evolution_insights for all using (
    exists (
        select 1
        from projects
        where projects.id = project_id
            and projects.user_id = auth.uid()
    )
);