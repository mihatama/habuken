// ファイルの先頭に以下のデバッグログを追加
console.log("supabase.ts が読み込まれました")

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// シングルトンインスタンスを保持する変数
let serverSupabaseInstance: SupabaseClient<Database> | null = null
let clientSupabaseInstance: SupabaseClient<Database> | null = null

// createServerSupabaseClient関数を修正
export const createServerSupabaseClient = () => {
  try {
    console.log("サーバーSupabaseクライアント作成開始")

    // 既存のインスタンスがあれば再利用
    if (serverSupabaseInstance) {
      console.log("既存のサーバーSupabaseインスタンスを返します")
      return serverSupabaseInstance
    }

    // 環境変数の存在確認
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log("Supabase環境変数チェック:", {
      urlExists: !!supabaseUrl,
      keyExists: !!supabaseKey,
    })

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase環境変数が設定されていません")
      throw new Error("Supabase環境変数が設定されていません")
    }

    serverSupabaseInstance = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    })

    console.log("サーバーSupabaseクライアント作成成功")
    return serverSupabaseInstance
  } catch (error) {
    console.error("サーバーSupabaseクライアント作成エラー:", error)
    throw error
  }
}

// getClientSupabaseInstance関数を修正
export const getClientSupabaseInstance = () => {
  try {
    console.log("クライアントSupabaseインスタンス取得開始")

    if (clientSupabaseInstance) {
      console.log("既存のクライアントSupabaseインスタンスを返します")
      return clientSupabaseInstance
    }

    // 環境変数の存在確認
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log("Supabase環境変数チェック (クライアント):", {
      urlExists: !!supabaseUrl,
      keyExists: !!supabaseKey,
      url: supabaseUrl?.substring(0, 10) + "...",
      key: supabaseKey ? supabaseKey.substring(0, 5) + "..." : null,
    })

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase環境変数が設定されていません (クライアント)")
      throw new Error("Supabase環境変数が設定されていません")
    }

    // セッション永続化の設定を明示的に行う
    clientSupabaseInstance = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        storageKey: "habuken_auth_token",
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    })

    console.log("新しいクライアントSupabaseインスタンスを作成しました")
    return clientSupabaseInstance
  } catch (error) {
    console.error("クライアントSupabaseインスタンス取得エラー:", error)
    throw error
  }
}
