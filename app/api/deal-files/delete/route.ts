import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// バケット名を変更
const BUCKET_NAME = "genba"

export async function POST(request: Request) {
  try {
    // リクエストボディを取得
    const { fileId, filePath } = await request.json()

    if (!fileId || !filePath) {
      return NextResponse.json({ error: "ファイルIDとパスは必須です" }, { status: 400 })
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

    console.log(`Deleting file from ${BUCKET_NAME}/${filePath}`)

    // ファイルをストレージから削除
    const { error: storageError } = await supabase.storage.from(BUCKET_NAME).remove([filePath])

    if (storageError) {
      console.error("API: ファイル削除エラー:", storageError)
      return NextResponse.json(
        {
          error: `ファイルの削除に失敗しました: ${storageError.message}`,
          details: storageError,
        },
        { status: 500 },
      )
    }

    try {
      // データベースからファイルメタデータを削除を試みる
      const { error: dbError } = await supabase.from("deal_files").delete().eq("id", fileId)

      if (dbError) {
        // テーブルが存在しないエラーの場合は警告としてログに記録するだけ
        if (dbError.message.includes("does not exist")) {
          console.warn("API: deal_files テーブルが存在しません。ストレージからのファイル削除のみ行いました。")
        } else {
          console.error("API: ファイルメタデータ削除エラー:", dbError)
          // ストレージからは削除できたので、エラーを返さずに続行
        }
      }
    } catch (dbError) {
      console.warn("API: データベース操作中にエラーが発生しましたが、ファイルは削除されました:", dbError)
      // ストレージからは削除できたので、エラーを返さずに続行
    }

    return NextResponse.json({
      success: true,
      message: "ファイルが正常に削除されました",
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
