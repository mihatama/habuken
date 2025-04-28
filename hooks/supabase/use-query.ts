import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"

// 型定義
type QueryOptions = {
  select?: string
  filters?: Record<string, any>
  order?: { column: string; ascending: boolean }
  limit?: number
  page?: number
  queryKey?: any[]
  enabled?: boolean
}

/**
 * Supabaseからデータを取得するカスタムフック
 */
export function useSupabaseQuery(
  tableName: string,
  options: {
    select?: string
    filters?: Record<string, any>
    order?: { column: string; ascending: boolean }
    limit?: number
    enabled?: boolean
    queryKey?: any[]
  } = {},
) {
  const { select = "*", filters, order, limit, enabled = true, queryKey = [] } = options

  return useQuery({
    queryKey: [tableName, ...queryKey, filters, order, limit],
    queryFn: async () => {
      const supabase = getSupabaseClient()
      let query = supabase.from(tableName).select(select)

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            query = query.eq(key, value)
          }
        })
      }

      if (order) {
        query = query.order(order.column, { ascending: order.ascending })
      }

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data
    },
    enabled,
  })
}

/**
 * Supabaseにデータを挿入するカスタムフック
 */
export function useSupabaseInsert<T>(tableName: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<T, "id" | "created_at" | "updated_at">) => {
      const supabase = getSupabaseClient()
      const { data: result, error } = await supabase
        .from(tableName)
        .insert({
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (error) {
        console.error(`Error inserting data into ${tableName}:`, error)
        throw error
      }

      return result[0] as T
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] })
      toast({
        title: "成功",
        description: "データを追加しました",
      })
    },
    onError: (error) => {
      console.error(`Error in useSupabaseInsert for ${tableName}:`, error)
      toast({
        title: "エラー",
        description: "データの追加に失敗しました",
        variant: "destructive",
      })
    },
  })
}

/**
 * Supabaseのデータを更新するカスタムフック
 */
export function useSupabaseUpdate<T>(tableName: string, idField = "id") {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<T> }) => {
      const supabase = getSupabaseClient()
      const { data: result, error } = await supabase
        .from(tableName)
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq(idField, id)
        .select()

      if (error) {
        console.error(`Error updating data in ${tableName}:`, error)
        throw error
      }

      return result[0] as T
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] })
      toast({
        title: "成功",
        description: "データを更新しました",
      })
    },
    onError: (error) => {
      console.error(`Error in useSupabaseUpdate for ${tableName}:`, error)
      toast({
        title: "エラー",
        description: "データの更新に失敗しました",
        variant: "destructive",
      })
    },
  })
}

/**
 * Supabaseのデータを削除するカスタムフック
 */
export function useSupabaseDelete(tableName: string, idField = "id") {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from(tableName).delete().eq(idField, id)

      if (error) {
        console.error(`Error deleting data from ${tableName}:`, error)
        throw error
      }

      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] })
      toast({
        title: "成功",
        description: "データを削除しました",
      })
    },
    onError: (error) => {
      console.error(`Error in useSupabaseDelete for ${tableName}:`, error)
      toast({
        title: "エラー",
        description: "データの削除に失敗しました",
        variant: "destructive",
      })
    },
  })
}
