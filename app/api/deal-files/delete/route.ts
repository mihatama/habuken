import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const { fileName, fileId } = await request.json()

    if (!fileName) {
      return NextResponse.json({ error: "ファイル名が提供されていません" }, { status: 400 })
    }

    // Supabaseクライアントの作成
    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // ストレージからファイルを削除
    const { error: storageError } = await supabase.storage.from("genba").remove([fileName])

    if (storageError) {
      console.error("ストレージ削除エラー:", storageError)
      return NextResponse.json({ error: `ファイル削除エラー: ${storageError.message}` }, { status: 500 })
    }

    // fileIdが提供されている場合、データベースからメタデータを削除
    if (fileId) {
      try {
        const { error: dbError } = await supabase.from("deal_files").delete().eq("id", fileId)

        if (dbError) {
          // テーブルが存在しない場合のエラーを特別に処理
          if (dbError.message.includes("does not exist")) {
            console.warn("deal_files テーブルが存在しません。ファイルメタデータの削除をスキップします。")
          } else {
            console.error("ファイルメタデータ削除エラー:", dbError)
          }
          // ファイル自体は削除されているので、エラーを返さずに続行
        }
      } catch (dbError) {
        console.error("データベースエラー:", dbError)
        // データベースエラーが発生しても、ファイルは削除されているので成功レスポンスを返す
      }
    }

    return NextResponse.json({
      success: true,
      message: "ファイルが正常に削除されました",
    })
  } catch (error: any) {
    console.error("削除処理エラー:", error)
    return NextResponse.json({ error: `ファイル処理エラー: ${error.message}` }, { status: 500 })
  }
}
