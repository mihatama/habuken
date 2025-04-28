// このファイルはサーバーコンポーネントでのみインポートしてください
// 'use server' ディレクティブを持つファイルまたはサーバーコンポーネントでのみ使用可能

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

/**
 * サーバーコンポーネント用のSupabaseクライアントを取得
 * Server Componentsで使用
 */
export function getServerSupabase(): SupabaseClient<Database> {
  return createServerComponentClient<Database>({ cookies })
}

/**
 * サーバーアクション用のSupabaseクライアントを取得
 * Server Actionsで使用
 */
export function getActionSupabase(): SupabaseClient<Database> {
  return createServerComponentClient<Database>({ cookies })
}

/**
 * サービスロールを使用したサーバー専用のSupabaseクライアントを作成
 * 管理者権限が必要な操作に使用（注意して使用すること）
 */
export function createServerClient(): SupabaseClient<Database> {
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
 * 汎用的なSupabaseクライアント取得関数（サーバー側）
 * clientTypeに基づいて適切なクライアントを返す
 */
export function getServerSupabaseClient(clientType: "server" | "action" = "server"): SupabaseClient<Database> {
  switch (clientType) {
    case "action":
      return getActionSupabase()
    case "server":
    default:
      return getServerSupabase()
  }
}

// 後方互換性のためのエイリアス
export const createServerSupabaseClient = getServerSupabase
