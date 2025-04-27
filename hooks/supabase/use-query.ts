"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchData, insertData, updateData, deleteData } from "@/lib/supabase/operations"
import { useToast } from "@/hooks/use-toast"

/**
 * テーブルからデータを取得するカスタムフック
 */
export function useSupabaseQuery<T = any>(
  tableName: string,
  options: {
    select?: string
    order?: { column: string; ascending: boolean }
    filters?: Record<string, any>
    limit?: number
    page?: number
    enabled?: boolean
    queryKey?: any[]
  } = {},
) {
  const { toast } = useToast()
  const { queryKey = [tableName], enabled = true, ...fetchOptions } = options

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const result = await fetchData<T>(tableName, fetchOptions)
        return result.data
      } catch (error: any) {
        toast({
          title: "エラー",
          description: `${tableName}データの取得に失敗しました`,
          variant: "destructive",
        })
        throw error
      }
    },
    enabled,
  })
}

/**
 * テーブルにデータを挿入するカスタムフック
 */
export function useSupabaseInsert<T = any>(tableName: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (data: any) => {
      try {
        const result = await insertData<T>(tableName, data)
        return result
      } catch (error: any) {
        toast({
          title: "エラー",
          description: `${tableName}へのデータ追加に失敗しました`,
          variant: "destructive",
        })
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] })
      toast({
        title: "成功",
        description: "データが正常に追加されました",
      })
    },
  })
}

/**
 * テーブルのデータを更新するカスタムフック
 */
export function useSupabaseUpdate<T = any>(tableName: string, options: { idField?: string } = {}) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { idField = "id" } = options

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      try {
        const result = await updateData<T>(tableName, id, data, { idField })
        return result
      } catch (error: any) {
        toast({
          title: "エラー",
          description: `${tableName}のデータ更新に失敗しました`,
          variant: "destructive",
        })
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] })
      toast({
        title: "成功",
        description: "データが正常に更新されました",
      })
    },
  })
}

/**
 * テーブルからデータを削除するカスタムフック
 */
export function useSupabaseDelete(tableName: string, options: { idField?: string } = {}) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { idField = "id" } = options

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await deleteData(tableName, id, { idField })
        return id
      } catch (error: any) {
        toast({
          title: "エラー",
          description: `${tableName}からのデータ削除に失敗しました`,
          variant: "destructive",
        })
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] })
      toast({
        title: "成功",
        description: "データが正常に削除されました",
      })
    },
  })
}
