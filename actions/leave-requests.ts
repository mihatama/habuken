"use server"

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// サーバーアクション用のSupabaseクライアント
function getServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase環境変数が設定されていません")
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  })
}

/**
 * 休暇申請を作成するサーバーアクション
 * @param leaveData 休暇申請データ
 * @returns 作成された休暇申請データ
 */
export async function createLeaveRequestAction(leaveData: {
  staff_id: string
  start_date: string
  end_date: string
  reason: string
  status?: string
}) {
  try {
    const supabase = getServerSupabase()

    // サーバーサイドでは管理者権限でデータを挿入
    const { data, error } = await supabase
      .from("leave_requests")
      .insert({
        staff_id: leaveData.staff_id,
        start_date: leaveData.start_date,
        end_date: leaveData.end_date,
        reason: leaveData.reason,
        status: leaveData.status || "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Server action error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Server action exception:", error)
    return { success: false, error: error.message || "An unknown error occurred" }
  }
}
