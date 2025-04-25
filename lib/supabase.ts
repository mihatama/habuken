// ファイルの先頭に以下のデバッグログを追加
console.log("supabase.ts が読み込まれました")

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// createServerSupabaseClient関数を修正
export const createServerSupabaseClient = () => {
  try {
    console.log("サーバーSupabaseクライアント作成開始")

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

    const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    })

    console.log("サーバーSupabaseクライアント作成成功")
    return supabase
  } catch (error) {
    console.error("サーバーSupabaseクライアント作成エラー:", error)
    throw error
  }
}

// getClientSupabaseInstance関数を修正
let clientSupabaseInstance: SupabaseClient<Database> | null = null

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
    })

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase環境変数が設定されていません (クライアント)")
      throw new Error("Supabase環境変数が設定されていません")
    }

    clientSupabaseInstance = createClient<Database>(supabaseUrl, supabaseKey)

    console.log("新しいクライアントSupabaseインスタンスを作成しました")
    return clientSupabaseInstance
  } catch (error) {
    console.error("クライアントSupabaseインスタンス取得エラー:", error)
    throw error
  }
}
