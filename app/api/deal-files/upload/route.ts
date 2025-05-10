import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sanitizeFileName } from "@/utils/file-utils"

// バケット名を変更
const BUCKET_NAME = "genba"

export async function POST(request: Request) {
  try {
    // リクエストボディを取得
    const { base64Data, fileName, contentType, dealId } = await request.json()

    if (!base64Data || !fileName) {
      return NextResponse.json({ error: "ファイルデータとファイル名は必須です" }, { status: 400 })
    }

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

    // Base64データをデコード
    const base64OnlyData = base64Data.split(";base64,").pop()
    if (!base64OnlyData) {
      return NextResponse.json({ error: "無効なファイルデータです" }, { status: 400 })
    }

    // バイナリデータに変換
    const binaryData = Buffer.from(base64OnlyData, "base64")

    // 安全なファイル名を生成（一意のファイル名にするために日時を追加）
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const fileExt = fileName.split(".").pop() || "pdf"
    const safeFileName = `${sanitizeFileName(fileName.replace(`.${fileExt}`, ""))}_${timestamp}.${fileExt}`

    // ファイルパスを生成 - public/genba/フォルダに直接保存
    const filePath = `public/genba/${safeFileName}`

    console.log(`Uploading file to ${BUCKET_NAME}/${filePath}`)

    // ファイルをアップロード - サービスロールキーを使用しているので、RLSをバイパスする
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, binaryData, {
      contentType: contentType || "application/pdf",
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("API: ファイルアップロードエラー:", error)
      return NextResponse.json(
        {
          error: `ファイルのアップロードに失敗しました: ${error.message}`,
          details: error,
        },
        { status: 500 },
      )
    }

    console.log("Upload successful, data:", data)

    // 公開URLを取得
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

    console.log("Public URL:", urlData?.publicUrl)

    // ファイルメタデータをデータベースに保存（dealIdがある場合のみ）
    let fileRecord = null
    if (dealId) {
      const { data: fileData, error: dbError } = await supabase
        .from("deal_files")
        .insert({
          deal_id: dealId,
          file_name: safeFileName,
          original_file_name: fileName, // オリジナルのファイル名を保存
          file_type: contentType || "application/pdf",
          url: urlData?.publicUrl || "",
        })
        .select()
        .single()

      if (dbError) {
        console.error("API: ファイルメタデータ保存エラー:", dbError)
        return NextResponse.json(
          {
            error: `ファイルメタデータの保存に失敗しました: ${dbError.message}`,
            details: dbError,
            url: urlData?.publicUrl || "",
            path: filePath,
          },
          { status: 500 },
        )
      }

      fileRecord = fileData
    }

    // 最初のPDFファイルの場合、dealsテーブルのpdf_urlを更新
    if (dealId) {
      const { error: updateError } = await supabase
        .from("deals")
        .update({ pdf_url: urlData?.publicUrl || "" })
        .eq("id", dealId)
        .is("pdf_url", null) // pdf_urlがnullの場合のみ更新（既存のURLを上書きしない）

      if (updateError) {
        console.error("API: deals テーブル更新エラー:", updateError)
        // エラーがあっても処理は続行（致命的ではないため）
      }
    }

    // 現場データを更新してリアルタイム通知をトリガー
    console.log("[ファイルアップロード] 現場データを更新して通知をトリガー:", dealId)
    await supabase.from("deals").update({ updated_at: new Date().toISOString() }).eq("id", dealId)

    return NextResponse.json({
      success: true,
      url: urlData?.publicUrl || "",
      path: filePath,
      file: fileRecord,
    })
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
