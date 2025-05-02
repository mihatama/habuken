CREATE OR REPLACE FUNCTION create_machinery_reservations_table()
RETURNS void AS $$
BEGIN
  -- UUIDの拡張機能が必要な場合は有効化
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  
  -- テーブルが存在しない場合のみ作成
  CREATE TABLE IF NOT EXISTS machinery_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machinery_id UUID REFERENCES heavy_machinery(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    project_name TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- インデックスの作成
  CREATE INDEX IF NOT EXISTS idx_machinery_reservations_machinery_id ON machinery_reservations(machinery_id);
  CREATE INDEX IF NOT EXISTS idx_machinery_reservations_start_date ON machinery_reservations(start_date);
END;
$$ LANGUAGE plpgsql;
