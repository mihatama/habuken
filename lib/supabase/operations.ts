import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

export type QueryOptions = {
  select?: string
  filters?: Record<string, any>
  order?: { column: string; ascending: boolean }
  range?: { from: number; to: number }
}

/**
 * クライアントコンポーネント用のSupabaseクライアントを取得
 */
export function getClientSupabase(): SupabaseClient<Database> {
  return createClientComponentClient<Database>()
}

/**
 * Supabaseからデータを取得する関数
 */
export async function fetchData<T = any>(
  tableName: string,
  options: QueryOptions,
): Promise<{ data: T[]; count: number | null }> {
  const { select = "*", filters, order, range } = options

  const supabase = getClientSupabase()

  let query = supabase.from(tableName).select(select, { count: "exact" })

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value)
      }
    })
  }

  if (order) {
    query = query.order(order.column, { ascending: order.ascending })
  }

  if (range) {
    query = query.range(range.from, range.to)
  }

  const { data, error, count } = await query

  if (error) {
    console.error(`Error fetching data from ${tableName}:`, error)
    throw error
  }

  return { data: data || [], count }
}

/**
 * Supabaseにデータを挿入する関数
 */
export async function insertData<T = any>(
  tableName: string,
  data: any,
  options: { returning?: "minimal" | "representation"; client?: SupabaseClient<Database> } = {},
): Promise<T[]> {
  const { returning = "representation" } = options
  const supabase = getClientSupabase()

  const { data: result, error } = await supabase.from(tableName).insert(data).select()

  if (error) {
    console.error(`Error inserting data into ${tableName}:`, error)
    throw error
  }

  return (result || []) as T[]
}

/**
 * Supabaseのデータを更新する関数
 */
export async function updateData<T = any>(
  tableName: string,
  id: string,
  data: any,
  options: { idField?: string; client?: SupabaseClient<Database> } = {},
): Promise<T[]> {
  const { idField = "id" } = options
  const supabase = getClientSupabase()

  const { data: result, error } = await supabase.from(tableName).update(data).eq(idField, id).select()

  if (error) {
    console.error(`Error updating data in ${tableName}:`, error)
    throw error
  }

  return (result || []) as T[]
}

/**
 * Supabaseのデータを削除する関数
 */
export async function deleteData(
  tableName: string,
  id: string,
  options: { idField?: string; client?: SupabaseClient<Database> } = {},
): Promise<boolean> {
  const { idField = "id" } = options
  const supabase = getClientSupabase()

  const { error } = await supabase.from(tableName).delete().eq(idField, id)

  if (error) {
    console.error(`Error deleting data from ${tableName}:`, error)
    throw error
  }

  return true
}
