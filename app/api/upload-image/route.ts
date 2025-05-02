import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// バケット名を定数として定義
const STORAGE_BUCKET_NAME = "dailyreports"
const STORAGE_FOLDER_NAME = "public/daily_report_photos"

export async function POST(request: Request) {
  try {
    // リクエストボディを取得
    const { base64Image, fileName, contentType } = await request.json()

    if (!base64Image || !fileName) {
      return NextResponse.json({ error: "画像データとファイル名は必須です" }, { status: 400 })
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
    const base64Data = base64Image.split(";base64,").pop()
    if (!base64Data) {
      return NextResponse.json({ error: "無効な画像データです" }, { status: 400 })
    }

    // バイナリデータに変換
    const binaryData = Buffer.from(base64Data, "base64")

    // ファイル名を生成
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${fileName}`
    const filePath = `${STORAGE_FOLDER_NAME}/${uniqueFileName}`

    // ファイルをアップロード
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET_NAME).upload(filePath, binaryData, {
      contentType: contentType || "image/jpeg",
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("API: 画像アップロードエラー:", error)
      return NextResponse.json(
        {
          error: `画像のアップロードに失敗しました: ${error.message}`,
          details: error,
        },
        { status: 500 },
      )
    }

    // 公開URLを取得
    const { data: urlData } = supabase.storage.from(STORAGE_BUCKET_NAME).getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      url: urlData?.publicUrl || "",
      path: filePath,
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
