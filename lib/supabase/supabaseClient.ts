// このファイルは互換性のために残しています
// 新しいコードでは lib/supabase.ts を直接インポートすることをお勧めします

import {
  createServerSupabaseClient,
  getPublicSupabaseClient,
  getClientSupabaseInstance,
  createSafeSupabaseClient,
  resetSupabaseClients,
} from "../supabase"

// 既存のコードとの互換性のために再エクスポート
export {
  createServerSupabaseClient,
  getPublicSupabaseClient,
  getClientSupabaseInstance,
  createSafeSupabaseClient,
  resetSupabaseClients,
}

// サーバーサイドでも安全に使用できるSupabaseクライアント
// これはgetClientSupabaseInstanceの代替として使用できる
export const getSupabaseClient = createSafeSupabaseClient
