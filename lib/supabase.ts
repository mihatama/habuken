// lib/supabase.ts
// 相対パスのインポートを絶対パスに変更
import { getClientSupabase, fetchData, insertData, updateData, deleteData } from "@/lib/supabase/operations"
import { getServerSupabase } from "@/lib/supabase/operations"

// 既存の関数をエクスポート
export {
  getClientSupabase,
  fetchData,
  insertData,
  updateData,
  deleteData,
  getServerSupabase,
  getServerSupabase as createServerSupabaseClient,
}

// 追加の関数やエイリアスがあればここに追加
