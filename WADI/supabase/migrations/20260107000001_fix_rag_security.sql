-- Secure the match_documents function by fixing the search_path
-- This prevents malicious search_path manipulation
create or replace function match_documents (
        query_embedding vector(1536),
        match_threshold float,
        match_count int
    ) returns table (
        id uuid,
        content text,
        metadata jsonb,
        similarity float
    ) language plpgsql stable
set search_path = public,
    extensions -- FIX: Explicitly set schemas
    as $$ begin return query(
        select documents.id,
            documents.content,
            documents.metadata,
            1 - (documents.embedding <=> query_embedding) as similarity
        from documents
        where 1 - (documents.embedding <=> query_embedding) > match_threshold
        order by documents.embedding <=> query_embedding
        limit match_count
    );
end;
$$;