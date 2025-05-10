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

  begin
    drop policy if exists "Authenticated users can update files" on storage.objects;
  exception when others then
    raise notice 'Policy "Authenticated users can update files" does not exist or could not be dropped';
  end;

  -- 新しいポリシーを作成
  -- 閲覧ポリシー - 誰でも閲覧可能
  create policy "Public Access"
  on storage.objects for select
  using (bucket_id = 'genba');

  -- アップロードポリシー - 認証済みユーザーはどこにでもアップロード可能
  create policy "Authenticated users can upload files"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'genba');

  -- 更新ポリシー - 認証済みユーザーは更新可能
  create policy "Authenticated users can update files"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'genba');

  -- 削除ポリシー - 認証済みユーザーは削除可能
  create policy "Authenticated users can delete files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'genba');
end;
$$;
