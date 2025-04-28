import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// ブラウザ環境でのみ使用するストレージキー
export const STORAGE_KEY = "supabase-auth-token"

// ブラウザ環境でのシングルトンインスタンス
let browserInstance: SupabaseClient<Database> | null = null

/**
 * ブラウザ環境専用のSupabaseクライアントを取得する関数
 * このインスタンスはアプリケーションの寿命中に一度だけ作成され、
 * 以降はすべてのコンポーネントで同じインスタンスが使用されます。
 */
export function getBrowserSupabase(): SupabaseClient<Database> {
  if (typeof window === "undefined") {
    throw new Error("getBrowserSupabase should only be called in browser environment")
  }

  // すでにインスタンスが存在する場合は再利用
  if (browserInstance) {
    console.log("[Supabase] Reusing browser instance")
    return browserInstance
  }

  // ウィンドウオブジェクトにキャッシュされたインスタンスがあるか確認
  if (window.__SUPABASE_CLIENT__) {
    console.log("[Supabase] Using cached browser instance from window")
    browserInstance = window.__SUPABASE_CLIENT__
    return browserInstance
  }

  // 新しいインスタンスを作成
  console.log("[Supabase] Creating new browser instance")

  // GoTrueClientの初期化を制御するためのオプション
  const authOptions = {
    persistSession: true,
    storageKey: STORAGE_KEY,
    detectSessionInUrl: true,
    flowType: "pkce",
    debug: false,
    autoRefreshToken: true,
    // 重要: GoTrueClientの初期化を制御するオプション
    skipBrowserStorage: false, // ブラウザストレージを使用する
  }

  browserInstance = createClientComponentClient<Database>({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    options: {
      auth: authOptions,
      global: {
        headers: {
          "x-application-name": "construction-management-client",
        },
      },
    },
  })

  // ウィンドウオブジェクトにキャッシュ
  window.__SUPABASE_CLIENT__ = browserInstance

  // ページアンロード時にクリーンアップを行う
  window.addEventListener("beforeunload", () => {
    console.log("[Supabase] Cleaning up before page unload")
    // 必要に応じてクリーンアップ処理を追加
  })

  return browserInstance
}

// グローバル型定義の拡張
declare global {
  interface Window {
    __SUPABASE_CLIENT__?: SupabaseClient<Database>
  }
}
