"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

// ユーザー作成用の関数
export async function createUser(formData: FormData) {
  try {
    const supabase = createServerSupabaseClient()

    // 管理者権限チェック
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "認証されていません" }
    }

    // 管理者権限チェック
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("role", "admin")

    if (!userRoles || userRoles.length === 0) {
      return { success: false, error: "管理者権限がありません" }
    }

    // フォームデータの取得
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("fullName") as string
    const role = formData.get("role") as string
    const department = (formData.get("department") as string) || null
    const position = (formData.get("position") as string) || null

    if (!email || !password || !fullName || !role) {
      return { success: false, error: "必須項目が入力されていません" }
    }

    // ユーザー作成
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })

    if (userError) {
      console.error("ユーザー作成エラー:", userError)
      return { success: false, error: userError.message }
    }

    // プロフィール作成
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userData.user.id,
      email,
      full_name: fullName,
      department,
      position,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error("プロフィール作成エラー:", profileError)
      return { success: false, error: profileError.message }
    }

    // ロール割り当て
    const { error: roleError } = await supabase.from("user_roles").insert({
      id: uuidv4(),
      user_id: userData.user.id,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (roleError) {
      console.error("ロール割り当てエラー:", roleError)
      return { success: false, error: roleError.message }
    }

    // スタッフテーブルにも追加（必要に応じて）
    if (role === "staff" || role === "admin") {
      const { error: staffError } = await supabase.from("staff").insert({
        id: uuidv4(),
        user_id: userData.user.id,
        full_name: fullName,
        position,
        department,
        email,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (staffError) {
        console.error("スタッフ作成エラー:", staffError)
        // スタッフ作成エラーは致命的ではないので続行
      }
    }

    revalidatePath("/admin/users")
    return { success: true, userId: userData.user.id }
  } catch (error) {
    console.error("ユーザー作成中のエラー:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラーが発生しました",
    }
  }
}

// ユーザー一覧取得
export async function getUsers() {
  try {
    const supabase = createServerSupabaseClient()

    // プロフィールとロールを結合して取得
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        email,
        full_name,
        position,
        department,
        created_at,
        user_roles(role)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("ユーザー一覧取得エラー:", error)
      throw error
    }

    // ロールデータを整形
    const usersWithRoles = data.map((user) => {
      const roles = user.user_roles ? user.user_roles.map((r: any) => r.role) : []
      return {
        ...user,
        roles,
        user_roles: undefined, // 元のネストされたデータを削除
      }
    })

    return usersWithRoles
  } catch (error) {
    console.error("ユーザー一覧取得中のエラー:", error)
    throw error
  }
}

// ユーザー削除
export async function deleteUser(userId: string) {
  try {
    const supabase = createServerSupabaseClient()

    // 管理者権限チェック
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "認証されていません" }
    }

    // 管理者権限チェック
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("role", "admin")

    if (!userRoles || userRoles.length === 0) {
      return { success: false, error: "管理者権限がありません" }
    }

    // 自分自身は削除できないようにする
    if (userId === session.user.id) {
      return { success: false, error: "自分自身を削除することはできません" }
    }

    // ユーザーロールの削除
    const { error: roleError } = await supabase.from("user_roles").delete().eq("user_id", userId)

    if (roleError) {
      console.error("ロール削除エラー:", roleError)
      return { success: false, error: roleError.message }
    }

    // スタッフテーブルからの削除
    const { error: staffError } = await supabase.from("staff").delete().eq("user_id", userId)

    if (staffError) {
      console.error("スタッフ削除エラー:", staffError)
      // スタッフ削除エラーは致命的ではないので続行
    }

    // プロフィールの削除
    const { error: profileError } = await supabase.from("profiles").delete().eq("id", userId)

    if (profileError) {
      console.error("プロフィール削除エラー:", profileError)
      return { success: false, error: profileError.message }
    }

    // Supabaseユーザーの削除
    const { error: userError } = await supabase.auth.admin.deleteUser(userId)

    if (userError) {
      console.error("ユーザー削除エラー:", userError)
      return { success: false, error: userError.message }
    }

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("ユーザー削除中のエラー:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラーが発生しました",
    }
  }
}

// ユーザーロール更新
export async function updateUserRole(userId: string, role: string) {
  try {
    const supabase = createServerSupabaseClient()

    // 管理者権限チェック
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "認証されていません" }
    }

    // 管理者権限チェック
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("role", "admin")

    if (!userRoles || userRoles.length === 0) {
      return { success: false, error: "管理者権限がありません" }
    }

    // 現在のロールを取得
    const { data: currentRoles, error: getRoleError } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", userId)

    if (getRoleError) {
      console.error("ロール取得エラー:", getRoleError)
      return { success: false, error: getRoleError.message }
    }

    // 既存のロールを削除
    if (currentRoles && currentRoles.length > 0) {
      const { error: deleteRoleError } = await supabase.from("user_roles").delete().eq("user_id", userId)

      if (deleteRoleError) {
        console.error("ロール削除エラー:", deleteRoleError)
        return { success: false, error: deleteRoleError.message }
      }
    }

    // 新しいロールを追加
    const { error: insertRoleError } = await supabase.from("user_roles").insert({
      id: uuidv4(),
      user_id: userId,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (insertRoleError) {
      console.error("ロール追加エラー:", insertRoleError)
      return { success: false, error: insertRoleError.message }
    }

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("ロール更新中のエラー:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラーが発生しました",
    }
  }
}
