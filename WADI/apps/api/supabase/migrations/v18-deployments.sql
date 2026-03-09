-- Tabla de deployments
create table deployments (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid references projects(id) on delete cascade,
    provider text not null,
    -- 'vercel', 'railway', etc.
    deploy_url text,
    status text default 'queued',
    created_at timestamp with time zone default now()
);
-- RLS
alter table deployments enable row level security;
create policy "Users can view their deployments through projects" on deployments for
select using (
        exists (
            select 1
            from projects
            where projects.id = project_id
                and projects.user_id = auth.uid()
        )
    );
create policy "Users can manage their deployments through projects" on deployments for all using (
    exists (
        select 1
        from projects
        where projects.id = project_id
            and projects.user_id = auth.uid()
    )
);