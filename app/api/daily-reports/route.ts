import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    // リクエストボディを取得
    const reportData = await request.json()

    console.log("API: 日報データを受信しました", { ...reportData, photo_urls: reportData.photo_urls?.length || 0 })

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

    // project_idとdeal_idの処理
    console.log("API: project_idの処理前:", reportData.project_id)

    // 常にproject_idをnullに設定（外部キー制約エラーを回避するため）
    reportData.project_id = null

    // deal_idの処理（カスタムプロジェクトの場合はnull、それ以外は値を保持）
    if (reportData.deal_id === "custom" || reportData.deal_id === "" || reportData.deal_id === "placeholder") {
      reportData.deal_id = null
    }

    // 現在のユーザー情報を取得
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("API: ユーザー情報の取得に失敗しました:", userError)
      return NextResponse.json({ error: "ユーザー情報の取得に失敗しました。再ログインしてください。" }, { status: 401 })
    }

    if (!user) {
      console.error("API: ユーザーが認証されていません")
      return NextResponse.json({ error: "認証されていません。ログインしてください。" }, { status: 401 })
    }

    // 現在のユーザーIDをsubmitted_byとして使用
    reportData.submitted_by = user.id
    console.log("API: 現在のユーザーIDをsubmitted_byに設定しました:", user.id)

    // created_byも設定
    reportData.created_by = user.id

    // custom_project_nameの処理
    if (!reportData.custom_project_name && reportData.deal_id) {
      // deal_idが指定されている場合、案件名を取得して設定
      try {
        const { data: dealData, error: dealError } = await supabase
          .from("deals")
          .select("name")
          .eq("id", reportData.deal_id)
          .single()

        if (!dealError && dealData) {
          reportData.custom_project_name = dealData.name
        }
      } catch (err) {
        console.warn("API: 案件名の取得に失敗しました:", err)
      }
    }

    // 不要なフィールドを削除
    delete reportData.user_id
    delete reportData.projectId
    delete reportData.userId
    delete reportData.workDate
    delete reportData.workContentText
    delete reportData.startTime
    delete reportData.endTime
    delete reportData.photos
    delete reportData.staff_id // staff_idフィールドを削除

    console.log("API: 挿入するデータ:", {
      project_id: reportData.project_id,
      deal_id: reportData.deal_id,
      custom_project_name: reportData.custom_project_name,
      created_by: reportData.created_by,
      submitted_by: reportData.submitted_by,
      report_date: reportData.report_date,
      work_description: reportData.work_description,
    })

    // 日報データを追加
    const { data, error } = await supabase.from("daily_reports").insert(reportData).select()

    if (error) {
      console.error("API: 日報作成エラー:", error)

      return NextResponse.json(
        {
          error: `日報の作成に失敗しました: ${error.message}`,
          details: error,
        },
        { status: 500 },
      )
    }

    console.log("API: 日報データの挿入に成功しました", data)
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
