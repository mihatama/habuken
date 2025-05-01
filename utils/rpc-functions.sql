-- テーブル定義を取得する関数
CREATE OR REPLACE FUNCTION get_table_definition(table_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT jsonb_agg(
      jsonb_build_object(
        'column_name', column_name,
        'data_type', data_type,
        'is_nullable', is_nullable
      )
    )
    FROM information_schema.columns
    WHERE table_name = $1
    AND table_schema = 'public'
  );
END;
$$;

-- テーブルのRLSポリシーを取得する関数
CREATE OR REPLACE FUNCTION get_policies_for_table(table_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT jsonb_agg(
      jsonb_build_object(
        'policyname', policyname,
        'permissive', permissive,
        'roles', roles,
        'cmd', cmd,
        'qual', qual,
        'with_check', with_check
      )
    )
    FROM pg_policies
    WHERE tablename = $1
  );
END;
$$;
