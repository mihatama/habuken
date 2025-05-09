import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // セッションの確認
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    // リクエストボディからIDの配列を取得
    const { ids } = await req.json()

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "有効なID配列が必要です" }, { status: 400 })
    }

    // トランザクションを使用して一括更新
    const { error } = await supabase.rpc("update_staff_display_order", { id_array: ids })

    if (error) {
      console.error("スタッフの表示順更新エラー:", error)
      return NextResponse.json({ error: "表示順の更新に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("スタッフの表示順更新エラー:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
