"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchClientData, insertClientData, updateClientData, deleteClientData } from "@/lib/supabase-utils"
import { useToast } from "@/hooks/use-toast"

export type Staff = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  position: string | null
  created_at: string
  updated_at: string
}

/**
 * スタッフデータを取得するカスタムフック
 */
export function useStaff(
  options: {
    filters?: Record<string, any>
    enabled?: boolean
  } = {},
) {
  const { toast } = useToast()
  const { filters = {}, enabled = true } = options

  return useQuery({
    queryKey: ["staff", filters],
    queryFn: async () => {
      try {
        const { data } = await fetchClientData<Staff>("staff", {
          filters,
          order: { column: "full_name", ascending: true },
        })
        return data
      } catch (error) {
        toast({
          title: "エラー",
          description: error instanceof Error ? error.message : "スタッフ一覧の取得に失敗しました",
          variant: "destructive",
        })
        throw error
      }
    },
    enabled,
  })
}

/**
 * スタッフを追加するカスタムフック
 */
export function useAddStaff() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (data: Partial<Staff>) => {
      try {
        const result = await insertClientData<Staff>("staff", data)
        return result
      } catch (error) {
        toast({
          title: "エラー",
          description: error instanceof Error ? error.message : "スタッフの追加に失敗しました",
          variant: "destructive",
        })
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
      toast({
        title: "成功",
        description: "スタッフが正常に追加されました",
      })
    },
  })
}

/**
 * スタッフを更新するカスタムフック
 */
export function useUpdateStaff() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Staff> }) => {
      try {
        const updatedData = {
          ...data,
          updated_at: new Date().toISOString(),
        }
        const result = await updateClientData<Staff>("staff", id, updatedData)
        return result
      } catch (error) {
        toast({
          title: "エラー",
          description: error instanceof Error ? error.message : "スタッフの更新に失敗しました",
          variant: "destructive",
        })
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
      toast({
        title: "成功",
        description: "スタッフが正常に更新されました",
      })
    },
  })
}

/**
 * スタッフを削除するカスタムフック
 */
export function useDeleteStaff() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await deleteClientData("staff", id)
        return id
      } catch (error) {
        toast({
          title: "エラー",
          description: error instanceof Error ? error.message : "スタッフの削除に失敗しました",
          variant: "destructive",
        })
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
      toast({
        title: "成功",
        description: "スタッフが正常に削除されました",
      })
    },
  })
}
