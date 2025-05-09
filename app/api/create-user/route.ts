import { createAdminUser } from "@/actions/create-admin-user"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// GET メソッドは既存の管理者作成機能のために残しておく
export async function GET() {
  try {
    const result = await createAdminUser()
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `API Error: ${error.message}`,
        debug: { error: error.toString() },
      },
      { status: 500 },
    )
  }
}

// 新しい POST メソッドを追加
export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json()

    // バリデーション
    if (!email || !password || !role) {
      return NextResponse.json(
        {
          success: false,
          message: "メールアドレス、パスワード、権限は必須です",
        },
        { status: 400 },
      )
    }

    // 環境変数を直接取得
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase URL and service role key must be provided")
    }

    // サービスロールキーを使用して直接Supabaseクライアントを初期化
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // ユーザーを作成
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // メール確認済みとして作成
      user_metadata: { role }, // ユーザーメタデータに権限を設定
    })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: `ユーザー ${email} を ${role} 権限で作成しました`,
      data: data.user,
    })
  } catch (error: any) {
    console.error("ユーザー作成エラー:", error)
    return NextResponse.json(
      {
        success: false,
        message: `ユーザー作成エラー: ${error.message}`,
        debug: { error: error.toString() },
      },
      { status: 500 },
    )
  }
}
