-- 1. Enable Vector Extension
create extension if not exists vector;
-- 2. Create Documents Table
create table if not exists documents (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    content text not null,
    metadata jsonb,
    embedding vector(1536),
    created_at timestamptz default now()
);
-- 3. Enable RLS
alter table documents enable row level security;
-- 4. RLS Policies
create policy "Users can insert their own documents" on documents for
insert to authenticated with check (auth.uid() = user_id);
create policy "Users can select their own documents" on documents for
select to authenticated using (auth.uid() = user_id);
create policy "Users can delete their own documents" on documents for delete to authenticated using (auth.uid() = user_id);
-- 5. Search Function
create or replace function match_documents (
        query_embedding vector(1536),
        match_threshold float,
        match_count int
    ) returns table (
        id uuid,
        content text,
        metadata jsonb,
        similarity float
    ) language plpgsql stable as $$ begin return query(
        select documents.id,
            documents.content,
            documents.metadata,
            1 - (documents.embedding <=> query_embedding) as similarity
        from documents
        where 1 - (documents.embedding <=> query_embedding) > match_threshold -- Filter implicitly by RLS, but usually good to be explicit if function is security definer
            -- Since this is just 'stable' and called by user, RLS applies.
        order by documents.embedding <=> query_embedding
        limit match_count
    );
end;
$$;