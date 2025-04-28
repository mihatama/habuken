import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import { debugLog } from "./debug"

// グローバルシングルトンのための型定義
declare global {
  var __supabaseClient: SupabaseClient<Database> | undefined
  var __supabaseServer: ReturnType<typeof createClient> | undefined
}

// 一貫したストレージキー
export const STORAGE_KEY = "supabase-auth-token"

/**
 * クライアント側のSupabaseクライアントのシングルトンインスタンスを取得する関数
 */
export function getClientSupabase(): SupabaseClient<Database> {
  if (typeof window === "undefined") {
    throw new Error("getClientSupabase should only be called in client components")
  }

  // グローバルインスタンスがあればそれを使用
  if (globalThis.__supabaseClient) {
    debugLog("Reusing existing client instance")
    return globalThis.__supabaseClient
  }

  // 新しいインスタンスを作成
  debugLog("Creating new client instance")

  const supabase = createClientComponentClient<Database>({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    options: {
      auth: {
        persistSession: true,
        storageKey: STORAGE_KEY,
        detectSessionInUrl: true,
        flowType: "pkce",
        debug: false, // デバッグログを無効化
      },
      global: {
        headers: {
          "x-application-name": "construction-management-client",
        },
      },
    },
  })

  // グローバルに保存
  globalThis.__supabaseClient = supabase
  return supabase
}

/**
 * サーバー側のSupabaseクライアントのシングルトンインスタンスを取得する関数
 */
export function getServerSupabase() {
  if (typeof window !== "undefined") {
    throw new Error("getServerSupabase should only be called in server components or actions")
  }

  // グローバルインスタンスがあればそれを使用
  if (globalThis.__supabaseServer) {
    debugLog("Reusing existing server instance")
    return globalThis.__supabaseServer
  }

  debugLog("Creating new server instance")

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        "x-application-name": "construction-management-server",
      },
    },
  })

  // グローバルに保存
  globalThis.__supabaseServer = supabase
  return supabase
}

// 後方互換性のための関数
export const getSupabaseClient = getClientSupabase
