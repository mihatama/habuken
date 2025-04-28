// クライアント側の関数をエクスポート
export {
  getClientSupabase,
  getClientSupabaseInstance,
  getSupabaseClient,
} from "./supabase/client"

// サーバー側の関数を条件付きでエクスポート
// これらはサーバーコンポーネントでのみ使用可能
export type { QueryOptions } from "./supabase/operations"

export {
  fetchData,
  insertData,
  updateData,
  deleteData,
  fetchDataFromTable,
  insertDataToTable,
  updateDataFromTable,
  deleteDataFromTable,
} from "./supabase/operations"

// 注意: サーバー側の関数は直接インポートしてください
// import { getServerSupabase } from "@/lib/supabase/server"
