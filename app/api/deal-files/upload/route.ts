import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const dealId = formData.get("dealId") as string

    if (!file || !dealId) {
      return NextResponse.json({ error: "ファイルまたは現場IDが提供されていません" }, { status: 400 })
    }

    // Supabaseクライアントの作成
    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // ファイル名の生成（一意性を確保するためにタイムスタンプを追加）
    const timestamp = Date.now()
    const originalFileName = file.name
    const fileExtension = originalFileName.split(".").pop()
    const fileName = `${dealId}/${timestamp}-${originalFileName}`

    // ファイルをArrayBufferに変換
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Supabaseストレージにアップロード
    const { data: storageData, error: storageError } = await supabase.storage.from("genba").upload(fileName, buffer, {
      contentType: file.type,
      upsert: true,
    })

    if (storageError) {
      console.error("ストレージアップロードエラー:", storageError)
      return NextResponse.json({ error: `ファイルアップロードエラー: ${storageError.message}` }, { status: 500 })
    }

    // 公開URLの取得
    const { data: publicUrlData } = supabase.storage.from("genba").getPublicUrl(fileName)

    const fileUrl = publicUrlData.publicUrl

    try {
      // データベースにファイルメタデータを保存
      const { data: fileData, error: fileError } = await supabase
        .from("deal_files")
        .insert({
          deal_id: dealId,
          file_name: fileName,
          original_file_name: originalFileName,
          file_type: file.type,
          url: fileUrl,
        })
        .select()

      if (fileError) {
        console.error("ファイルメタデータ保存エラー:", fileError)
        // テーブルが存在しない場合でもファイルはアップロードされているので、エラーを返さずに続行
        return NextResponse.json({
          success: true,
          message: "ファイルはアップロードされましたが、メタデータの保存に失敗しました",
          file: {
            name: fileName,
            originalName: originalFileName,
            type: file.type,
            url: fileUrl,
          },
        })
      }

      return NextResponse.json({
        success: true,
        file: fileData[0] || {
          name: fileName,
          originalName: originalFileName,
          type: file.type,
          url: fileUrl,
        },
      })
    } catch (dbError) {
      console.error("データベースエラー:", dbError)
      // データベースエラーが発生しても、ファイルはアップロードされているので成功レスポンスを返す
      return NextResponse.json({
        success: true,
        message: "ファイルはアップロードされましたが、メタデータの保存に失敗しました",
        file: {
          name: fileName,
          originalName: originalFileName,
          type: file.type,
          url: fileUrl,
        },
      })
    }
  } catch (error: any) {
    console.error("アップロード処理エラー:", error)
    return NextResponse.json({ error: `ファイル処理エラー: ${error.message}` }, { status: 500 })
  }
}
