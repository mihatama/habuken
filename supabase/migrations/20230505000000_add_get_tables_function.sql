-- テーブル一覧を取得するRPC関数
CREATE OR REPLACE FUNCTION get_tables()
RETURNS TABLE (table_name text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT tablename::text
  FROM pg_catalog.pg_tables
  WHERE schemaname = 'public';
END;
$$;
