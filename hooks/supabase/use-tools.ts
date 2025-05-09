"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchClientData, insertClientData, updateClientData, deleteClientData } from "@/lib/supabase-utils"
import { useToast } from "@/hooks/use-toast"

export type Tool = {
  id: string
  name: string
  type?: string
  resource_type?: string
  location: string | null
  status: string
  last_inspection_date: string | null
  created_at: string
  updated_at: string
}

/**
 * 工具データを取得するカスタムフック
 */
export function useTools(
  options: {
    filters?: Record<string, any>
    enabled?: boolean
  } = {},
) {
  const { toast } = useToast()
  const { filters = {}, enabled = true } = options

  return useQuery({
    queryKey: ["tools", filters],
    queryFn: async () => {
      try {
        const { data } = await fetchClientData<Tool>("resources", {
          filters: { type: "工具", ...filters },
          order: { column: "display_order", ascending: true },
        })
        return data
      } catch (error) {
        toast({
          title: "エラー",
          description: error instanceof Error ? error.message : "工具一覧の取得に失敗しました",
          variant: "destructive",
        })
        throw error
      }
    },
    enabled,
  })
}

/**
 * 工具を追加するカスタムフック
 */
export function useAddTool() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (data: Partial<Tool>) => {
      try {
        const result = await insertClientData<Tool>("resources", data)
        return result
      } catch (error) {
        toast({
          title: "エラー",
          description: error instanceof Error ? error.message : "工具の追加に失敗しました",
          variant: "destructive",
        })
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] })
      toast({
        title: "成功",
        description: "工具が正常に追加されました",
      })
    },
  })
}

/**
 * 工具を更新するカスタムフック
 */
export function useUpdateTool() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Tool> }) => {
      try {
        const updatedData = {
          ...data,
          updated_at: new Date().toISOString(),
        }
        const result = await updateClientData<Tool>("resources", id, updatedData)
        return result
      } catch (error) {
        toast({
          title: "エラー",
          description: error instanceof Error ? error.message : "工具の更新に失敗しました",
          variant: "destructive",
        })
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] })
      toast({
        title: "成功",
        description: "工具が正常に更新されました",
      })
    },
  })
}

/**
 * 工具を削除するカスタムフック
 */
export function useDeleteTool() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await deleteClientData("resources", id)
        return id
      } catch (error) {
        toast({
          title: "エラー",
          description: error instanceof Error ? error.message : "工具の削除に失敗しました",
          variant: "destructive",
        })
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] })
      toast({
        title: "成功",
        description: "工具が正常に削除されました",
      })
    },
  })
}
