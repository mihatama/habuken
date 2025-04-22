import { createClient } from "@supabase/supabase-js"

// サーバーサイドのSupabaseクライアント
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  })
}

// クライアントサイドのSupabaseクライアント（シングルトンパターン）
let clientSupabaseClient: ReturnType<typeof createClient> | null = null

export const getClientSupabaseInstance = () => {
  if (clientSupabaseClient) return clientSupabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  clientSupabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      storageKey: "supabase-auth",
    },
  })

  return clientSupabaseClient
}
