"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { fetchClientData, insertClientData, updateClientData, deleteClientData } from "@/lib/supabase-utils"
import { getClientSupabase } from "@/lib/supabase-client"

// プロジェクト一覧を取得するフック
export function useProjects() {
  const { toast } = useToast()

  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      try {
        const { data } = await fetchClientData("projects", {
          order: { column: "created_at", ascending: false },
        })
        return data
      } catch (error) {
        toast({
          title: "エラー",
          description: error instanceof Error ? error.message : "プロジェクト一覧の取得に失敗しました",
          variant: "destructive",
        })
        throw error
      }
    },
  })
}

// プロジェクトを作成するフック
export function useCreateProject() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (projectData: any) => {
      try {
        const data = await insertClientData("projects", projectData)

        // プロジェクト割り当てがある場合は保存
        if (projectData.assignments && projectData.assignments.length > 0 && data && data.length > 0) {
          const projectId = data[0].id

          const assignmentsWithProjectId = projectData.assignments.map((assignment: any) => ({
            ...assignment,
            project_id: projectId,
          }))

          await insertClientData("project_assignments", assignmentsWithProjectId)
        }

        return { success: true, data }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "プロジェクトの作成に失敗しました",
        }
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["projects"] })
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

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      try {
        const updatedData = {
          ...data,
          updated_at: new Date().toISOString(),
        }
        const result = await updateClientData("projects", id, updatedData)
        return { success: true, data: result }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "プロジェクトの更新に失敗しました",
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

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        // 関連する割り当てを先に削除
        const supabase = getClientSupabase()
        await supabase.from("project_assignments").delete().eq("project_id", id)

        // プロジェクトを削除
        await deleteClientData("projects", id)
        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "プロジェクトの削除に失敗しました",
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
