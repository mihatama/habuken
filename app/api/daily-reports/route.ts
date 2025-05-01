import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const requestData = await request.json()

    // サービスロールキーを使用したクライアントを作成
    const supabase = createRouteHandlerClient(
      {
        cookies,
      },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
    )

    // ユーザーが認証されているか確認
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "認証されていません" }, { status: 401 })
    }

    // 管理者権限で日報データを挿入
    const { data, error } = await supabase.from("daily_reports").insert(requestData).select()

    if (error) {
      console.error("API: 日報作成エラー:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("API: 予期しないエラー:", error)
    return NextResponse.json({ error: error.message || "不明なエラーが発生しました" }, { status: 500 })
  }
}
