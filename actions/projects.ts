"use server"

import { getServerSupabase } from "../lib/supabase-utils"
import { revalidatePath } from "next/cache"

// プロジェクト一覧を取得
export async function getProjects() {
  const supabase = getServerSupabase()

  try {
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
    // ユーザー情報を取得
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("認証されていません")
    }

    // プロジェクトを追加
    const { data, error } = await supabase
      .from("projects")
      .insert({
        ...projectData,
        created_by: user.id,
      })
      .select()

    if (error) throw error

    // プロジェクト割り当てがある場合は保存
    if (projectData.assignments && projectData.assignments.length > 0) {
      const projectId = data[0].id

      const assignmentsWithProjectId = projectData.assignments.map((assignment: any) => ({
        ...assignment,
        project_id: projectId,
      }))

      const { error: assignmentError } = await supabase.from("project_assignments").insert(assignmentsWithProjectId)

      if (assignmentError) throw assignmentError
    }

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
    // 関連する割り当てを削除
    const { error: assignmentError } = await supabase.from("project_assignments").delete().eq("project_id", id)

    if (assignmentError) throw assignmentError

    // プロジェクトを削除
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
