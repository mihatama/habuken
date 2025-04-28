// lib/supabase.ts
// Supabase関連の全ての機能をエクスポートするメインファイル

// クライアント作成関数をエクスポート
export {
  getClientSupabase,
  getClientSupabaseInstance,
  getServerSupabase,
  createServerClient,
  getSupabaseClient,
  getActionSupabase,
  createServerSupabaseClient,
} from "@/lib/supabase/client"

// データ操作関数をエクスポート
export {
  fetchData,
  insertData,
  updateData,
  deleteData,
  fetchDataFromTable,
  insertDataToTable,
  updateDataInTable,
  deleteDataFromTable,
  type QueryOptions,
} from "@/lib/supabase/operations"

// カスタムフックをエクスポート（もし存在する場合）
export * from "@/lib/supabase/hooks"
