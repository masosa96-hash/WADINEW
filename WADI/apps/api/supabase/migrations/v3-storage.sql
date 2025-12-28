-- Create a specific bucket for user attachments
insert into storage.buckets (id, name, public)
values ('wadi-attachments', 'wadi-attachments', true)
on conflict (id) do nothing;

-- Set up security policies for the bucket
-- Allow public read access (so OpenAI can see the images)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'wadi-attachments' );

-- Allow authenticated users to upload files
create policy "Authenticated users can upload"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'wadi-attachments' AND auth.uid() = owner );

-- Allow users to update their own files
create policy "Users can update own files"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'wadi-attachments' AND auth.uid() = owner );

-- Allow users to delete their own files
create policy "Users can delete own files"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'wadi-attachments' AND auth.uid() = owner );

-- Update messages table to store attachments URLs if needed
-- For now, we are just passing them to the AI, but it is good practice to store them?
-- The prompt says "El estado de los mensajes ahora debe soportar un campo opcional attachments: string[]".
-- This refers to Frontend STATE. But backend DB persistence would be nice too.
-- Let's add a column to messages table just in case, although not explicitly requested for DB persistence, implied by "Chat History".
alter table public.messages 
add column if not exists attachments text[] default '{}';
