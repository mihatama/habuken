import { createClient } from "@supabase/supabase-js"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Server component Supabase client
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseKey) {
    console.error("サーバー側のSupabase環境変数が設定されていません")
    throw new Error("サーバー側のSupabase環境変数が設定されていません")
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  })
}

// Client component Supabase client using auth-helpers-nextjs
export function createClientSupabaseClient() {
  return createClientComponentClient<Database>()
}

// Singleton pattern for client-side Supabase instance (legacy approach)
let clientInstance: ReturnType<typeof createClient> | null = null

// Legacy client component Supabase client
export function getClientSupabaseInstance() {
  if (clientInstance) return clientInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseKey) {
    console.error("クライアント側のSupabase環境変数が設定されていません")
    console.warn("デモモードのみ利用可能です")
    return null
  }

  try {
    clientInstance = createClient<Database>(supabaseUrl, supabaseKey)
    return clientInstance
  } catch (error) {
    console.error("Supabaseクライアントの作成に失敗しました:", error)
    return null
  }
}
