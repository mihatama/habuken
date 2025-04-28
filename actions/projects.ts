"use server"

import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { getServerSupabase } from "@/lib/supabase/client"

// モックユーザー
const mockUser = {
  id: "1",
  email: "yamada@example.com",
  user_metadata: {
    full_name: "山田太郎",
    role: "admin",
  },
}

// プロジェクト一覧を取得
export async function getProjects() {
  const supabase = getServerSupabase()

  try {
    // プロジェクト情報を取得
    const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error("プロジェクト取得エラー:", error)
    return { success: false, error: error.message }
  }
}

// プロジェクトを作成
export async function createProject(projectData: any) {
  const supabase = getServerSupabase()

  try {
    // プロジェクトを追加
    const { data, error } = await supabase
      .from("projects")
      .insert({
        id: uuidv4(),
        ...projectData,
        created_by: mockUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) throw error

    // キャッシュを再検証
    revalidatePath("/master/project")

    return { success: true, data }
  } catch (error: any) {
    console.error("プロジェクト作成エラー:", error)
    return { success: false, error: error.message }
  }
}

// プロジェクトを更新
export async function updateProject(id: string, projectData: any) {
  const supabase = getServerSupabase()

  try {
    const { data, error } = await supabase
      .from("projects")
      .update({
        ...projectData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) throw error

    // キャッシュを再検証
    revalidatePath("/master/project")

    return { success: true, data }
  } catch (error: any) {
    console.error("プロジェクト更新エラー:", error)
    return { success: false, error: error.message }
  }
}

// プロジェクトを削除
export async function deleteProject(id: string) {
  const supabase = getServerSupabase()

  try {
    const { error } = await supabase.from("projects").delete().eq("id", id)

    if (error) throw error

    // キャッシュを再検証
    revalidatePath("/master/project")

    return { success: true }
  } catch (error: any) {
    console.error("プロジェクト削除エラー:", error)
    return { success: false, error: error.message }
  }
}
