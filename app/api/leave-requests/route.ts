import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import type { Database } from "@/types/supabase"

// API専用のSupabaseクライアント（サービスロールを使用）
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

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("Creating leave request with data:", data)

    // バリデーション
    if (!data.staff_id || !data.start_date || !data.end_date || !data.reason) {
      return NextResponse.json({ error: "必須フィールドが不足しています" }, { status: 400 })
    }

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
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Leave request creation error:", error)
      return NextResponse.json({ error: `休暇申請の作成エラー: ${error.message}` }, { status: 500 })
    }

    console.log("Leave request created successfully:", result)
    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error("Leave request API error:", error)
    return NextResponse.json({ error: error.message || "休暇申請の作成に失敗しました" }, { status: 500 })
  }
}

// GET メソッドを追加して休暇申請データを取得できるようにする
export async function GET() {
  try {
    // サービスロールを使用したクライアントを作成
    const supabase = getServiceRoleClient()

    // 休暇申請データを取得
    const { data: leaveRequestsData, error: leaveRequestsError } = await supabase
      .from("leave_requests")
      .select(`
        id,
        staff_id,
        start_date,
        end_date,
        leave_type,
        reason,
        status,
        created_at
      `)
      .order("created_at", { ascending: false })

    if (leaveRequestsError) {
      console.error("Leave requests fetch error:", leaveRequestsError)
      return NextResponse.json({ error: `休暇申請データの取得エラー: ${leaveRequestsError.message}` }, { status: 500 })
    }

    // スタッフデータを取得
    const { data: staffData, error: staffError } = await supabase.from("staff").select("id, full_name")

    if (staffError) {
      console.error("Staff data fetch error:", staffError)
      return NextResponse.json({ error: `スタッフデータの取得エラー: ${staffError.message}` }, { status: 500 })
    }

    // スタッフ名をマッピング
    const staffMap = new Map(staffData.map((staff: any) => [staff.id, staff.full_name]))

    const enrichedLeaveRequests = leaveRequestsData.map((request: any) => ({
      ...request,
      staff_name: staffMap.get(request.staff_id) || "不明なスタッフ",
    }))

    return NextResponse.json({ success: true, data: enrichedLeaveRequests })
  } catch (error: any) {
    console.error("Leave requests API error:", error)
    return NextResponse.json({ error: error.message || "休暇申請データの取得に失敗しました" }, { status: 500 })
  }
}
