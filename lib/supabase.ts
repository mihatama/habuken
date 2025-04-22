import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

// サーバーコンポーネント用のSupabaseクライアント
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient<Database>(supabaseUrl, supabaseKey, {
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

  // 環境変数が存在するか確認し、コンソールに出力（デバッグ用）
  console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase環境変数が設定されていません")
    throw new Error("Supabase環境変数が設定されていません")
  }

  clientInstance = createClient<Database>(supabaseUrl, supabaseKey)
  return clientInstance
}
