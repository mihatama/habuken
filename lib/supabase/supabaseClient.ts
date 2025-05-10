import { createClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"

// クライアント側のシングルトンインスタンス
let clientInstance: SupabaseClient | null = null

// サーバー側のシングルトンインスタンス
let serverInstance: SupabaseClient | null = null

/**
 * クライアント側のSupabaseインスタンスを取得する
 * @returns Supabaseクライアントインスタンス
 */
export function getClientSupabase(): SupabaseClient {
  if (clientInstance) return clientInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and anon key must be provided")
  }

  clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "supabase.auth.token",
      storage: {
        getItem: (key) => {
          if (typeof window === "undefined") return null
          return JSON.parse(window.sessionStorage.getItem(key) || "null")
        },
        setItem: (key, value) => {
          if (typeof window === "undefined") return
          window.sessionStorage.setItem(key, JSON.stringify(value))
        },
        removeItem: (key) => {
          if (typeof window === "undefined") return
          window.sessionStorage.removeItem(key)
        },
      },
    },
  })
  return clientInstance
}

/**
 * サーバー側のSupabaseインスタンスを取得する
 * @returns Supabaseサーバーインスタンス
 */
export function getServerSupabase(type?: "admin"): SupabaseClient {
  // サーバーサイドでのみ実行されるべき
  if (typeof window !== "undefined") {
    console.warn("getServerSupabase was called on the client side")
    return getClientSupabase()
  }

  if (serverInstance) return serverInstance

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase URL and service role key must be provided")
  }

  serverInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  })
  return serverInstance
}

// ダミーのCSRFトークン取得関数（実際には適切な実装が必要です）
function getCsrfToken(): string {
  // ここにCSRFトークンを取得するロジックを実装します
  // 例：Cookieから取得、またはサーバーから取得
  return "dummy_csrf_token"
}

/**
 * テーブルからデータを取得する関数
 */
export async function fetchDataFromTable(tableName: string, options: any = {}) {
  const { select = "*", filters = {}, order = {} } = options
  const supabase = getClientSupabase()

  // 適切なヘッダーを設定
  const headers = {
    "X-CSRF-Token": getCsrfToken(),
    "Content-Type": "application/json",
    Accept: "application/json",
  }

  let query = supabase.from(tableName).select(select).headers(headers)

  // フィルターの適用方法を修正
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      // nullチェックを追加
      if (value !== undefined && value !== null) {
        query = query.eq(key, value)
      }
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

  return { data, error: null }
}

// デフォルトエクスポートとしてクライアントインスタンスを提供
const supabaseClient = getClientSupabase()
export default supabaseClient
