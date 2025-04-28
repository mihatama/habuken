import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import { getClientSupabase } from "./client"

/**
 * Supabaseクライアントのシングルトンインスタンスを取得する関数
 * アプリケーション全体で単一のインスタンスを使用することで、
 * 複数のGoTrueClientインスタンスが作成される問題を回避します
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  return getClientSupabase()
}

// 後方互換性のための関数
export const getClientSupabaseInstance = getSupabaseClient

async function fetchDataFromTable(tableName: string, options: any) {
  const supabase = getSupabaseClient()
  let query = supabase.from(tableName).select()

  if (options.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
  }

  if (options.order) {
    query = query.order(options.order.column, { ascending: options.order.ascending })
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching data:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

export { fetchDataFromTable }
