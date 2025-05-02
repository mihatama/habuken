import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("環境変数が設定されていません")
}

const supabase = createClient(supabaseUrl as string, supabaseServiceKey as string)

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // 必須フィールドの検証
    if (!data.inspection_date) {
      return NextResponse.json({ error: "巡視日は必須です" }, { status: 400 })
    }

    // 安全巡視データをSupabaseに保存
    const { data: insertedData, error } = await supabase
      .from("safety_inspections")
      .insert([
        {
          deal_id: data.deal_id,
          custom_project_name: data.custom_project_name,
          staff_id: data.staff_id, // ユーザーID
          inspector_id: data.inspector_id, // スタッフテーブルのID
          custom_inspector_name: data.custom_inspector_name,
          inspection_date: data.inspection_date,
          weather: data.weather,
          checklist_items: data.checklist_items,
          comment: data.comment,
          photo_urls: data.photo_urls,
          status: data.status || "completed",
          created_by: data.created_by,
          user_id: data.user_id,
        },
      ])
      .select()

    if (error) {
      console.error("安全巡視データの保存エラー:", error)
      return NextResponse.json({ error: `安全巡視データの保存に失敗しました: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "安全巡視データが保存されました",
      data: insertedData,
    })
  } catch (error: any) {
    console.error("安全巡視APIエラー:", error)
    return NextResponse.json(
      { error: `安全巡視データの処理中にエラーが発生しました: ${error.message || "不明なエラー"}` },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      // 特定のIDの安全巡視データを取得
      const { data, error } = await supabase.from("safety_inspections").select("*").eq("id", id).single()

      if (error) {
        return NextResponse.json({ error: `安全巡視データの取得に失敗しました: ${error.message}` }, { status: 500 })
      }

      return NextResponse.json(data)
    } else {
      // すべての安全巡視データを取得
      const { data, error } = await supabase
        .from("safety_inspections")
        .select("*")
        .order("inspection_date", { ascending: false })

      if (error) {
        return NextResponse.json({ error: `安全巡視データの取得に失敗しました: ${error.message}` }, { status: 500 })
      }

      return NextResponse.json(data)
    }
  } catch (error: any) {
    console.error("安全巡視データ取得APIエラー:", error)
    return NextResponse.json(
      { error: `安全巡視データの取得中にエラーが発生しました: ${error.message || "不明なエラー"}` },
      { status: 500 },
    )
  }
}
