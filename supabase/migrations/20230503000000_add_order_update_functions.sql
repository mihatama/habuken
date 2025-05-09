-- スタッフの表示順を更新するRPC関数
CREATE OR REPLACE FUNCTION update_staff_display_order(id_array UUID[])
RETURNS void AS $$
DECLARE
    id_element UUID;
    i INTEGER;
BEGIN
    i := 1;
    FOREACH id_element IN ARRAY id_array
    LOOP
        UPDATE staff SET display_order = i WHERE id = id_element;
        i := i + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- プロジェクトの表示順を更新するRPC関数
CREATE OR REPLACE FUNCTION update_projects_display_order(id_array UUID[])
RETURNS void AS $$
DECLARE
    id_element UUID;
    i INTEGER;
BEGIN
    i := 1;
    FOREACH id_element IN ARRAY id_array
    LOOP
        UPDATE projects SET display_order = i WHERE id = id_element;
        i := i + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 車両の表示順を更新するRPC関数
CREATE OR REPLACE FUNCTION update_vehicles_display_order(id_array UUID[])
RETURNS void AS $$
DECLARE
    id_element UUID;
    i INTEGER;
BEGIN
    i := 1;
    FOREACH id_element IN ARRAY id_array
    LOOP
        UPDATE vehicles SET display_order = i WHERE id = id_element;
        i := i + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 工具の表示順を更新するRPC関数
CREATE OR REPLACE FUNCTION update_tools_display_order(id_array UUID[])
RETURNS void AS $$
DECLARE
    id_element UUID;
    i INTEGER;
BEGIN
    i := 1;
    FOREACH id_element IN ARRAY id_array
    LOOP
        UPDATE resources SET display_order = i WHERE id = id_element AND type = '工具';
        i := i + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 重機の表示順を更新するRPC関数
CREATE OR REPLACE FUNCTION update_heavy_machinery_display_order(id_array UUID[])
RETURNS void AS $$
DECLARE
    id_element UUID;
    i INTEGER;
BEGIN
    i := 1;
    FOREACH id_element IN ARRAY id_array
    LOOP
        UPDATE heavy_machinery SET display_order = i WHERE id = id_element;
        i := i + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
