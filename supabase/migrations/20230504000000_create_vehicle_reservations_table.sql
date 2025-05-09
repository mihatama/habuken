-- 車両予約テーブルの作成
CREATE TABLE IF NOT EXISTS vehicle_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL,
  title TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  project_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS vehicle_reservations_vehicle_id_idx ON vehicle_reservations(vehicle_id);
CREATE INDEX IF NOT EXISTS vehicle_reservations_start_date_idx ON vehicle_reservations(start_date);
CREATE INDEX IF NOT EXISTS vehicle_reservations_end_date_idx ON vehicle_reservations(end_date);

-- RLSポリシーの設定
ALTER TABLE vehicle_reservations ENABLE ROW LEVEL SECURITY;

-- すべてのユーザーが読み取り可能
CREATE POLICY vehicle_reservations_select_policy
  ON vehicle_reservations FOR SELECT
  USING (true);

-- 認証済みユーザーが作成可能
CREATE POLICY vehicle_reservations_insert_policy
  ON vehicle_reservations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 認証済みユーザーが更新可能
CREATE POLICY vehicle_reservations_update_policy
  ON vehicle_reservations FOR UPDATE
  USING (auth.role() = 'authenticated');

-- 認証済みユーザーが削除可能
CREATE POLICY vehicle_reservations_delete_policy
  ON vehicle_reservations FOR DELETE
  USING (auth.role() = 'authenticated');
