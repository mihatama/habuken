// lib/supabase.ts
// クライアント側で安全に使用できる関数のみをエクスポート

// クライアント側の関数をエクスポート
export {
  getClientSupabase,
  getClientSupabaseInstance,
  createDirectClient,
} from "./supabase/client"

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
} from "./supabase/operations"

// 注意: サーバー側の関数は直接インポートしてください
// import { getServerSupabase } from "@/lib/supabase/server"
// import { fetchServerData } from "@/lib/supabase/server-operations"
