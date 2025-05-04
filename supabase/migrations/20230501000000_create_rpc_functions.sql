-- プロジェクトと関連リソースを一度に取得するRPC関数
CREATE OR REPLACE FUNCTION get_projects_with_resources()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  status text,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz,
  created_by uuid,
  updated_at timestamptz,
  client_name text,
  location text,
  budget numeric,
  resources jsonb
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.status,
    p.start_date,
    p.end_date,
    p.created_at,
    p.created_by,
    p.updated_at,
    p.client_name,
    p.location,
    p.budget,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', pa.id,
          'project_id', pa.project_id,
          'resource_id', pa.resource_id,
          'resource_type', pa.resource_type,
          'start_date', pa.start_date,
          'end_date', pa.end_date,
          'resource_details', CASE 
            WHEN pa.resource_type = 'staff' THEN 
              (SELECT jsonb_build_object('id', s.id, 'full_name', s.full_name, 'role', s.role) FROM staff s WHERE s.id = pa.resource_id)
            WHEN pa.resource_type = 'heavy_machinery' THEN 
              (SELECT jsonb_build_object('id', h.id, 'name', h.name, 'type', h.type) FROM heavy_machinery h WHERE h.id = pa.resource_id)
            WHEN pa.resource_type = 'vehicle' THEN 
              (SELECT jsonb_build_object('id', v.id, 'name', v.name, 'type', v.type) FROM vehicles v WHERE v.id = pa.resource_id)
            WHEN pa.resource_type = 'tool' THEN 
              (SELECT jsonb_build_object('id', t.id, 'name', t.name, 'type', t.type) FROM tools t WHERE t.id = pa.resource_id)
            ELSE NULL
          END
        )
      ) 
      FROM project_assignments pa
      WHERE pa.project_id = p.id
    ) AS resources
  FROM projects p
  ORDER BY p.created_at DESC;
END;
$$;

-- ダッシュボード用のサマリーデータを取得するRPC関数
CREATE OR REPLACE FUNCTION get_dashboard_summary()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'projects', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'active', COUNT(*) FILTER (WHERE status = 'active'),
        'completed', COUNT(*) FILTER (WHERE status = 'completed'),
        'recent', jsonb_agg(p) FILTER (WHERE p IS NOT NULL)
      )
      FROM (
        SELECT jsonb_build_object(
          'id', id,
          'name', name,
          'status', status,
          'start_date', start_date,
          'end_date', end_date
        ) AS p
        FROM projects
        ORDER BY created_at DESC
        LIMIT 5
      ) sub
    ),
    'staff', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'available', COUNT(*) FILTER (
          WHERE id NOT IN (
            SELECT DISTINCT resource_id 
            FROM project_assignments 
            WHERE resource_type = 'staff' 
            AND current_date BETWEEN start_date AND end_date
          )
        ),
        'recent', jsonb_agg(s) FILTER (WHERE s IS NOT NULL)
      )
      FROM (
        SELECT jsonb_build_object(
          'id', id,
          'full_name', full_name,
          'role', role
        ) AS s
        FROM staff
        ORDER BY created_at DESC
        LIMIT 5
      ) sub
    ),
    'resources', (
      SELECT jsonb_build_object(
        'heavy_machinery', (
          SELECT COUNT(*) FROM heavy_machinery
        ),
        'vehicles', (
          SELECT COUNT(*) FROM vehicles
        ),
        'tools', (
          SELECT COUNT(*) FROM tools
        )
      )
    ),
    'daily_reports', (
      SELECT COUNT(*) FROM daily_reports WHERE created_at >= current_date - interval '30 days'
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- 特定のプロジェクトの詳細情報を取得するRPC関数
CREATE OR REPLACE FUNCTION get_project_details(project_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'project', (
      SELECT jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'description', p.description,
        'status', p.status,
        'start_date', p.start_date,
        'end_date', p.end_date,
        'created_at', p.created_at,
        'client_name', p.client_name,
        'location', p.location,
        'budget', p.budget,
        'created_by', (
          SELECT jsonb_build_object(
            'id', u.id,
            'email', u.email,
            'name', u.user_metadata->>'full_name'
          )
          FROM auth.users u
          WHERE u.id = p.created_by
        )
      )
      FROM projects p
      WHERE p.id = project_id
    ),
    'resources', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', pa.id,
          'resource_id', pa.resource_id,
          'resource_type', pa.resource_type,
          'start_date', pa.start_date,
          'end_date', pa.end_date,
          'details', CASE 
            WHEN pa.resource_type = 'staff' THEN 
              (SELECT jsonb_build_object('id', s.id, 'full_name', s.full_name, 'role', s.role) FROM staff s WHERE s.id = pa.resource_id)
            WHEN pa.resource_type = 'heavy_machinery' THEN 
              (SELECT jsonb_build_object('id', h.id, 'name', h.name, 'type', h.type) FROM heavy_machinery h WHERE h.id = pa.resource_id)
            WHEN pa.resource_type = 'vehicle' THEN 
              (SELECT jsonb_build_object('id', v.id, 'name', v.name, 'type', v.type) FROM vehicles v WHERE v.id = pa.resource_id)
            WHEN pa.resource_type = 'tool' THEN 
              (SELECT jsonb_build_object('id', t.id, 'name', t.name, 'type', t.type) FROM tools t WHERE t.id = pa.resource_id)
            ELSE NULL
          END
        )
      )
      FROM project_assignments pa
      WHERE pa.project_id = project_id
    ),
    'daily_reports', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', dr.id,
          'date', dr.report_date,
          'status', dr.status,
          'created_at', dr.created_at,
          'created_by', (
            SELECT jsonb_build_object(
              'id', u.id,
              'email', u.email,
              'name', u.user_metadata->>'full_name'
            )
            FROM auth.users u
            WHERE u.id = dr.created_by
          )
        )
      )
      FROM daily_reports dr
      WHERE dr.project_id = project_id
      ORDER BY dr.report_date DESC
      LIMIT 10
    )
  ) INTO result;
  
  RETURN result;
END;
$$;
