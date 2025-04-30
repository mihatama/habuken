"use server"

import { createClient } from "@supabase/supabase-js"

export async function deleteUserAndReferences(userId: string) {
  try {
    // 環境変数の確認
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceRoleKey) {
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

    console.log(`ユーザーID: ${userId} の参照を削除します`)

    // 関連テーブルからの参照を削除
    // 注意: 実際のテーブル名とカラム名に合わせて調整してください
    const tables = ["profiles", "staff", "user_roles", "daily_reports", "leave_requests", "projects", "tasks"]

    for (const table of tables) {
      try {
        // user_idカラムがある場合
        const { error: userIdError } = await supabase.from(table).delete().eq("user_id", userId)

        if (userIdError && !userIdError.message.includes("does not exist")) {
          console.warn(`${table} テーブルのuser_id参照削除エラー:`, userIdError)
        }

        // idカラムがある場合（profilesなど）
        if (table === "profiles") {
          const { error: idError } = await supabase.from(table).delete().eq("id", userId)

          if (idError && !idError.message.includes("does not exist")) {
            console.warn(`${table} テーブルのid参照削除エラー:`, idError)
          }
        }
      } catch (error) {
        console.warn(`${table} テーブル処理中のエラー:`, error)
        // 続行する
      }
    }

    // ユーザーを削除
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error("ユーザー削除エラー:", deleteError)
      return {
        success: false,
        message: `ユーザー削除エラー: ${deleteError.message}`,
      }
    }

    return {
      success: true,
      message: "ユーザーとその参照が正常に削除されました",
    }
  } catch (error: any) {
    console.error("ユーザー削除処理エラー:", error)
    return {
      success: false,
      message: `エラー: ${error.message}`,
    }
  }
}
