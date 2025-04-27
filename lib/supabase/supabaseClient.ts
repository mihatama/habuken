import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// クライアントサイドSupabaseクライアント（シングルトンパターン）
let clientSupabaseInstance: SupabaseClient<Database> | null = null

export const getClientSupabaseInstance = () => {
  if (typeof window === "undefined") {
    throw new Error("getClientSupabaseInstance はクライアントサイドでのみ使用できます")
  }

  try {
    if (clientSupabaseInstance) {
      return clientSupabaseInstance
    }

    // 環境変数の存在確認
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase環境変数が設定されていません (クライアント)")
      throw new Error("Supabase環境変数が設定されていません")
    }

    clientSupabaseInstance = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
      },
    })

    return clientSupabaseInstance
  } catch (error) {
    console.error("クライアントSupabaseインスタンス取得エラー:", error)
    throw error
  }
}
