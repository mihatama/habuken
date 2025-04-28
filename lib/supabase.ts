import { createClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"

// クライアント側のシングルトンインスタンス
let supabaseClientInstance: SupabaseClient | null = null

// クライアント側でSupabaseクライアントを取得する関数
export function getSupabaseClient(): SupabaseClient {
  if (supabaseClientInstance) {
    return supabaseClientInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  // 新しいクライアントを作成する前にログを出力
  console.log("Creating new Supabase client")

  // 新しいクライアントを作成して変数に保存
  supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "supabase-auth", // 一貫したストレージキーを使用
    },
  })

  return supabaseClientInstance
}

// サーバー側でSupabaseクライアントを取得する関数
export function getServerSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// 型定義のエクスポート
export type SupabaseClientType = ReturnType<typeof getSupabaseClient>

// データを取得する汎用関数
export async function fetchData(
  tableName: string,
  options: {
    select?: string
    filters?: Record<string, any>
    order?: { column: string; ascending: boolean }
    limit?: number
  } = {},
) {
  const { select = "*", filters, order, limit } = options
  const supabase = getSupabaseClient()

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

    // 件数制限の適用
    if (limit) {
      query = query.limit(limit)
    }

    const { data, error, count } = await query

    if (error) {
      console.error(`Error fetching data from ${tableName}:`, error)
      throw error
    }

    return { data: data || [], count }
  } catch (error) {
    console.error(`Error in fetchData for ${tableName}:`, error)
    throw error
  }
}

// データを挿入する汎用関数
export async function insertData(tableName: string, data: any, options: { returning?: string } = {}) {
  const { returning = "*" } = options
  const supabase = getSupabaseClient()

  try {
    const { data: result, error } = await supabase.from(tableName).insert(data).select(returning)

    if (error) {
      console.error(`Error inserting data into ${tableName}:`, error)
      throw error
    }

    return result || []
  } catch (error) {
    console.error(`Error in insertData for ${tableName}:`, error)
    throw error
  }
}

// データを更新する汎用関数
export async function updateData(tableName: string, id: string, data: any, options: { idField?: string } = {}) {
  const { idField = "id" } = options
  const supabase = getSupabaseClient()

  try {
    const { data: result, error } = await supabase.from(tableName).update(data).eq(idField, id).select()

    if (error) {
      console.error(`Error updating data in ${tableName}:`, error)
      throw error
    }

    return result || []
  } catch (error) {
    console.error(`Error in updateData for ${tableName}:`, error)
    throw error
  }
}

// データを削除する汎用関数
export async function deleteData(tableName: string, id: string, options: { idField?: string } = {}) {
  const { idField = "id" } = options
  const supabase = getSupabaseClient()

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

// 後方互換性のためのエイリアス
export const getClientSupabase = getSupabaseClient
export const getClientSupabaseInstance = getSupabaseClient
