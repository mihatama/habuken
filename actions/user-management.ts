"use server"

import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { getServerSupabase } from "@/lib/supabase/client"

// ユーザー一覧を取得
export async function getUsers() {
  const supabase = getServerSupabase()

  try {
    // ユーザー情報を取得
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error("ユーザー取得エラー:", error)
    return { success: false, error: error.message }
  }
}

// ユーザーを作成
export async function createUser(userData: any) {
  const supabase = getServerSupabase()

  try {
    // ユーザーを追加
    const { data, error } = await supabase
      .from("users")
      .insert({
        id: uuidv4(),
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) throw error

    // キャッシュを再検証
    revalidatePath("/admin/users")

    return { success: true, data }
  } catch (error: any) {
    console.error("ユーザー作成エラー:", error)
    return { success: false, error: error.message }
  }
}

// ユーザーを更新
export async function updateUser(id: string, userData: any) {
  const supabase = getServerSupabase()

  try {
    const { data, error } = await supabase
      .from("users")
      .update({
        ...userData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) throw error

    // キャッシュを再検証
    revalidatePath("/admin/users")

    return { success: true, data }
  } catch (error: any) {
    console.error("ユーザー更新エラー:", error)
    return { success: false, error: error.message }
  }
}

// ユーザーを削除
export async function deleteUser(id: string) {
  const supabase = getServerSupabase()

  try {
    const { error } = await supabase.from("users").delete().eq("id", id)

    if (error) throw error

    // キャッシュを再検証
    revalidatePath("/admin/users")

    return { success: true }
  } catch (error: any) {
    console.error("ユーザー削除エラー:", error)
    return { success: false, error: error.message }
  }
}
