import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// サーバーサイド用のSupabaseクライアント
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient<Database>(supabaseUrl, supabaseKey)
}

// クライアントサイド用のSupabaseクライアント（シングルトンパターン）
let clientSupabaseInstance: ReturnType<typeof createClientSupabaseClient> | null = null

export const createClientSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient<Database>(supabaseUrl, supabaseKey)
}

// クライアントサイドでのシングルトンインスタンスを取得
export const getClientSupabaseInstance = () => {
  if (clientSupabaseInstance) return clientSupabaseInstance
  clientSupabaseInstance = createClientSupabaseClient()
  return clientSupabaseInstance
}
