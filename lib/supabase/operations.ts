import { getSupabaseClient } from "./client"
import type { SupabaseClientType } from "./client"

/**
 * データ取得オプション
 */
export interface FetchDataOptions {
  select?: string
  filters?: Record<string, any>
  order?: { column: string; ascending: boolean }
  limit?: number
  page?: number
  pageSize?: number
}

/**
 * データを取得する汎用関数
 *
 * @param tableName テーブル名
 * @param options 取得オプション
 * @param client Supabaseクライアント（省略可）
 * @returns 取得結果
 */
export async function fetchData<T = any>(
  tableName: string,
  options: FetchDataOptions = {},
  client?: SupabaseClientType,
) {
  const { select = "*", filters, order, limit, page, pageSize = 10 } = options

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

    // ページネーションの適用
    if (page !== undefined && pageSize) {
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)
    } else if (limit) {
      query = query.limit(limit)
    }

    const { data, error, count } = await query

    if (error) {
      console.error(`Error fetching data from ${tableName}:`, error)
      throw error
    }

    return {
      data: data as T[],
      count: count || 0,
      page: page,
      pageSize: pageSize,
      totalPages: count ? Math.ceil(count / pageSize) : 0,
    }
  } catch (error) {
    console.error(`Error in fetchData for ${tableName}:`, error)
    throw error
  }
}

/**
 * データを挿入する汎用関数
 *
 * @param tableName テーブル名
 * @param data 挿入するデータ
 * @param options オプション
 * @param client Supabaseクライアント（省略可）
 * @returns 挿入結果
 */
export async function insertData<T = any>(
  tableName: string,
  data: any,
  options: { returning?: string } = {},
  client?: SupabaseClientType,
) {
  const { returning = "*" } = options
  const supabase = client || getSupabaseClient()

  try {
    const { data: result, error } = await supabase.from(tableName).insert(data).select(returning)

    if (error) {
      console.error(`Error inserting data into ${tableName}:`, error)
      throw error
    }

    return result as T[]
  } catch (error) {
    console.error(`Error in insertData for ${tableName}:`, error)
    throw error
  }
}

/**
 * データを更新する汎用関数
 *
 * @param tableName テーブル名
 * @param id 更新対象のID
 * @param data 更新データ
 * @param options オプション
 * @param client Supabaseクライアント（省略可）
 * @returns 更新結果
 */
export async function updateData<T = any>(
  tableName: string,
  id: string | number,
  data: any,
  options: { idField?: string; returning?: string } = {},
  client?: SupabaseClientType,
) {
  const { idField = "id", returning = "*" } = options
  const supabase = client || getSupabaseClient()

  try {
    const { data: result, error } = await supabase.from(tableName).update(data).eq(idField, id).select(returning)

    if (error) {
      console.error(`Error updating data in ${tableName}:`, error)
      throw error
    }

    return result as T[]
  } catch (error) {
    console.error(`Error in updateData for ${tableName}:`, error)
    throw error
  }
}

/**
 * データを削除する汎用関数
 *
 * @param tableName テーブル名
 * @param id 削除対象のID
 * @param options オプション
 * @param client Supabaseクライアント（省略可）
 * @returns 削除成功フラグ
 */
export async function deleteData(
  tableName: string,
  id: string | number,
  options: { idField?: string } = {},
  client?: SupabaseClientType,
) {
  const { idField = "id" } = options
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
