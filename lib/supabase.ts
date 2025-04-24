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
// この関数はクライアントコンポーネントでのみ使用すべき
export const getClientSupabaseInstance = () => {
  // サーバーサイドでの使用を完全に禁止
  if (typeof window === "undefined") {
    throw new Error("getClientSupabaseInstance should only be called in client components")
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase URL or Anon Key")
  }

  // クライアントサイドの場合は、windowオブジェクトにクライアントを保存する
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

// サーバーサイドでも安全に使用できるSupabaseクライアント
// これはgetClientSupabaseInstanceの代替として使用できる
export const createSafeSupabaseClient = () => {
  // サーバーサイドの場合は公開クライアントを返す
  if (typeof window === "undefined") {
    return getPublicSupabaseClient()
  }

  // クライアントサイドの場合はクライアントインスタンスを返す
  return getClientSupabaseInstance()
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
