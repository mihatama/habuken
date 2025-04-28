"use client"

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
 *
 * シングルトンパターンを使用して、アプリケーション全体で単一のインスタンスを共有
 *
 * @returns Supabaseクライアントインスタンス
 */
export function getSupabaseClient(): SupabaseClientType {
  if (typeof window === "undefined") {
    console.warn("getSupabaseClient is being called on the server side. This may cause issues with session management.")
  }

  // 既存のインスタンスがあれば再利用
  if (clientSupabaseInstance) {
    return clientSupabaseInstance
  }

  // Next.jsの認証ヘルパーを使用（セッション管理を自動化）
  clientSupabaseInstance = createClientComponentClient<Database>()

  return clientSupabaseInstance
}

/**
 * クライアントインスタンスをリセット
 * 主にテスト用、または特定のユースケースで必要な場合に使用
 */
export function resetSupabaseClient(): void {
  clientSupabaseInstance = null
}

// 後方互換性のためのエイリアス
export const getClientSupabase = getSupabaseClient
export const getClientSupabaseInstance = getSupabaseClient
