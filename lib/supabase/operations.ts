import { createClient } from "@supabase/supabase-js"

// Supabaseクライアントの作成
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
)

// サーバーサイドSupabaseクライアントの作成（エイリアス）
export const createServerSupabaseClient = supabase

/**
 * クライアントコンポーネント用のSupabaseクライアントを取得
 */
export function getClientSupabase() {
  return supabase
}

/**
 * サーバーコンポーネント用のSupabaseクライアントを取得
 */
export function getServerSupabase() {
  return supabase
}

/**
 * 汎用的なSupabaseクライアント取得関数
 */
export function getSupabaseClient(clientType: "client" | "server" = "client") {
  switch (clientType) {
    case "server":
      return getServerSupabase()
    case "client":
    default:
      return getClientSupabase()
  }
}

/**
 * テーブルからデータを取得する
 */
export async function fetchData<T = any>(
  tableName: string,
  options: QueryOptions,
): Promise<{ data: T[]; count: number | null }> {
  const { select = "*", order, filters = {}, limit, page } = options

  let query = supabase.from(tableName).select(select, { count: "exact" })

  // フィルターの適用
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value)
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

  return { data: data as T[], count }
}

/**
 * テーブルにデータを挿入する
 */
export async function insertData<T = any>(tableName: string, data: any) {
  const { data: result, error } = await supabase.from(tableName).insert(data).select()

  if (error) {
    console.error(`Error inserting data into ${tableName}:`, error)
    throw error
  }

  return result as T[]
}

/**
 * テーブルのデータを更新する
 */
export async function updateData<T = any>(
  tableName: string,
  id: string,
  data: any,
  options: { idField?: string } = {},
) {
  const { idField = "id" } = options

  const { data: result, error } = await supabase.from(tableName).update(data).eq(idField, id).select()

  if (error) {
    console.error(`Error updating data in ${tableName}:`, error)
    throw error
  }

  return result as T[]
}

/**
 * テーブルからデータを削除する
 */
export async function deleteData(tableName: string, id: string, options: { idField?: string } = {}) {
  const { idField = "id" } = options

  const { error } = await supabase.from(tableName).delete().eq(idField, id)

  if (error) {
    console.error(`Error deleting data from ${tableName}:`, error)
    throw error
  }

  return true
}

export interface QueryOptions {
  select?: string
  order?: { column: string; ascending: boolean }
  filters?: Record<string, any>
  limit?: number
  page?: number
  clientType?: "client" | "server"
}
