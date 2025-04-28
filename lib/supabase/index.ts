/**
 * Supabaseクライアントとデータ操作のメインエントリーポイント
 *
 * このファイルは、クライアント側とサーバー側の両方で使用される
 * Supabase関連の関数をエクスポートします。
 *
 * クライアント側では:
 * - getSupabaseClient(): クライアントコンポーネント用のSupabaseクライアント
 * - データ操作関数 (fetchData, insertData, updateData, deleteData)
 *
 * サーバー側では:
 * - getServerSupabaseClient(): サーバーコンポーネント用のSupabaseクライアント
 * - サーバー専用のデータ操作関数
 */

// クライアント側の関数をエクスポート
export {
  getSupabaseClient,
  getSupabaseClientInstance,
  type SupabaseClientType,
} from "./client"

// データ操作関数をエクスポート
export {
  fetchData,
  insertData,
  updateData,
  deleteData,
  type QueryOptions,
} from "./operations"

// サーバー側の関数は直接インポートする必要があります
// import { getServerSupabaseClient } from "./server";
// import { fetchServerData } from "./server-operations";
