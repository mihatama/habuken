import { createClientComponentClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

/**
 * クライアントコンポーネント用のSupabaseクライアントを取得
 */
export function getClientSupabase(): SupabaseClient<Database> {
  if (typeof window === "undefined") {
    throw new Error("getClientSupabase must be used in client components only")
  }
  return createClientComponentClient<Database>()
}

/**
 * サーバーコンポーネント用のSupabaseクライアントを取得
 */
export function getServerSupabase(): SupabaseClient<Database> {
  if (typeof window !== "undefined") {
    throw new Error("getServerSupabase must be used in server components only")
  }
  return createServerComponentClient<Database>({ cookies })
}

/**
 * サーバーアクション用のSupabaseクライアントを取得
 */
export function getActionSupabase(): SupabaseClient<Database> {
  if (typeof window !== "undefined") {
    throw new Error("getActionSupabase must be used in server actions only")
  }
  return createServerComponentClient<Database>({ cookies })
}

/**
 * 汎用的なSupabaseクライアント取得関数
 */
export function getSupabaseClient(clientType: "client" | "server" | "action" = "client"): SupabaseClient<Database> {
  switch (clientType) {
    case "server":
      return getServerSupabase()
    case "action":
      return getActionSupabase()
    case "client":
    default:
      return getClientSupabase()
  }
}

// 後方互換性のためのエイリアス
export const createServerSupabaseClient = getServerSupabase
export const getClientSupabaseInstance = getClientSupabase
export const createServerClient = getServerSupabase
