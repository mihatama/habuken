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
 *
 * @param clientType クライアントタイプ
 *   - "server": 標準のサーバーコンポーネント用（デフォルト）
 *   - "action": サーバーアクション用
 *   - "admin": 管理者権限が必要な操作用（サービスロールキーを使用）
 * @returns Supabaseクライアントインスタンス
 */
export function getServerSupabaseClient(clientType: ServerClientType = "server"): ServerSupabaseClientType {
  // 環境変数の検証
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
  }

  switch (clientType) {
    case "action":
      // サーバーアクション用
      return createServerComponentClient<Database>({ cookies })

    case "admin":
      // 管理者権限用（サービスロールキー使用）
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (!supabaseServiceKey) {
        console.warn("Missing SUPABASE_SERVICE_ROLE_KEY, falling back to NEXT_PUBLIC_SUPABASE_ANON_KEY")
      }

      const adminKey = supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (!adminKey) {
        throw new Error("Missing Supabase key for admin operations")
      }

      return createClient<Database>(supabaseUrl, adminKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })

    case "server":
    default:
      // 標準のサーバーコンポーネント用
      return createServerComponentClient<Database>({ cookies })
  }
}

// 後方互換性のためのエイリアス
export const createServerSupabaseClient = getServerSupabaseClient
export const getServerSupabase = () => getServerSupabaseClient("server")
export const getActionSupabase = () => getServerSupabaseClient("action")
export const createServerClient = () => getServerSupabaseClient("admin")
