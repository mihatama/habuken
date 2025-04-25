// クライアント側のSupabaseインスタンス取得を一元化
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// lib/supabase.tsからのインポートを避け、直接createClientComponentClientを使用
// これにより、Supabaseクライアントの重複初期化を防ぎます
export function getClientSupabaseInstance() {
  try {
    console.log("クライアントSupabaseインスタンス取得開始 (supabaseClient.ts)")

    // createClientComponentClientを使用して新しいクライアントを作成
    // これはシングルトンパターンを内部で実装しているため、複数回呼び出しても安全です
    const supabase = createClientComponentClient<Database>({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      options: {
        auth: {
          persistSession: true,
          storageKey: "habuken-auth-state",
        },
      },
    })

    console.log("クライアントSupabaseインスタンスを返します (supabaseClient.ts)")
    return supabase
  } catch (error) {
    console.error("クライアントSupabaseインスタンス取得エラー (supabaseClient.ts):", error)
    throw error
  }
}
