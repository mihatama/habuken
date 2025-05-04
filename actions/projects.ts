"use server"

import { getServerSupabase } from "../lib/supabase-utils"
import { revalidatePath } from "next/cache"
import { callServerRpc } from "../lib/supabase-rpc"

// プロジェクト一覧を取得（最適化版）
export async function getProjects() {
  try {
    console.log("Server: RPCを使用してプロジェクトとリソースを取得中...")
    const data = await callServerRpc<any[]>("get_projects_with_resources")

    console.log("Server: プロジェクトとリソースの取得に成功:", data?.length || 0, "件")
    return { success: true, data }
  } catch (error: any) {
    console.error("Server: プロジェクト取得エラー:", error)
    return { success: false, error: error.message }
  }
}

// プロジェクト詳細を取得（新規追加）
export async function getProjectDetails(projectId: string) {
  try {
    console.log("Server: プロジェクト詳細を取得中:", projectId)
    const data = await callServerRpc<any>("get_project_details", { project_id: projectId })

    console.log("Server: プロジェクト詳細の取得に成功")
    return { success: true, data }
  } catch (error: any) {
    console.error("Server: プロジェクト詳細取得エラー:", error)
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

    console.log("Server: Creating project with data:", projectData)

    // プロジェクトを追加
    const { data, error } = await supabase
      .from("projects")
      .insert({
        ...projectData,
        created_by: user.id,
      })
      .select()

    if (error) {
      console.error("Server: Error creating project:", error)
      throw error
    }

    console.log("Server: Project created:", data)

    // プロジェクト割り当てがある場合は保存
    if (projectData.assignments && projectData.assignments.length > 0) {
      const projectId = data[0].id

      const assignmentsWithProjectId = projectData.assignments.map((assignment: any) => ({
        ...assignment,
        project_id: projectId,
      }))

      console.log("Server: Creating assignments:", assignmentsWithProjectId)

      const { error: assignmentError } = await supabase.from("project_assignments").insert(assignmentsWithProjectId)

      if (assignmentError) {
        console.error("Server: Error creating assignments:", assignmentError)
        throw assignmentError
      }
    }

    // キャッシュを再検証
    revalidatePath("/master/project")

    return { success: true, data }
  } catch (error: any) {
    console.error("Server: Project creation error:", error)
    return { success: false, error: error.message }
  }
}

// プロジェクトを更新
export async function updateProject(id: string, projectData: any) {
  const supabase = getServerSupabase()

  try {
    console.log("Server: Updating project:", id, projectData)
    const { data, error } = await supabase
      .from("projects")
      .update({
        ...projectData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Server: Error updating project:", error)
      throw error
    }

    console.log("Server: Project updated successfully:", data)

    // キャッシュを再検証
    revalidatePath("/master/project")

    return { success: true, data }
  } catch (error: any) {
    console.error("Server: Project update error:", error)
    return { success: false, error: error.message }
  }
}

// プロジェクトを削除
export async function deleteProject(id: string) {
  const supabase = getServerSupabase()

  try {
    console.log("Server: Deleting project:", id)
    // 関連する割り当てを削除
    const { error: assignmentError } = await supabase.from("project_assignments").delete().eq("project_id", id)

    if (assignmentError) {
      console.error("Server: Error deleting project assignments:", assignmentError)
      throw assignmentError
    }

    // プロジェクトを削除
    const { error } = await supabase.from("projects").delete().eq("id", id)

    if (error) {
      console.error("Server: Error deleting project:", error)
      throw error
    }

    console.log("Server: Project deleted successfully")

    // キャッシュを再検証
    revalidatePath("/master/project")

    return { success: true }
  } catch (error: any) {
    console.error("Server: Project deletion error:", error)
    return { success: false, error: error.message }
  }
}
