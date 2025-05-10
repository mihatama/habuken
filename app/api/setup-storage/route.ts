import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { STORAGE_BUCKET_NAME, STORAGE_FOLDER_NAME } from "@/lib/supabase-storage-utils"

export async function POST(request: Request) {
  try {
    // サービスロールキーを使用してSupabaseクライアントを作成
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("環境変数が設定されていません")
      return NextResponse.json({ error: "サーバー設定が不完全です" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })

    // バケットの一覧を取得
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error("バケット一覧取得エラー:", listError)
      return NextResponse.json({ error: listError.message }, { status: 500 })
    }

    console.log(
      "既存のバケット:",
      buckets?.map((b) => b.name),
    )

    // genbaバケットが存在するか確認
    const genbaExists = buckets?.some((bucket) => bucket.name === STORAGE_BUCKET_NAME)

    if (!genbaExists) {
      console.log(`${STORAGE_BUCKET_NAME}バケットが存在しないため作成します`)

      // バケットを作成
      const { data, error: createError } = await supabase.storage.createBucket(STORAGE_BUCKET_NAME, {
        public: true, // 公開バケットとして作成
      })

      if (createError) {
        console.error("バケット作成エラー:", createError)
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }

      console.log(`${STORAGE_BUCKET_NAME}バケットを作成しました:`, data)
    } else {
      console.log(`${STORAGE_BUCKET_NAME}バケットは既に存在します`)
    }

    // フォルダを作成（Supabaseではフォルダは空のファイルとして表現される）
    const folderPath = `${STORAGE_FOLDER_NAME}/.folder`
    const { error: folderError } = await supabase.storage
      .from(STORAGE_BUCKET_NAME)
      .upload(folderPath, new Uint8Array(0), {
        contentType: "application/x-directory",
        upsert: true,
      })

    if (folderError && folderError.message !== "The resource already exists") {
      console.error("フォルダ作成エラー:", folderError)
      return NextResponse.json({ error: folderError.message }, { status: 500 })
    }

    // ポリシーを設定
    try {
      await supabase.rpc("setup_genba_bucket_policies")
    } catch (policyError) {
      console.error("ポリシー設定エラー:", policyError)
      // エラーがあっても続行（既に設定されている可能性がある）
    }

    return NextResponse.json({
      success: true,
      message: `バケット「${STORAGE_BUCKET_NAME}」とフォルダ「${STORAGE_FOLDER_NAME}」が正常に作成されました`,
    })
  } catch (error: any) {
    console.error("予期しないエラー:", error)
    return NextResponse.json(
      {
        error: `予期しないエラーが発生しました: ${error.message}`,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
