"use client"

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { getClientSupabase } from "@/lib/supabase-utils"

// プロジェクト一覧を取得するフック
export function useProjects() {
  const queryClient = useQueryClient()
  const supabase = getClientSupabase()

  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      try {
        console.log("Fetching projects from Supabase...")
        const { data, error } = await supabase.from("projects").select("*").order("display_order", { ascending: true })

        if (error) {
          console.error("Error fetching projects:", error)
          throw error
        }

        console.log("Projects fetched successfully:", data?.length || 0, "projects")
        return data || []
      } catch (error) {
        console.error("Failed to fetch projects:", error)
        throw error
      }
    },
    staleTime: 1000, // 1秒後にデータを古いと見なす
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}

// プロジェクトを作成するフック
export function useCreateProject() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const supabase = getClientSupabase()

  return useMutation({
    mutationFn: async (projectData: any) => {
      try {
        console.log("Creating project with data:", projectData)

        // プロジェクトを追加
        const { data: projectResult, error: projectError } = await supabase
          .from("projects")
          .insert({
            name: projectData.name,
            description: projectData.description,
            start_date: projectData.start_date,
            end_date: projectData.end_date,
            status: projectData.status,
            client: projectData.client,
            location: projectData.location,
            created_by: projectData.created_by,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()

        if (projectError) {
          console.error("Error creating project:", projectError)
          throw projectError
        }

        console.log("Project created:", projectResult)

        // プロジェクトIDを取得
        const projectId = projectResult[0].id

        // 割り当てがある場合は保存
        if (projectData.assignments && projectData.assignments.length > 0) {
          const assignmentsWithProjectId = projectData.assignments.map((assignment: any) => ({
            ...assignment,
            project_id: projectId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }))

          console.log("Creating assignments:", assignmentsWithProjectId)

          const { error: assignmentError } = await supabase.from("project_assignments").insert(assignmentsWithProjectId)

          if (assignmentError) {
            console.error("Error creating assignments:", assignmentError)
            throw assignmentError
          }
        }

        return { success: true, data: projectResult }
      } catch (error: any) {
        console.error("Project creation error:", error)
        return {
          success: false,
          error: error.message || "プロジェクトの作成に失敗しました",
        }
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        // キャッシュを無効化して再取得を強制
        queryClient.invalidateQueries({ queryKey: ["projects"] })
        queryClient.refetchQueries({ queryKey: ["projects"] })

        toast({
          title: "成功",
          description: "プロジェクトが正常に作成されました",
        })
      } else {
        toast({
          title: "エラー",
          description: result.error || "プロジェクトの作成に失敗しました",
          variant: "destructive",
        })
      }
      return result
    },
    onError: (error: any) => {
      console.error("Mutation error:", error)
      toast({
        title: "エラー",
        description: error.message || "プロジェクトの作成に失敗しました",
        variant: "destructive",
      })
    },
  })
}

// プロジェクトを更新するフック
export function useUpdateProject() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const supabase = getClientSupabase()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      try {
        console.log("Updating project:", id, data)
        const { data: result, error } = await supabase
          .from("projects")
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()

        if (error) {
          console.error("Error updating project:", error)
          throw error
        }

        console.log("Project updated successfully:", result)
        return { success: true, data: result }
      } catch (error: any) {
        console.error("Project update error:", error)
        return {
          success: false,
          error: error.message || "プロジェクトの更新に失敗しました",
        }
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["projects"] })
        toast({
          title: "成功",
          description: "プロジェクトが正常に更新されました",
        })
      } else {
        toast({
          title: "エラー",
          description: result.error || "プロジェクトの更新に失敗しました",
          variant: "destructive",
        })
      }
      return result
    },
    onError: (error: any) => {
      toast({
        title: "エラー",
        description: error.message || "プロジェクトの更新に失敗しました",
        variant: "destructive",
      })
    },
  })
}

// プロジェクトを削除するフック
export function useDeleteProject() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const supabase = getClientSupabase()

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        console.log("Deleting project:", id)
        // 関連する割り当てを先に削除
        const { error: assignmentError } = await supabase.from("project_assignments").delete().eq("project_id", id)

        if (assignmentError) {
          console.error("Error deleting project assignments:", assignmentError)
          throw assignmentError
        }

        // プロジェクトを削除
        const { error } = await supabase.from("projects").delete().eq("id", id)

        if (error) {
          console.error("Error deleting project:", error)
          throw error
        }

        console.log("Project deleted successfully")
        return { success: true }
      } catch (error: any) {
        console.error("Project deletion error:", error)
        return {
          success: false,
          error: error.message || "プロジェクトの削除に失敗しました",
        }
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["projects"] })
        toast({
          title: "成功",
          description: "プロジェクトが正常に削除されました",
        })
      } else {
        toast({
          title: "エラー",
          description: result.error || "プロジェクトの削除に失敗しました",
          variant: "destructive",
        })
      }
      return result
    },
    onError: (error: any) => {
      toast({
        title: "エラー",
        description: error.message || "プロジェクトの削除に失敗しました",
        variant: "destructive",
      })
    },
  })
}
