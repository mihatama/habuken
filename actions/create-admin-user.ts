"use server"

import { createClient } from "@supabase/supabase-js"

export async function createAdminUser() {
  try {
    // サーバーサイドでSupabaseクライアントを初期化
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // ユーザーが既に存在するか確認
    const { data: existingUser } = await supabase.from("users").select("*").eq("email", "info@mihatama.com").single()

    if (existingUser) {
      return { success: false, message: "ユーザーは既に存在します" }
    }

    // 管理者ユーザーを作成
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: "info@mihatama.com",
      password: "gensuke",
      email_confirm: true,
      user_metadata: {
        full_name: "管理者",
        role: "admin",
      },
    })

    if (createError) {
      console.error("ユーザー作成エラー:", createError)
      return { success: false, message: `ユーザー作成エラー: ${createError.message}` }
    }

    // スタッフテーブルにも追加
    if (userData.user) {
      const { error: staffError } = await supabase.from("staff").insert({
        id: userData.user.id,
        name: "管理者",
        email: "info@mihatama.com",
        role: "admin",
        department: "管理部",
        position: "管理者",
      })

      if (staffError) {
        console.error("スタッフ追加エラー:", staffError)
        return { success: true, message: "ユーザーは作成されましたが、スタッフ情報の追加に失敗しました" }
      }
    }

    return { success: true, message: "管理者ユーザーが正常に作成されました" }
  } catch (error: any) {
    console.error("管理者ユーザー作成エラー:", error)
    return { success: false, message: `エラー: ${error.message}` }
  }
}
