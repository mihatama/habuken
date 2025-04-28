import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { SupabaseClient } from "@supabase/supabase-js"
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
 * 汎用的なSupabaseクライアント取得関数
 * clientTypeに基づいて適切なクライアントを返す
 * 注意: server/actionタイプはサーバーコンポーネントでのみ使用可能
 */
export function getSupabaseClient(clientType: "client" | "server" | "action" = "client"): SupabaseClient<Database> {
  if (clientType === "client") {
    return getClientSupabase()
  }

  // server/actionタイプはサーバーコンポーネントでのみ使用可能
  // これらはserver.tsで定義されています
  throw new Error(`getSupabaseClient with type "${clientType}" must be used in server components only`)
}

// 後方互換性のためのエイリアス
export const createServerSupabaseClient = () => {
  throw new Error(
    "createServerSupabaseClient must be used in server components only. Import from @/lib/supabase/server instead.",
  )
}
