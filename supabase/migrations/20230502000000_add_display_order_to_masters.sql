-- マスターテーブルに display_order カラムを追加
ALTER TABLE staff ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0; -- tools用
ALTER TABLE heavy_machinery ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 既存レコードの display_order を id 順に初期化するための関数
CREATE OR REPLACE FUNCTION initialize_display_order() RETURNS void AS $$
DECLARE
    r RECORD;
    counter INTEGER;
BEGIN
    -- staff テーブル
    counter := 1;
    FOR r IN SELECT id FROM staff ORDER BY created_at ASC LOOP
        UPDATE staff SET display_order = counter WHERE id = r.id;
        counter := counter + 1;
    END LOOP;
    
    -- projects テーブル
    counter := 1;
    FOR r IN SELECT id FROM projects ORDER BY created_at ASC LOOP
        UPDATE projects SET display_order = counter WHERE id = r.id;
        counter := counter + 1;
    END LOOP;
    
    -- vehicles テーブル
    counter := 1;
    FOR r IN SELECT id FROM vehicles ORDER BY created_at ASC LOOP
        UPDATE vehicles SET display_order = counter WHERE id = r.id;
        counter := counter + 1;
    END LOOP;
    
    -- resources テーブル (tools)
    counter := 1;
    FOR r IN SELECT id FROM resources WHERE type = '工具' ORDER BY created_at ASC LOOP
        UPDATE resources SET display_order = counter WHERE id = r.id;
        counter := counter + 1;
    END LOOP;
    
    -- heavy_machinery テーブル
    counter := 1;
    FOR r IN SELECT id FROM heavy_machinery ORDER BY created_at ASC LOOP
        UPDATE heavy_machinery SET display_order = counter WHERE id = r.id;
        counter := counter + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 関数を実行して既存データの display_order を初期化
SELECT initialize_display_order();

-- 初期化用の一時関数を削除
DROP FUNCTION initialize_display_order();
