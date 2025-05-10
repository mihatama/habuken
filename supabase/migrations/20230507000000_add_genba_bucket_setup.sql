-- genbaバケットのポリシーを設定するRPC関数
create or replace function public.setup_genba_bucket_policies()
returns void
language plpgsql
security definer
as $$
begin
  -- バケットが存在しない場合は作成
  insert into storage.buckets (id, name, public)
  values ('genba', 'genba', true)
  on conflict (id) do nothing;

  -- 既存のポリシーを削除（エラーを無視）
  begin
    drop policy if exists "Public Access" on storage.objects;
  exception when others then
    raise notice 'Policy "Public Access" does not exist or could not be dropped';
  end;
  
  begin
    drop policy if exists "Authenticated users can upload files" on storage.objects;
  exception when others then
    raise notice 'Policy "Authenticated users can upload files" does not exist or could not be dropped';
  end;
  
  begin
    drop policy if exists "Users can delete their own files" on storage.objects;
  exception when others then
    raise notice 'Policy "Users can delete their own files" does not exist or could not be dropped';
  end;

  -- 新しいポリシーを作成
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
end;
$$;
