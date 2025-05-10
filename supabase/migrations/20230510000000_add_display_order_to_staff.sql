-- display_orderカラムをstaffテーブルに追加
ALTER TABLE staff ADD COLUMN display_order INTEGER DEFAULT 0;

-- 既存のレコードに連番を振る
WITH ordered_staff AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM staff
)
UPDATE staff
SET display_order = ordered_staff.row_num
FROM ordered_staff
WHERE staff.id = ordered_staff.id;

-- update_staff_order関数を作成または置き換え
CREATE OR REPLACE FUNCTION update_staff_order(id_list UUID[])
RETURNS VOID AS $$
DECLARE
  staff_id UUID;
  i INTEGER;
BEGIN
  i := 1;
  FOREACH staff_id IN ARRAY id_list
  LOOP
    UPDATE staff SET display_order = i WHERE id = staff_id;
    i := i + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
