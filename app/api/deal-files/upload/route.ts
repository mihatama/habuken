import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { STORAGE_BUCKET_NAME, ensureStorageBucketExists } from "@/lib/supabase-storage-utils"
import { sanitizeFileName } from "@/utils/file-utils"

export async function POST(request: Request) {
  try {
    // バケットの存在確認と作成
    const { success: bucketSuccess, error: bucketError } = await ensureStorageBucketExists()

    if (!bucketSuccess) {
      console.error("API: バケット確認/作成エラー:", bucketError)
      return NextResponse.json(
        { error: `ストレージバケットの確認/作成に失敗しました: ${bucketError}` },
        { status: 500 },
      )
    }

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

    // 安全なファイル名を生成
    const safeFileName = sanitizeFileName(fileName)

    // ファイルパスを生成 - dealIdがある場合はそのフォルダに保存
    const filePath = dealId ? `${dealId}/${safeFileName}` : `temp/${safeFileName}`

    console.log(`Uploading file to ${STORAGE_BUCKET_NAME}/${filePath}`)

    // ファイルをアップロード - サービスロールキーを使用しているので、RLSをバイパスする
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET_NAME).upload(filePath, binaryData, {
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
    const { data: urlData } = supabase.storage.from(STORAGE_BUCKET_NAME).getPublicUrl(filePath)

    console.log("Public URL:", urlData?.publicUrl)

    // ファイルメタデータをデータベースに保存（dealIdがある場合のみ）
    let fileRecord = null
    if (dealId) {
      const { data: fileData, error: dbError } = await supabase
        .from("deal_files")
        .insert({
          deal_id: dealId,
          file_name: fileName,
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
