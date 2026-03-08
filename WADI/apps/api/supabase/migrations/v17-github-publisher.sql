-- Tabla de cuentas de GitHub
create table github_accounts (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade,
    github_username text,
    access_token text,
    created_at timestamp with time zone default now()
);
-- RLS
alter table github_accounts enable row level security;
create policy "Users can view their github accounts" on github_accounts for
select using (auth.uid() = user_id);
create policy "Users can manage their github accounts" on github_accounts for all using (auth.uid() = user_id);