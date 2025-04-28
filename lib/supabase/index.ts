import { getClientSupabase } from "./client"

// シングルトンパターンを使用してSupabaseクライアントを取得
export const supabase = getClientSupabase()

// データ操作関数をエクスポート
export {
  fetchData,
  insertData,
  updateData,
  deleteData,
  type QueryOptions,
} from "./operations"

// クライアント取得関数をエクスポート
export { getClientSupabase, getServerSupabase, STORAGE_KEY } from "./client"
