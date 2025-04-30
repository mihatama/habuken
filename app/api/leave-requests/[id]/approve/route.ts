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

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const requestId = params.id

    if (!requestId) {
      return NextResponse.json({ error: "休暇申請IDが指定されていません" }, { status: 400 })
    }

    // サービスロールを使用したクライアントを作成
    const supabase = getServiceRoleClient()

    // 休暇申請のステータスを承認済みに更新
    const { data, error } = await supabase
      .from("leave_requests")
      .update({
        status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .select()

    if (error) {
      console.error("Leave request approval error:", error)
      return NextResponse.json({ error: `休暇申請の承認エラー: ${error.message}` }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "指定された休暇申請が見つかりません" }, { status: 404 })
    }

    console.log("Leave request approved successfully:", data)
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Leave request approval API error:", error)
    return NextResponse.json({ error: error.message || "休暇申請の承認に失敗しました" }, { status: 500 })
  }
}
