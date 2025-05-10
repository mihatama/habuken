"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { insertClientData, updateClientData, deleteClientData } from "@/lib/supabase-utils"
import { getClientSupabase } from "@/lib/supabase/supabaseClient"

// 汎用データ取得フック
export function useData(
  table: string,
  options: {
    queryKey?: any[]
    select?: string
    filters?: any[]
    order?: { column: string; ascending: boolean }
    enabled?: boolean
    onError?: (error: Error) => void
  } = {},
) {
  const { queryKey = [table], select = "*", filters = [], order, enabled = true, onError } = options

  const fetchDataFromTable = async (
    tableName: string,
    options: {
      select: string
      filters: any[]
      order?: { column: string; ascending: boolean }
    },
  ) => {
    const { select, filters, order } = options
    const supabase = getClientSupabase()
    let query = supabase.from(tableName).select(select)

    // フィルターを適用
    filters.forEach((filter) => {
      if (filter.operator === "eq") {
        query = query.eq(filter.column, filter.value)
      } else if (filter.operator === "in") {
        query = query.in(filter.column, filter.value)
      }
      // 他のフィルター条件も必要に応じて追加
    })

    // 並び順を適用
    if (order) {
      query = query.order(order.column, { ascending: order.ascending })
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data
  }

  // エラーハンドリングを強化
  const handleError = (error: any) => {
    console.error("API Error:", error)
    if (error.status === 406) {
      console.warn("Not Acceptable error. Check Accept headers and table structure.")
    }
    return { data: null, error }
  }

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const result = await fetchDataFromTable(table, {
          select,
          filters,
          order,
        })
        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : `${table}データの取得に失敗しました`
        const { toast } = useToast()
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
    staleTime: 1000, // 1秒間はキャッシュを新鮮と見なす（短くして頻繁に再取得）
    refetchOnWindowFocus: true, // ウィンドウにフォーカスが戻ったときに再取得
    refetchOnMount: true, // コンポーネントがマウントされたときに再取得
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
