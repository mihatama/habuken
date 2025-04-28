import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// シングルトンパターンのためのクライアントインスタンス
let clientSupabaseInstance: SupabaseClient<Database> | null = null

/**
 * クライアントコンポーネント用のSupabaseクライアントを取得
 * 'use client'ディレクティブを持つコンポーネントで使用
 */
export function getClientSupabase(): SupabaseClient<Database> {
  if (typeof window === "undefined") {
    console.warn("getClientSupabase is being called on the server side. This may cause issues.")
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
    console.warn("getClientSupabaseInstance is being called on the server side. This may cause issues.")
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
 */
export function createDirectClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient<Database>(supabaseUrl, supabaseKey)
}

// クライアント側でのみ使用可能な関数
export const getSupabaseClient = getClientSupabase
export const createServerSupabaseClient = () => {
  console.warn("createServerSupabaseClient is not available on the client side. Using client-side client instead.")
  return getClientSupabase()
}
