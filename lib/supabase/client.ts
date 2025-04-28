import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "../../types/supabase"

// エクスポートする型定義
export type SupabaseClientType = SupabaseClient<Database>

// シングルトンパターンのためのクライアントインスタンス
let clientSupabaseInstance: SupabaseClientType | null = null

/**
 * クライアントコンポーネント用のSupabaseクライアントを取得
 * 'use client'ディレクティブを持つコンポーネントで使用
 */
export function getSupabaseClient(): SupabaseClientType {
  if (typeof window === "undefined") {
    console.warn("getSupabaseClient is being called on the server side. This may cause issues.")
  }

  // Next.jsの認証ヘルパーを使用（セッション管理を自動化）
  return createClientComponentClient<Database>()
}

/**
 * クライアントコンポーネント用のSupabaseクライアント（シングルトンパターン）
 * パフォーマンスが重要な場合や、特定のケースで使用
 */
export function getSupabaseClientInstance(): SupabaseClientType {
  if (typeof window === "undefined") {
    console.warn("getSupabaseClientInstance is being called on the server side. This may cause issues.")
  }

  if (clientSupabaseInstance) {
    return clientSupabaseInstance
  }

  clientSupabaseInstance = createClientComponentClient<Database>()
  return clientSupabaseInstance
}

/**
 * 環境変数を使用して直接Supabaseクライアントを作成
 * 注意: このメソッドはセッション管理を自動化しません
 * @deprecated 特殊なケース以外では getSupabaseClient() を使用してください
 */
export function createDirectClient(): SupabaseClientType {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClientComponentClient<Database>()
}

// 後方互換性のためのエイリアス
export const getClientSupabase = getSupabaseClient
export const getClientSupabaseInstance = getSupabaseClientInstance
