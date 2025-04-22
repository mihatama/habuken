import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

// サーバーコンポーネント用のSupabaseクライアント
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL!
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
    console.error("クライアント側のSupabase環境変数が設定されていません")
    console.warn("デモモードのみ利用可能です")
    // エラーをスローせず、nullを返す
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
