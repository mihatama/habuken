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

    // submitted_byの処理を修正します - スタッフIDをそのまま使用するように変更
    // submitted_byの検証 - staff_idをsubmitted_byとして使用
    if (reportData.staff_id) {
      // staff_idをsubmitted_byにコピー
      reportData.submitted_by = reportData.staff_id
      console.log("API: staff_idをsubmitted_byに設定しました:", reportData.staff_id)

      // スタッフIDが実際に存在するか確認
      try {
        const { data: staffExists, error: staffError } = await supabase
          .from("staff")
          .select("id")
          .eq("id", reportData.staff_id)
          .single()

        if (staffError || !staffExists) {
          console.error("API: 指定されたスタッフが存在しません:", reportData.staff_id, staffError)
          return NextResponse.json(
            {
              error: "指定されたスタッフIDが存在しません。有効なスタッフを選択してください。",
              details: staffError,
            },
            { status: 400 },
          )
        }

        console.log("API: スタッフの存在を確認しました:", staffExists)
      } catch (err) {
        console.error("API: スタッフ検証エラー:", err)
        return NextResponse.json(
          {
            error: "スタッフの検証中にエラーが発生しました。もう一度お試しください。",
          },
          { status: 500 },
        )
      }
    } else if (!reportData.submitted_by) {
      console.error("API: submitted_byが指定されていません")
      return NextResponse.json({ error: "登録者（submitted_by）が指定されていません。" }, { status: 400 })
    }

    // created_byの検証
    if (reportData.created_by) {
      try {
        const { data: userExists, error: userError } = await supabase.auth.admin.getUserById(reportData.created_by)

        if (userError || !userExists) {
          console.warn("API: 指定されたユーザーが存在しません:", reportData.created_by)
          // エラーがあっても続行（サービスロールキーを使用しているため）
        }
      } catch (err) {
        console.warn("API: ユーザー検証エラー:", err)
      }
    }

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
