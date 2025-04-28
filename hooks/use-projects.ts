"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getProjects, createProject, updateProject, deleteProject } from "@/actions/projects"
import { useToast } from "@/hooks/use-toast"

// プロジェクト一覧を取得するフック
export function useProjects() {
  const { toast } = useToast()

  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const result = await getProjects()

      if (!result.success) {
        toast({
          title: "エラー",
          description: result.error || "プロジェクト一覧の取得に失敗しました",
          variant: "destructive",
        })
        throw new Error(result.error)
      }

      return result.data
    },
  })
}

// プロジェクトを作成するフック
export function useCreateProject() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (projectData: any) => {
      return createProject(projectData)
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
      return updateProject(id, data)
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
      return deleteProject(id)
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
