import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "../../types/supabase"

type SupabaseClientType = SupabaseClient<Database>

export interface DataAccessOptions {
  select?: string
  filters?: Record<string, any>
  order?: { column: string; ascending: boolean }
  limit?: number
  page?: number
  pageSize?: number
  idField?: string
}

/**
 * データを取得する汎用関数
 *
 * @param client Supabaseクライアントインスタンス
 * @param tableName テーブル名
 * @param options クエリオプション
 * @returns 取得したデータと件数
 */
export async function fetchData<T = any>(
  client: SupabaseClientType,
  tableName: string,
  options: DataAccessOptions = {},
): Promise<{ data: T[]; count: number | null }> {
  const { select = "*", filters, order, limit, page, pageSize, idField = "id" } = options

  try {
    let query = client.from(tableName).select(select, { count: "exact" })

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

    // ページネーション
    if (page !== undefined && pageSize !== undefined) {
      const from = page * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)
    }
    // 件数制限の適用
    else if (limit) {
      query = query.limit(limit)
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
 * データを挿入する汎用関数
 *
 * @param client Supabaseクライアントインスタンス
 * @param tableName テーブル名
 * @param data 挿入するデータ
 * @param options オプション
 * @returns 挿入されたデータ
 */
export async function insertData<T = any>(
  client: SupabaseClientType,
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
 * データを更新する汎用関数
 *
 * @param client Supabaseクライアントインスタンス
 * @param tableName テーブル名
 * @param id 更新するレコードのID
 * @param data 更新するデータ
 * @param options オプション
 * @returns 更新されたデータ
 */
export async function updateData<T = any>(
  client: SupabaseClientType,
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
 * データを削除する汎用関数
 *
 * @param client Supabaseクライアントインスタンス
 * @param tableName テーブル名
 * @param id 削除するレコードのID
 * @param options オプション
 * @returns 削除が成功したかどうか
 */
export async function deleteData(
  client: SupabaseClientType,
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
