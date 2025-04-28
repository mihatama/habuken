import { createClientComponentClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

// シングルトンパターンのためのクライアントインスタンス
let clientSupabaseInstance: SupabaseClient<Database> | null = null

/**
 * クライアントコンポーネント用のSupabaseクライアントを取得
 * 'use client'ディレクティブを持つコンポーネントで使用
 */
export function getClientSupabase(): SupabaseClient<Database> {
  if (typeof window === "undefined") {
    throw new Error("getClientSupabase must be used in client components only")
  }

  // Next.jsの認証ヘルパーを使用（セッション管理を自動化）
  return createClientComponentClient<Database>()
}

/**
 * クライアントコンポーネント用のSupabaseクライアント（シングルトンパターン）
 * パフォーマンスが重要な場合や、特定のケースで使用
 */
export function getClientSupabaseInstance(): SupabaseClient<Database> {
  if (typeof window === "undefined") {
    throw new Error("getClientSupabaseInstance must be used in client components only")
  }

  if (clientSupabaseInstance) {
    return clientSupabaseInstance
  }

  clientSupabaseInstance = createClientComponentClient<Database>()
  return clientSupabaseInstance
}

/**
 * サーバーコンポーネント用のSupabaseクライアントを取得
 * Server Componentsで使用
 */
export function getServerSupabase(): SupabaseClient<Database> {
  if (typeof window !== "undefined") {
    throw new Error("getServerSupabase must be used in server components only")
  }

  return createServerComponentClient<Database>({ cookies })
}

/**
 * サーバーアクション用のSupabaseクライアントを取得
 * Server Actionsで使用
 */
export function getActionSupabase(): SupabaseClient<Database> {
  if (typeof window !== "undefined") {
    throw new Error("getActionSupabase must be used in server actions only")
  }

  return createServerComponentClient<Database>({ cookies })
}

/**
 * サービスロールを使用したサーバー専用のSupabaseクライアントを作成
 * 管理者権限が必要な操作に使用（注意して使用すること）
 */
export function createServerClient(): SupabaseClient<Database> {
  if (typeof window !== "undefined") {
    throw new Error("createServerClient must be used in server-side code only")
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  })
}

/**
 * 汎用的なSupabaseクライアント取得関数
 * clientTypeに基づいて適切なクライアントを返す
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
