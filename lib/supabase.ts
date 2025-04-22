import { createClient } from "@supabase/supabase-js"

// サーバーコンポーネント用のSupabaseクライアント
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_ANON_KEY!

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  })
}

// シングルトンパターンでクライアント側のSupabaseインスタンスを管理
let clientInstance: ReturnType<typeof createClient> | null = null

// クライアントコンポーネント用のSupabaseクライアント
export function getClientSupabaseInstance() {
  if (clientInstance) return clientInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  clientInstance = createClient(supabaseUrl, supabaseKey)
  return clientInstance
}
