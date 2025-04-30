import { createClient } from "@supabase/supabase-js"

// 環境変数からSupabase URLとAnon Keyを取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// シングルトンパターンでSupabaseクライアントを作成
let supabaseInstance = null

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true, // セッションを永続化
        autoRefreshToken: true, // トークンの自動更新
        detectSessionInUrl: true, // URLからセッションを検出
      },
    })
  }
  return supabaseInstance
}

export async function fetchData<T>(tableName: string, options: any = {}): Promise<{ data: T[] | null; error: any }> {
  const { select = "*", filters = {}, order = {} } = options
  const supabase = getSupabaseClient()

  let query = supabase.from(tableName).select(select)

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
    return { data: null, error }
  }

  return { data: data as T[], error: null }
}
