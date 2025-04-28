// このファイルはサーバーコンポーネントでのみインポートしてください
// 'use server' ディレクティブを持つファイルまたはサーバーコンポーネントでのみ使用可能

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import type { Database } from "../../types/supabase"

// エクスポートする型定義
export type ServerSupabaseClientType = SupabaseClient<Database>
export type ServerClientType = "server" | "action" | "admin"

/**
 * サーバー側のSupabaseクライアントを取得
 * @param clientType クライアントタイプ（server, action, admin）
 * @returns Supabaseクライアント
 */
export function getServerSupabaseClient(clientType: ServerClientType = "server"): ServerSupabaseClientType {
  switch (clientType) {
    case "action":
      return createServerComponentClient<Database>({ cookies })
    case "admin":
      return createServerAdminClient()
    case "server":
    default:
      return createServerComponentClient<Database>({ cookies })
  }
}

/**
 * サービスロールを使用したサーバー専用のSupabaseクライアントを作成
 * 管理者権限が必要な操作に使用（注意して使用すること）
 */
function createServerAdminClient(): ServerSupabaseClientType {
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

// 後方互換性のためのエイリアス
export const createServerSupabaseClient = getServerSupabaseClient
export const getServerSupabase = () => getServerSupabaseClient("server")
export const getActionSupabase = () => getServerSupabaseClient("action")
export const createServerClient = () => getServerSupabaseClient("admin")
