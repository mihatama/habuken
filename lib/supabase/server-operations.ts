// このファイルはサーバーコンポーネントでのみインポートしてください
// 'use server' ディレクティブを持つファイルまたはサーバーコンポーネントでのみ使用可能

import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import { getServerSupabaseClient } from "./server"

export interface ServerQueryOptions {
  select?: string
  order?: { column: string; ascending: boolean }
  filters?: Record<string, any>
  limit?: number
  page?: number
  clientType?: "server" | "action"
  client?: SupabaseClient<Database>
}

/**
 * テーブルからデータを取得する（サーバー側）
 */
export async function fetchServerData<T = any>(
  tableName: string,
  options: ServerQueryOptions = {},
): Promise<{ data: T[]; count: number | null }> {
  const { select = "*", order, filters = {}, limit, page, clientType = "server", client } = options

  // クライアントが提供されている場合はそれを使用、そうでなければ適切なクライアントを取得
  const supabase = client || getServerSupabaseClient(clientType)

  try {
    let query = supabase.from(tableName).select(select, { count: "exact" })

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
 * テーブルにデータを挿入する（サーバー側）
 */
export async function insertServerData<T = any>(
  tableName: string,
  data: any,
  options: {
    clientType?: "server" | "action"
    returning?: string
    client?: SupabaseClient<Database>
  } = {},
): Promise<T[]> {
  const { clientType = "server", returning = "*", client } = options
  const supabase = client || getServerSupabaseClient(clientType)

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
 * テーブルのデータを更新する（サーバー側）
 */
export async function updateServerData<T = any>(
  tableName: string,
  id: string,
  data: any,
  options: {
    clientType?: "server" | "action"
    idField?: string
    returning?: string
    client?: SupabaseClient<Database>
  } = {},
): Promise<T[]> {
  const { clientType = "server", idField = "id", returning = "*", client } = options
  const supabase = client || getServerSupabaseClient(clientType)

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
 * テーブルからデータを削除する（サーバー側）
 */
export async function deleteServerData(
  tableName: string,
  id: string,
  options: {
    clientType?: "server" | "action"
    idField?: string
    client?: SupabaseClient<Database>
  } = {},
): Promise<boolean> {
  const { clientType = "server", idField = "id", client } = options
  const supabase = client || getServerSupabaseClient(clientType)

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
