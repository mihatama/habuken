import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// クライアントサイドでのみ使用するSupabaseクライアント
// シングルトンパターンを使用して、クライアントサイドで複数のインスタンスが作成されないようにする
let clientSupabase: ReturnType<typeof createClient<Database>> | null = null

export function getClientSupabaseInstance() {
  if (clientSupabase) return clientSupabase

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn("Missing Supabase environment variables")
    return null
  }

  clientSupabase = createClient<Database>(supabaseUrl, supabaseKey)
  return clientSupabase
}
