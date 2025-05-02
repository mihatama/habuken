import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    // サーバーサイドでSupabaseクライアントを作成
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Supabase環境変数が設定されていません" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // テーブルが存在するか確認
    const { error: checkError } = await supabase.from("machinery_reservations").select("count(*)").limit(1)

    // テーブルが存在しない場合は作成
    if (checkError && checkError.message.includes("does not exist")) {
      // SQLを使用してテーブルを作成
      const { error } = await supabase.rpc("exec_sql", {
        sql_query: `
          CREATE TABLE IF NOT EXISTS machinery_reservations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            machinery_id UUID NOT NULL,
            title TEXT NOT NULL,
            start_date TIMESTAMP WITH TIME ZONE NOT NULL,
            end_date TIMESTAMP WITH TIME ZONE NOT NULL,
            project_name TEXT,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      })

      if (error) {
        console.error("テーブル作成エラー:", error)
        return NextResponse.json({ error: `テーブル作成に失敗しました: ${error.message}` }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API処理エラー:", error)
    return NextResponse.json({ error: `予期しないエラーが発生しました: ${error.message}` }, { status: 500 })
  }
}
