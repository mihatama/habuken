-- リアルタイム機能を有効化するためのマイグレーション

-- リアルタイム機能を有効化するスキーマ
ALTER PUBLICATION supabase_realtime ADD TABLE public.staff;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leave_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.heavy_machinery;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.resources;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deal_files;
ALTER PUBLICATION supabase_realtime ADD TABLE public.safety_inspections;

-- REPLICA IDENTITY FULLを設定
-- これにより、変更前のすべての列データがリアルタイムイベントに含まれるようになります
ALTER TABLE public.staff REPLICA IDENTITY FULL;
ALTER TABLE public.projects REPLICA IDENTITY FULL;
ALTER TABLE public.daily_reports REPLICA IDENTITY FULL;
ALTER TABLE public.leave_requests REPLICA IDENTITY FULL;
ALTER TABLE public.heavy_machinery REPLICA IDENTITY FULL;
ALTER TABLE public.vehicles REPLICA IDENTITY FULL;
ALTER TABLE public.resources REPLICA IDENTITY FULL;
ALTER TABLE public.deals REPLICA IDENTITY FULL;
ALTER TABLE public.deal_files REPLICA IDENTITY FULL;
ALTER TABLE public.safety_inspections REPLICA IDENTITY FULL;
