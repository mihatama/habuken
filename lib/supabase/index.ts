/**
 * Supabaseクライアントのメインエントリーポイント
 *
 * このファイルは、クライアントとサーバーの両方のSupabaseクライアントへのアクセスを提供します。
 * - クライアントコンポーネント: `getSupabaseClient()`を使用
 * - サーバーコンポーネント: `getServerSupabaseClient()`を使用（別途インポート）
 */

// 既存のsupabase.tsからクライアント関数をインポート
import { getSupabaseClient, getClientSupabase, getClientSupabaseInstance } from "../supabase"
export { getSupabaseClient, getClientSupabase, getClientSupabaseInstance }

// 型定義のエクスポート
export type { SupabaseClientType } from "../supabase"

// データ操作関数のエクスポート
export { fetchData, insertData, updateData, deleteData } from "../supabase"
