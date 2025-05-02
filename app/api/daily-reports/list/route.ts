import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    console.log("API: 日報一覧データを取得します")

    // サービスロールキーを使用してSupabaseクライアントを作成
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("API: 環境変数が設定されていません")
      return NextResponse.json({ error: "サーバー設定が不完全です。管理者にお問い合わせください。" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })

    // 日報データを取得
    const { data, error } = await supabase.from("daily_reports").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("API: 日報データの取得エラー:", error)
      return NextResponse.json(
        {
          error: `日報データの取得に失敗しました: ${error.message}`,
          details: error,
        },
        { status: 500 },
      )
    }

    console.log(`API: 日報データを${data?.length || 0}件取得しました`)
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("API: 予期しないエラー:", error)
    return NextResponse.json(
      {
        error: `予期しないエラーが発生しました: ${error.message}`,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
