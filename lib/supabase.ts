import { createServerClient, getClientSupabaseInstance } from "./supabase-client"

// 後方互換性のために既存の関数名を維持
export const createServerSupabaseClient = createServerClient

// 既存の関数名をエクスポート（実装は新しいモジュールを使用）
export { getClientSupabaseInstance }
