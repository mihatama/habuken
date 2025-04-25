import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import { logWithTimestamp } from "@/lib/auth-debug"

// シングルトンインスタンスを保持する変数
let clientInstance: ReturnType<typeof createClient<Database>> | null = null

// 環境変数のチェック
const checkEnvVariables = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase環境変数が設定されていません")
    return false
  }
  return true
}

// クライアントサイドSupabaseインスタンスを取得する関数
export const getClientSupabaseInstance = () => {
  logWithTimestamp("クライアントSupabaseインスタンス取得開始")

  // 既にインスタンスが存在する場合はそれを返す
  if (clientInstance) {
    logWithTimestamp("既存のクライアントSupabaseインスタンスを返します")
    return clientInstance
  }

  // 環境変数のチェック
  if (!checkEnvVariables()) {
    throw new Error("Supabase環境変数が設定されていません")
  }

  // 環境変数を取得
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // 永続化オプションを設定
  const persistSessionOptions = {
    // セッションを永続化する方法を指定
    // 'localStorage'（デフォルト）、'localStorage+cookies'、'cookies'、'none'
    persistSession: true,

    // ストレージキーを統一
    storageKey: "habuken-auth-state",

    // Cookieの設定
    cookieOptions: {
      // セキュアな接続でのみCookieを送信
      secure: false, // 開発環境でもCookieを設定できるようにfalseに設定

      // サイト全体でCookieを利用可能に
      sameSite: "lax" as const,

      // JavaScriptからCookieにアクセスできるようにする
      httpOnly: false,

      // Cookieの有効期間（7日間）
      maxAge: 60 * 60 * 24 * 7,

      // パス設定
      path: "/",
    },

    // 自動セッションリフレッシュの設定
    autoRefreshToken: true,

    // デバッグモード
    debug: true, // デバッグ情報を常に表示
  }

  // Supabaseクライアントを作成
  logWithTimestamp("新しいSupabaseクライアントを作成します", {
    url: supabaseUrl,
    persistOptions: JSON.stringify(persistSessionOptions),
  })

  clientInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: persistSessionOptions,
  })

  // セッションリフレッシュのイベントリスナーを設定
  clientInstance.auth.onAuthStateChange((event, session) => {
    logWithTimestamp(`Auth state changed in client: ${event}`, session?.user?.email)

    // セッション変更時にローカルストレージとCookieの状態を確認
    if (typeof window !== "undefined") {
      const authItems = Object.keys(localStorage).filter(
        (key) => key.includes("supabase") || key.includes("auth") || key.includes("habuken"),
      )
      logWithTimestamp("LocalStorage auth items:", authItems)
      logWithTimestamp("Cookies:", document.cookie)

      // 古い認証トークンを削除
      if (event === "SIGNED_IN" && authItems.length > 1) {
        // 新しいトークン以外を削除
        authItems.forEach((key) => {
          if (key !== "habuken-auth-state") {
            logWithTimestamp(`古い認証トークンを削除: ${key}`)
            localStorage.removeItem(key)
          }
        })
      }
    }
  })

  return clientInstance
}

// クライアントインスタンスをリセットする関数（テスト用）
export const resetClientInstance = () => {
  clientInstance = null
  logWithTimestamp("Supabaseクライアントインスタンスをリセットしました")
}

// セッションの永続化状態を確認する関数
export const checkSessionPersistence = async () => {
  const supabase = getClientSupabaseInstance()
  const { data, error } = await supabase.auth.getSession()

  // Cookieの詳細をログに出力
  const cookieDetails = typeof document !== "undefined" ? document.cookie.split(";").map((c) => c.trim()) : []

  logWithTimestamp("セッション永続化状態チェック:", {
    hasSession: !!data.session,
    user: data.session?.user?.email || null,
    error: error?.message || null,
    cookies: cookieDetails,
    localStorage:
      typeof localStorage !== "undefined"
        ? Object.keys(localStorage).filter((k) => k.includes("auth") || k.includes("supabase") || k.includes("habuken"))
        : [],
  })

  return {
    hasSession: !!data.session,
    user: data.session?.user || null,
    error,
  }
}

// 認証状態をクリーンアップする関数
export const cleanupAuthStorage = () => {
  if (typeof window === "undefined") return

  logWithTimestamp("認証ストレージのクリーンアップを開始")

  // ローカルストレージから古い認証トークンを削除
  const authItems = Object.keys(localStorage).filter(
    (key) => (key.includes("supabase") || key.includes("auth")) && key !== "habuken-auth-state",
  )

  authItems.forEach((key) => {
    logWithTimestamp(`古い認証トークンを削除: ${key}`)
    localStorage.removeItem(key)
  })

  logWithTimestamp("認証ストレージのクリーンアップ完了")
}
