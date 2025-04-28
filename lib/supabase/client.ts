import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// シングルトンインスタンスを保持する変数
let clientInstance: SupabaseClient<Database> | null = null
let serverInstance: ReturnType<typeof createClient> | null = null

// 一貫したストレージキー
export const STORAGE_KEY = "supabase-auth-token"

/**
 * クライアント側のSupabaseクライアントのシングルトンインスタンスを取得する関数
 */
export function getClientSupabase(): SupabaseClient<Database> {
  if (typeof window === "undefined") {
    throw new Error("getClientSupabase should only be called in client components")
  }

  if (!clientInstance) {
    console.log("[Supabase] Creating new client instance")
    clientInstance = createClientComponentClient<Database>({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      options: {
        auth: {
          persistSession: true,
          storageKey: STORAGE_KEY,
          detectSessionInUrl: true,
          flowType: "pkce",
        },
        global: {
          headers: {
            "x-application-name": "construction-management-client",
          },
        },
      },
    })
  } else {
    console.log("[Supabase] Reusing existing client instance")
  }
  return clientInstance
}

/**
 * サーバー側のSupabaseクライアントのシングルトンインスタンスを取得する関数
 */
export function getServerSupabase() {
  if (typeof window !== "undefined") {
    throw new Error("getServerSupabase should only be called in server components or actions")
  }

  if (!serverInstance) {
    console.log("[Supabase] Creating new server instance")
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      ""

    serverInstance = createClient(supabaseUrl, supabaseKey, {
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
  } else {
    console.log("[Supabase] Reusing existing server instance")
  }
  return serverInstance
}

// 後方互換性のための関数
export const getSupabaseClient = getClientSupabase
