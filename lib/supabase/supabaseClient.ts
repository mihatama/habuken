import { createClient as supabaseCreateClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// 名前付きエクスポートとして createClient を追加
export const createClient = supabaseCreateClient

export const supabaseClient = supabaseCreateClient(supabaseUrl, supabaseAnonKey)

export function getClientSupabase() {
  return supabaseClient
}

// シングルトンパターンでクライアントを取得する関数
export function getClientSupabaseSingleton() {
  return supabaseClient
}

export async function fetchDataFromTable(tableName: string, options: any) {
  const { filters = {}, order = {} } = options

  let query = getClientSupabase().from(tableName).select("*")

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
  }

  if (order && order.column) {
    query = query.order(order.column, { ascending: order.ascending })
  }

  const { data, error } = await query

  if (error) {
    console.error(`Error fetching data from ${tableName}:`, error)
    throw error
  }

  return { data, error }
}
