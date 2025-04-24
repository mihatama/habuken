// クライアント側のSupabaseインスタンス作成を改善
console.log("supabaseClient.ts が読み込まれました")

// createClientSupabaseInstance関数を修正
import { createClient } from "@supabase/supabase-js"

let supabaseInstance = null

export function getClientSupabaseInstance() {
  try {
    console.log("クライアントSupabaseインスタンス取得開始 (supabaseClient.ts)")

    if (supabaseInstance) {
      console.log("既存のクライアントSupabaseインスタンスを返します (supabaseClient.ts)")
      return supabaseInstance
    }

    // 環境変数の存在確認
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log("Supabase環境変数チェック (supabaseClient.ts):", {
      urlExists: !!supabaseUrl,
      keyExists: !!supabaseKey,
      url: supabaseUrl?.substring(0, 10) + "...",
      key: supabaseKey ? supabaseKey.substring(0, 5) + "..." : null,
    })

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase環境変数が設定されていません (supabaseClient.ts)")
      throw new Error("Supabase環境変数が設定されていません")
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey)

    console.log("新しいクライアントSupabaseインスタンスを作成しました (supabaseClient.ts)")
    return supabaseInstance
  } catch (error) {
    console.error("クライアントSupabaseインスタンス取得エラー (supabaseClient.ts):", error)
    throw error
  }
}
