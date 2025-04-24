// このファイルは互換性のために存在します
// 新しいコードでは lib/supabase-client.ts を使用してください

import {
  createServerSupabaseClient,
  getClientSupabaseInstance,
  getPublicSupabaseClient,
  resetSupabaseClients,
} from "../supabase"

// 古いインポートパスとの互換性のために再エクスポート
export { createServerSupabaseClient, getClientSupabaseInstance, getPublicSupabaseClient, resetSupabaseClients }
