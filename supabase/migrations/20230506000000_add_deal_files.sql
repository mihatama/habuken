-- Create deal_files table
create table if not exists public.deal_files (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid references deals(id) on delete cascade,
  file_name text not null,
  file_type text not null,
  url text not null,
  created_at timestamptz default now()
);

-- Create storage bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('genba', 'genba', true)
on conflict (id) do nothing;

-- Set up storage policies
create policy "Public Access"
on storage.objects for select
using (bucket_id = 'genba');

create policy "Authenticated users can upload files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'genba');

create policy "Users can delete their own files"
on storage.objects for delete
to authenticated
using (bucket_id = 'genba');
