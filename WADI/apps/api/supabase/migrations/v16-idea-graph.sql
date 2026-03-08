-- Enable vector support
create extension if not exists vector;
-- UUID generator
create extension if not exists "uuid-ossp";
-- Tabla ideas
create table ideas (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null,
    title text,
    description text,
    stage text default 'clarification',
    is_public boolean default false,
    is_anonymized boolean default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);
-- Índices tabla ideas
create index ideas_user_idx on ideas(user_id);
create index ideas_created_idx on ideas(created_at desc);
-- Tabla idea_dimensions (VC-style)
create table idea_dimensions (
    idea_id uuid primary key references ideas(id) on delete cascade,
    problem text,
    solution text,
    target_user text,
    customer_type text,
    domain text,
    platform text,
    complexity text,
    business_model text,
    monetization text,
    distribution text,
    market_scope text,
    scale_potential text,
    innovation_type text,
    confidence_score float,
    vector_version text,
    created_at timestamp with time zone default now()
);
-- Tabla idea_embeddings
create table idea_embeddings (
    idea_id uuid primary key references ideas(id) on delete cascade,
    embedding vector(1536),
    model text default 'text-embedding-3-small',
    created_at timestamp with time zone default now()
);
-- Índice vectorial (IVFFlat)
create index idea_embedding_idx on idea_embeddings using ivfflat (embedding vector_cosine_ops) with (lists = 100);
-- Tabla idea_revisions
create table idea_revisions (
    id uuid primary key default uuid_generate_v4(),
    idea_id uuid references ideas(id) on delete cascade,
    revision_data jsonb,
    created_at timestamp with time zone default now()
);
-- Tabla idea_scores
create table idea_scores (
    idea_id uuid primary key references ideas(id) on delete cascade,
    market_score float,
    distribution_score float,
    monetization_score float,
    complexity_score float,
    competition_score float,
    innovation_score float,
    overall_score float,
    created_at timestamp with time zone default now()
);
-- Tabla idea_dna
create table idea_dna (
    idea_id uuid primary key references ideas(id) on delete cascade,
    archetype text,
    subtype text,
    growth_model text,
    risk_profile text,
    pattern text,
    created_at timestamp with time zone default now()
);
-- Tabla startup_playbooks
create table startup_playbooks (
    id uuid primary key default uuid_generate_v4(),
    archetype text unique,
    core_features jsonb,
    tech_stack jsonb,
    mvp_structure jsonb,
    growth_strategy jsonb,
    created_at timestamp with time zone default now()
);
-- Función para buscar ideas similares
create or replace function match_similar_ideas(
        query_embedding vector(1536),
        user_id uuid,
        match_count int default 5
    ) returns table (
        idea_id uuid,
        similarity float,
        source text
    ) language sql as $$
select idea_embeddings.idea_id,
    1 - (idea_embeddings.embedding <=> query_embedding) as similarity,
    case
        when ideas.user_id = match_similar_ideas.user_id then 'user_memory'
        else 'collective_memory'
    end as source
from idea_embeddings
    join ideas on ideas.id = idea_embeddings.idea_id
where ideas.user_id = match_similar_ideas.user_id
    or ideas.is_public = true
order by idea_embeddings.embedding <=> query_embedding
limit match_count;
$$;
-- Vista segura para ideas colectivas
create or replace view public_idea_insights as
select ideas.id,
    idea_dimensions.problem,
    idea_dimensions.solution,
    idea_dimensions.target_user,
    idea_dimensions.customer_type,
    idea_dimensions.domain,
    idea_dimensions.platform,
    idea_dimensions.complexity,
    idea_dimensions.business_model,
    idea_dimensions.monetization,
    idea_dimensions.distribution,
    idea_dimensions.market_scope,
    idea_dimensions.scale_potential,
    idea_dimensions.innovation_type
from ideas
    join idea_dimensions on ideas.id = idea_dimensions.idea_id
where ideas.is_public = true;
-- RLS (Row Level Security)
alter table ideas enable row level security;
alter table idea_dimensions enable row level security;
alter table idea_embeddings enable row level security;
alter table idea_revisions enable row level security;
alter table idea_scores enable row level security;
alter table idea_dna enable row level security;
alter table startup_playbooks enable row level security;
-- Policies
create policy "Users can view their ideas" on ideas for
select using (auth.uid() = user_id);
create policy "Users can insert ideas" on ideas for
insert with check (auth.uid() = user_id);
create policy "Users manage dimensions" on idea_dimensions for all using (
    exists (
        select 1
        from ideas
        where ideas.id = idea_dimensions.idea_id
            and ideas.user_id = auth.uid()
    )
);
create policy "Users manage embeddings" on idea_embeddings for all using (
    exists (
        select 1
        from ideas
        where ideas.id = idea_embeddings.idea_id
            and ideas.user_id = auth.uid()
    )
);
create policy "Users manage revisions" on idea_revisions for all using (
    exists (
        select 1
        from ideas
        where ideas.id = idea_revisions.idea_id
            and ideas.user_id = auth.uid()
    )
);
create policy "Users manage idea scores" on idea_scores for all using (
    exists (
        select 1
        from ideas
        where ideas.id = idea_scores.idea_id
            and ideas.user_id = auth.uid()
    )
);
create policy "Users can view public idea scores" on idea_scores for
select using (
        exists (
            select 1
            from ideas
            where ideas.id = idea_scores.idea_id
                and ideas.is_public = true
        )
    );
create policy "Users manage idea dna" on idea_dna for all using (
    exists (
        select 1
        from ideas
        where ideas.id = idea_dna.idea_id
            and ideas.user_id = auth.uid()
    )
);
create policy "Users can view public idea dna" on idea_dna for
select using (
        exists (
            select 1
            from ideas
            where ideas.id = idea_dna.idea_id
                and ideas.is_public = true
        )
    );
create policy "Anyone can view startup playbooks" on startup_playbooks for
select using (true);