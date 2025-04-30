"use server"

import { createClient } from "@supabase/supabase-js"

export async function createAdminUser() {
  try {
    // 環境変数の確認
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("必要な環境変数が設定されていません")
      return {
        success: false,
        message: "サーバー設定エラー: 必要な環境変数が設定されていません",
      }
    }

    // サーバーサイドでSupabaseクライアントを初期化（管理者権限）
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // ユーザー情報
    const email = "info@mihatama.com"
    const password = "gensuke"
    const fullName = "管理者"

    // ユーザーが既に存在するか確認
    const {
      data: { users },
      error: getUserError,
    } = await supabase.auth.admin.listUsers()

    if (getUserError) {
      console.error("ユーザー一覧取得エラー:", getUserError)
      return {
        success: false,
        message: `ユーザー一覧取得エラー: ${getUserError.message}`,
      }
    }

    const existingUser = users?.find((user) => user.email === email)

    if (existingUser) {
      console.log("ユーザーは既に存在します。ID:", existingUser.id)

      // 既存の参照を削除
      const tables = ["profiles", "staff", "user_roles"]

      for (const table of tables) {
        try {
          // user_idカラムがある場合
          const { error: userIdError } = await supabase.from(table).delete().eq("user_id", existingUser.id)

          if (userIdError && !userIdError.message.includes("does not exist")) {
            console.warn(`${table} テーブルのuser_id参照削除エラー:`, userIdError)
          }

          // idカラムがある場合（profilesなど）
          if (table === "profiles") {
            const { error: idError } = await supabase.from(table).delete().eq("id", existingUser.id)

            if (idError && !idError.message.includes("does not exist")) {
              console.warn(`${table} テーブルのid参照削除エラー:`, idError)
            }
          }
        } catch (error) {
          console.warn(`${table} テーブル処理中のエラー:`, error)
          // 続行する
        }
      }

      // 既存ユーザーのパスワードを更新
      const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
        password,
        user_metadata: {
          full_name: fullName,
          role: "admin",
        },
        email_confirm: true,
      })

      if (updateError) {
        console.error("ユーザー更新エラー:", updateError)
        return {
          success: false,
          message: `ユーザー更新エラー: ${updateError.message}`,
        }
      }

      // プロフィールテーブルにデータを追加
      const { error: profileError } = await supabase.from("profiles").insert({
        id: existingUser.id,
        email,
        full_name: fullName,
        role: "admin",
      })

      if (profileError && !profileError.message.includes("duplicate key")) {
        console.error("プロフィール作成エラー:", profileError)
        // プロフィール作成エラーは致命的ではないので続行
      }

      // スタッフテーブルにも追加
      const { error: staffError } = await supabase.from("staff").insert({
        user_id: existingUser.id,
        full_name: fullName,
        email,
        position: "管理者",
        department: "管理部",
        status: "active",
      })

      if (staffError && !staffError.message.includes("duplicate key")) {
        console.error("スタッフ追加エラー:", staffError)
        // スタッフ作成エラーは致命的ではないので続行
      }

      return {
        success: true,
        message: "既存ユーザーを更新しました。info@mihatama.com / gensuke でログインできます。",
      }
    }

    // 新規ユーザーを作成
    console.log("新規ユーザーを作成します:", email)
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: "admin",
      },
    })

    if (createError) {
      console.error("ユーザー作成エラー:", createError)
      return {
        success: false,
        message: `ユーザー作成エラー: ${createError.message}`,
      }
    }

    if (!userData.user) {
      return {
        success: false,
        message: "ユーザーデータが返されませんでした",
      }
    }

    console.log("ユーザーが作成されました:", userData.user.id)

    // プロフィールテーブルにデータを追加
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userData.user.id,
      email,
      full_name: fullName,
      role: "admin",
    })

    if (profileError) {
      console.error("プロフィール作成エラー:", profileError)
      // プロフィール作成エラーは致命的ではないので続行
    }

    // スタッフテーブルにも追加
    const { error: staffError } = await supabase.from("staff").insert({
      user_id: userData.user.id,
      full_name: fullName,
      email,
      position: "管理者",
      department: "管理部",
      status: "active",
    })

    if (staffError) {
      console.error("スタッフ追加エラー:", staffError)
      // スタッフ作成エラーは致命的ではないので続行
    }

    return {
      success: true,
      message: "管理者ユーザーが正常に作成されました。info@mihatama.com / gensuke でログインできます。",
    }
  } catch (error: any) {
    console.error("管理者ユーザー作成エラー:", error)
    return {
      success: false,
      message: `エラー: ${error.message}`,
    }
  }
}
