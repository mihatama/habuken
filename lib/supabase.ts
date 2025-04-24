import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// 環境変数
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// サーバーサイド用のクライアント（シングルトン）
let serverSupabase: ReturnType<typeof createClient<Database>> | null = null

export const createServerSupabaseClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase URL or Service Key")
  }

  if (!serverSupabase) {
    serverSupabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    })
  }

  return serverSupabase
}

// 公開API用のクライアント（シングルトン）
let publicSupabase: ReturnType<typeof createClient<Database>> | null = null

export const getPublicSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase URL or Anon Key")
  }

  if (!publicSupabase) {
    publicSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    })
  }

  return publicSupabase
}

// クライアントサイド用のクライアント
// サーバーサイドでも使用可能だが、その場合は公開クライアントと同じ設定になる
export const getClientSupabaseInstance = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase URL or Anon Key")
  }

  // サーバーサイドの場合は公開クライアントを返す
  if (typeof window === "undefined") {
    return getPublicSupabaseClient()
  }

  // クライアントサイドの場合は、windowオブジェクトにクライアントを保存する
  // これにより、複数のインスタンスが作成されるのを防ぐ
  if (!(window as any).__supabaseClient) {
    ;(window as any).__supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  }

  return (window as any).__supabaseClient
}

// クライアントをリセットする（主にテスト用）
export const resetSupabaseClients = () => {
  serverSupabase = null
  publicSupabase = null
  if (typeof window !== "undefined") {
    delete (window as any).__supabaseClient
  }
  console.log("Supabase client instances have been reset")
}
