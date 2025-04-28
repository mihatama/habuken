"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { fetchClientData, insertClientData, updateClientData, deleteClientData } from "@/lib/supabase-utils"

// 汎用データ取得フック
export function useData<T = any>(
  tableName: string,
  options: {
    queryKey?: any[]
    filters?: Record<string, any>
    order?: { column: string; ascending: boolean }
    enabled?: boolean
    select?: (data: T[]) => any
    onError?: (error: Error) => void
  } = {},
) {
  const { queryKey = [tableName], filters = {}, order, enabled = true, select, onError } = options
  const { toast } = useToast()

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const { data } = await fetchClientData<T>(tableName, {
          filters,
          order,
        })
        return data
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : `${tableName}データの取得に失敗しました`
        toast({
          title: "エラー",
          description: errorMessage,
          variant: "destructive",
        })
        if (onError && error instanceof Error) {
          onError(error)
        }
        throw error
      }
    },
    enabled,
    select,
  })
}

// 汎用データ追加フック
export function useAddData<T = any>(
  tableName: string,
  options: {
    onSuccess?: (data: T[]) => void
    onError?: (error: Error) => void
    invalidateQueries?: string[]
  } = {},
) {
  const { onSuccess, onError, invalidateQueries = [tableName] } = options
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (data: Partial<T>) => {
      try {
        const result = await insertClientData<T>(tableName, data)
        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : `${tableName}データの追加に失敗しました`
        toast({
          title: "エラー",
          description: errorMessage,
          variant: "destructive",
        })
        throw error
      }
    },
    onSuccess: (data) => {
      invalidateQueries.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] })
      })
      toast({
        title: "成功",
        description: `${tableName}データが正常に追加されました`,
      })
      if (onSuccess) {
        onSuccess(data)
      }
    },
    onError: (error) => {
      if (onError && error instanceof Error) {
        onError(error)
      }
    },
  })
}

// 汎用データ更新フック
export function useUpdateData<T = any>(
  tableName: string,
  options: {
    onSuccess?: (data: T[]) => void
    onError?: (error: Error) => void
    invalidateQueries?: string[]
    idField?: string
  } = {},
) {
  const { onSuccess, onError, invalidateQueries = [tableName], idField = "id" } = options
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<T> }) => {
      try {
        const updatedData = {
          ...data,
          updated_at: new Date().toISOString(),
        }
        const result = await updateClientData<T>(tableName, id, updatedData, { idField })
        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : `${tableName}データの更新に失敗しました`
        toast({
          title: "エラー",
          description: errorMessage,
          variant: "destructive",
        })
        throw error
      }
    },
    onSuccess: (data) => {
      invalidateQueries.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] })
      })
      toast({
        title: "成功",
        description: `${tableName}データが正常に更新されました`,
      })
      if (onSuccess) {
        onSuccess(data)
      }
    },
    onError: (error) => {
      if (onError && error instanceof Error) {
        onError(error)
      }
    },
  })
}

// 汎用データ削除フック
export function useDeleteData(
  tableName: string,
  options: {
    onSuccess?: (id: string) => void
    onError?: (error: Error) => void
    invalidateQueries?: string[]
    idField?: string
  } = {},
) {
  const { onSuccess, onError, invalidateQueries = [tableName], idField = "id" } = options
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await deleteClientData(tableName, id, { idField })
        return id
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : `${tableName}データの削除に失敗しました`
        toast({
          title: "エラー",
          description: errorMessage,
          variant: "destructive",
        })
        throw error
      }
    },
    onSuccess: (id) => {
      invalidateQueries.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] })
      })
      toast({
        title: "成功",
        description: `${tableName}データが正常に削除されました`,
      })
      if (onSuccess) {
        onSuccess(id)
      }
    },
    onError: (error) => {
      if (onError && error instanceof Error) {
        onError(error)
      }
    },
  })
}
