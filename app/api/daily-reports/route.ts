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

    // POST関数内のバリデーション部分を修正します

    // 必須項目のチェック
    const requiredFields = {
      report_date: "作業日",
      work_description: "作業内容",
      submitted_by: "登録者",
      start_time: "作業開始時間",
      end_time: "作業終了時間",
    }

    const missingFields = Object.entries(requiredFields).filter(([key, _]) => !reportData[key])

    if (missingFields.length > 0) {
      console.error("API: 必須項目が不足しています:", missingFields)
      return NextResponse.json(
        {
          error: `以下の必須項目を入力してください: ${missingFields.map(([_, label]) => label).join(", ")}`,
          missingFields: missingFields.map(([key, _]) => key),
        },
        { status: 400 },
      )
    }

    // project_idとdeal_idの処理
    console.log("API: project_idの処理前:", reportData.project_id)

    // 常にproject_idをnullに設定（外部キー制約エラーを回避するため）
    reportData.project_id = null

    // deal_idの処理（カスタムプロジェクトの場合はnull、それ以外は値を保持）
    if (reportData.deal_id === "custom" || reportData.deal_id === "" || reportData.deal_id === "placeholder") {
      reportData.deal_id = null
    }

    // クライアントから送信されたユーザーIDを使用
    if (reportData.user_id) {
      reportData.submitted_by = reportData.user_id
      reportData.created_by = reportData.user_id
      console.log("API: クライアントから送信されたユーザーIDを使用します:", reportData.user_id)
    } else {
      console.error("API: ユーザーIDが指定されていません")
      return NextResponse.json({ error: "ユーザーIDが指定されていません。再ログインしてください。" }, { status: 400 })
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

    // 作業者情報の処理
    if (!reportData.workers || !Array.isArray(reportData.workers) || reportData.workers.length === 0) {
      // 作業者が指定されていない場合は、登録者を作業者として追加
      if (reportData.submitted_by) {
        try {
          // 登録者の情報を取得
          const { data: staffData, error: staffError } = await supabase
            .from("staff")
            .select("id, full_name")
            .eq("id", reportData.submitted_by)
            .single()

          if (!staffError && staffData) {
            reportData.workers = [
              {
                id: staffData.id,
                name: staffData.full_name,
                start_time: reportData.start_time,
                end_time: reportData.end_time,
              },
            ]
          }
        } catch (err) {
          console.warn("API: 登録者情報の取得に失敗しました:", err)
        }
      }
    }

    // workers配列がJSON形式であることを確認
    if (reportData.workers && Array.isArray(reportData.workers)) {
      // すでにJSON形式の場合は変換不要
      console.log("API: 作業者情報:", reportData.workers)
    } else {
      // 作業者情報がない場合は空配列を設定
      reportData.workers = []
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
    delete reportData.status // ステータスフィールドを削除（承認システム不要のため）

    // ステータスを明示的に設定
    reportData.status = "pending"

    console.log("API: 挿入するデータ:", {
      project_id: reportData.project_id,
      deal_id: reportData.deal_id,
      custom_project_name: reportData.custom_project_name,
      created_by: reportData.created_by,
      submitted_by: reportData.submitted_by,
      report_date: reportData.report_date,
      work_description: reportData.work_description,
      status: reportData.status,
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

    // 挿入後にデータが取得できるか確認
    const { data: checkData, error: checkError } = await supabase
      .from("daily_reports")
      .select("*")
      .eq("id", data[0].id)
      .single()

    if (checkError) {
      console.warn("API: 挿入後のデータ確認に失敗しました:", checkError)
    } else {
      console.log("API: 挿入後のデータ確認に成功しました:", checkData)
    }

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
