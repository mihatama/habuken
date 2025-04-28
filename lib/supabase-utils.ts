import { createClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "../types/supabase"

// ===== 型定義 =====

// クライアント側のSupabaseタイプ
export type SupabaseClientType = "default" | "auth" | "storage"

// サーバー側のSupabaseタイプ
export type ServerSupabaseClientType = "admin" | "service" | "anon"
export type ServerClientType = "server" | "action" | ServerSupabaseClientType

// データアクセスオプション
export interface DataAccessOptions {
  select?: string
  order?: { column: string; ascending: boolean }
  filters?: Record<string, any>
  limit?: number
  page?: number
}

// サーバークエリオプション
export interface ServerQueryOptions extends DataAccessOptions {
  clientType?: ServerClientType
  client?: SupabaseClient<Database>
}

// ===== クライアント側の関数 =====

// クライアント側のシングルトンインスタンス
let clientSupabaseInstance: SupabaseClient<Database> | null = null

/**
 * クライアント側でSupabaseクライアントを取得する関数
 */
export function getClientSupabase(type: SupabaseClientType = "default"): SupabaseClient<Database> {
  if (clientSupabaseInstance) {
    return clientSupabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  // 新しいクライアントを作成
  clientSupabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "supabase-auth",
    },
  })

  return clientSupabaseInstance
}

/**
 * クライアント側のSupabaseインスタンスをリセットする関数
 */
export function resetClientSupabase(): void {
  clientSupabaseInstance = null
}

// ===== サーバー側の関数 =====

/**
 * サーバー側でSupabaseクライアントを取得する関数
 */
export function getServerSupabase(type: ServerClientType = "server"): SupabaseClient<Database> {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""

  let supabaseKey: string

  if (type === "admin" || type === "service" || type === "server") {
    // サービスロールキーを使用（管理者権限）
    supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  } else {
    // 匿名キーを使用（一般ユーザー権限）
    supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// ===== 共通データアクセス関数 =====

/**
 * テーブルからデータを取得する基本関数
 */
export async function fetchData<T = any>(
  client: SupabaseClient<Database>,
  tableName: string,
  options: DataAccessOptions = {},
): Promise<{ data: T[]; count: number | null }> {
  const { select = "*", order, filters = {}, limit, page } = options

  try {
    let query = client.from(tableName).select(select, { count: "exact" })

    // フィルターの適用
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (typeof value === "string" && value.includes("%")) {
          query = query.ilike(key, value)
        } else {
          query = query.eq(key, value)
        }
      }
    })

    // 並び順の適用
    if (order) {
      query = query.order(order.column, { ascending: order.ascending })
    }

    // ページネーションの適用
    if (limit) {
      query = query.limit(limit)

      if (page && page > 1) {
        query = query.range((page - 1) * limit, page * limit - 1)
      }
    }

    const { data, error, count } = await query

    if (error) {
      console.error(`Error fetching data from ${tableName}:`, error)
      throw error
    }

    return { data: (data || []) as T[], count }
  } catch (error) {
    console.error(`Error in fetchData for ${tableName}:`, error)
    throw error
  }
}

/**
 * テーブルにデータを挿入する基本関数
 */
export async function insertData<T = any>(
  client: SupabaseClient<Database>,
  tableName: string,
  data: any,
  options: { returning?: string } = {},
): Promise<T[]> {
  const { returning = "*" } = options

  try {
    const { data: result, error } = await client.from(tableName).insert(data).select(returning)

    if (error) {
      console.error(`Error inserting data into ${tableName}:`, error)
      throw error
    }

    return (result || []) as T[]
  } catch (error) {
    console.error(`Error in insertData for ${tableName}:`, error)
    throw error
  }
}

/**
 * テーブルのデータを更新する基本関数
 */
export async function updateData<T = any>(
  client: SupabaseClient<Database>,
  tableName: string,
  id: string | number,
  data: any,
  options: { idField?: string; returning?: string } = {},
): Promise<T[]> {
  const { idField = "id", returning = "*" } = options

  try {
    const { data: result, error } = await client.from(tableName).update(data).eq(idField, id).select(returning)

    if (error) {
      console.error(`Error updating data in ${tableName}:`, error)
      throw error
    }

    return (result || []) as T[]
  } catch (error) {
    console.error(`Error in updateData for ${tableName}:`, error)
    throw error
  }
}

/**
 * テーブルからデータを削除する基本関数
 */
export async function deleteData(
  client: SupabaseClient<Database>,
  tableName: string,
  id: string | number,
  options: { idField?: string } = {},
): Promise<boolean> {
  const { idField = "id" } = options

  try {
    const { error } = await client.from(tableName).delete().eq(idField, id)

    if (error) {
      console.error(`Error deleting data from ${tableName}:`, error)
      throw error
    }

    return true
  } catch (error) {
    console.error(`Error in deleteData for ${tableName}:`, error)
    throw error
  }
}

// ===== クライアント側のラッパー関数 =====

/**
 * クライアント側でデータを取得する関数
 */
export async function fetchClientData<T = any>(tableName: string, options: DataAccessOptions = {}) {
  const client = getClientSupabase()
  return fetchData<T>(client, tableName, options)
}

/**
 * クライアント側でデータを挿入する関数
 */
export async function insertClientData<T = any>(tableName: string, data: any, options: { returning?: string } = {}) {
  const client = getClientSupabase()
  return insertData<T>(client, tableName, data, options)
}

/**
 * クライアント側でデータを更新する関数
 */
export async function updateClientData<T = any>(
  tableName: string,
  id: string | number,
  data: any,
  options: { idField?: string; returning?: string } = {},
) {
  const client = getClientSupabase()
  return updateData<T>(client, tableName, id, data, options)
}

/**
 * クライアント側でデータを削除する関数
 */
export async function deleteClientData(tableName: string, id: string | number, options: { idField?: string } = {}) {
  const client = getClientSupabase()
  return deleteData(client, tableName, id, options)
}

// ===== サーバー側のラッパー関数 =====

/**
 * サーバー側でデータを取得する関数
 */
export async function fetchServerData<T = any>(tableName: string, options: ServerQueryOptions = {}) {
  const { clientType = "server", client, ...restOptions } = options
  const supabase = client || getServerSupabase(clientType)
  return fetchData<T>(supabase, tableName, restOptions)
}

/**
 * サーバー側でデータを挿入する関数
 */
export async function insertServerData<T = any>(
  tableName: string,
  data: any,
  options: {
    clientType?: ServerClientType
    returning?: string
    client?: SupabaseClient<Database>
  } = {},
) {
  const { clientType = "server", returning = "*", client } = options
  const supabase = client || getServerSupabase(clientType)
  return insertData<T>(supabase, tableName, data, { returning })
}

/**
 * サーバー側でデータを更新する関数
 */
export async function updateServerData<T = any>(
  tableName: string,
  id: string | number,
  data: any,
  options: {
    clientType?: ServerClientType
    idField?: string
    returning?: string
    client?: SupabaseClient<Database>
  } = {},
) {
  const { clientType = "server", idField = "id", returning = "*", client } = options
  const supabase = client || getServerSupabase(clientType)
  return updateData<T>(supabase, tableName, id, data, { idField, returning })
}

/**
 * サーバー側でデータを削除する関数
 */
export async function deleteServerData(
  tableName: string,
  id: string | number,
  options: {
    clientType?: ServerClientType
    idField?: string
    client?: SupabaseClient<Database>
  } = {},
) {
  const { clientType = "server", idField = "id", client } = options
  const supabase = client || getServerSupabase(clientType)
  return deleteData(supabase, tableName, id, { idField })
}
