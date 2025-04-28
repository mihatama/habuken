// クライアント側のエクスポート
export {
  getSupabaseClient,
  resetSupabaseClient,
  getClientSupabase,
  getClientSupabaseInstance,
  type SupabaseClientType,
} from "./client"

// サーバー側のエクスポート
export {
  getServerSupabaseClient,
  createServerSupabaseClient,
  getServerSupabase,
  getActionSupabase,
  createServerClient,
  type ServerSupabaseClientType,
  type ServerClientType,
} from "./server"

// データアクセス関数のエクスポート
export {
  fetchData,
  insertData,
  updateData,
  deleteData,
  type DataAccessOptions,
} from "./data-access"

// クライアント側用のラッパー関数
import { getSupabaseClient } from "./client"
import {
  fetchData as fetchDataBase,
  insertData as insertDataBase,
  updateData as updateDataBase,
  deleteData as deleteDataBase,
  type DataAccessOptions,
} from "./data-access"

/**
 * クライアント側でデータを取得する関数
 * getSupabaseClient()を自動的に使用
 */
export async function fetchDataClient<T = any>(tableName: string, options: DataAccessOptions = {}) {
  const client = getSupabaseClient()
  return fetchDataBase<T>(client, tableName, options)
}

/**
 * クライアント側でデータを挿入する関数
 * getSupabaseClient()を自動的に使用
 */
export async function insertDataClient<T = any>(tableName: string, data: any, options: { returning?: string } = {}) {
  const client = getSupabaseClient()
  return insertDataBase<T>(client, tableName, data, options)
}

/**
 * クライアント側でデータを更新する関数
 * getSupabaseClient()を自動的に使用
 */
export async function updateDataClient<T = any>(
  tableName: string,
  id: string | number,
  data: any,
  options: { idField?: string; returning?: string } = {},
) {
  const client = getSupabaseClient()
  return updateDataBase<T>(client, tableName, id, data, options)
}

/**
 * クライアント側でデータを削除する関数
 * getSupabaseClient()を自動的に使用
 */
export async function deleteDataClient(tableName: string, id: string | number, options: { idField?: string } = {}) {
  const client = getSupabaseClient()
  return deleteDataBase(client, tableName, id, options)
}
