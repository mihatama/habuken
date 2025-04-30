"use server"

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

interface LeaveRequestData {
  staff_id: string
  start_date: string
  end_date: string
  reason: string
  leave_type?: string
  leave_duration?: string
}

// サーバーアクション専用のSupabaseクライアント（サービスロールを使用）
function getServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase環境変数が設定されていません")
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export async function createLeaveRequestAction(data: LeaveRequestData) {
  try {
    console.log("Creating leave request with data:", data)

    // サービスロールを使用したクライアントを作成
    const supabase = getServiceRoleClient()

    // 休暇申請を追加
    const { data: result, error } = await supabase
      .from("leave_requests")
      .insert({
        staff_id: data.staff_id,
        start_date: data.start_date,
        end_date: data.end_date,
        reason: data.reason,
        leave_type: data.leave_type,
        leave_duration: data.leave_duration || "full_day",
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Leave request creation error:", error)
      return { success: false, error: `休暇申請の作成エラー: ${error.message}` }
    }

    console.log("Leave request created successfully:", result)
    return { success: true, data: result }
  } catch (error: any) {
    console.error("Leave request action error:", error)
    return { success: false, error: error.message || "休暇申請の作成に失敗しました" }
  }
}
