import { useSupabase } from "@/contexts/supabase-provider"

/**
 * Supabaseクライアントを取得するためのフック
 * このフックは、SupabaseProviderから提供されるSupabaseクライアントを返します
 */
export function useSupabaseClient() {
  return useSupabase()
}
