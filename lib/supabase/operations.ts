import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import { getSupabaseClient } from "./supabaseClient"

export type QueryOptions = {
  select?: string
  filters?: Record<string, any>
  order?: { column: string; ascending: boolean }
  range?: { from: number; to: number }
  limit?: number
  page?: number
  client?: SupabaseClient<Database>
}

// クライアントコンポーネント用のSupabaseクライアントを取得する関数
export function getClientSupabase(): SupabaseClient<Database> {
  return getSupabaseClient()
}

/**
 * Supabaseからデータを取得する関数
 */
export async function fetchData<T = any>(
  tableName: string,
  options: QueryOptions = {},
): Promise<{ data: T[]; count: number | null }> {
  const { select = "*", filters, order, range, limit, page, client } = options

  // クライアントが提供されている場合はそれを使用、そうでなければシングルトンクライアントを使用
  const supabase = client || getSupabaseClient()

  try {
    let query = supabase.from(tableName).select(select, { count: "exact" })

    // フィルターの適用
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (typeof value === "string" && value.includes("%")) {
            query = query.ilike(key, value)
          } else {
            query = query.eq(key, value)
          }
        }
      })
    }

    // 並び順の適用
    if (order) {
      query = query.order(order.column, { ascending: order.ascending })
    }

    // 範囲指定の適用
    if (range) {
      query = query.range(range.from, range.to)
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
 * Supabaseにデータを挿入する関数
 */
export async function insertData<T = any>(
  tableName: string,
  data: any,
  options: { returning?: string; client?: SupabaseClient<Database> } = {},
): Promise<T[]> {
  const { returning = "*", client } = options
  const supabase = client || getSupabaseClient()

  try {
    const { data: result, error } = await supabase.from(tableName).insert(data).select(returning)

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
 * Supabaseのデータを更新する関数
 */
export async function updateData<T = any>(
  tableName: string,
  id: string,
  data: any,
  options: { idField?: string; returning?: string; client?: SupabaseClient<Database> } = {},
): Promise<T[]> {
  const { idField = "id", returning = "*", client } = options
  const supabase = client || getSupabaseClient()

  try {
    const { data: result, error } = await supabase.from(tableName).update(data).eq(idField, id).select(returning)

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
 * Supabaseのデータを削除する関数
 */
export async function deleteData(
  tableName: string,
  id: string,
  options: { idField?: string; client?: SupabaseClient<Database> } = {},
): Promise<boolean> {
  const { idField = "id", client } = options
  const supabase = client || getSupabaseClient()

  try {
    const { error } = await supabase.from(tableName).delete().eq(idField, id)

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
