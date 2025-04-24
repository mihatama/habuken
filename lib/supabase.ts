import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// グローバル変数としてクライアントインスタンスを保持
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

// クライアントサイドでのみ使用するSupabaseクライアント
export function getClientSupabaseInstance() {
  // すでにインスタンスが存在する場合はそれを返す
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables")
    return null
  }

  // 新しいインスタンスを作成
  supabaseInstance = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false, // URLからセッションを検出しない
    },
    global: {
      headers: {
        "x-application-name": "construction-management",
      },
    },
  })

  console.log("Supabaseクライアントを初期化しました")
  return supabaseInstance
}

// サーバーサイドでのみ使用するSupabaseクライアント
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  })
}

export const getSupabaseClient = getClientSupabaseInstance
