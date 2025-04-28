import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getSupabaseClient } from "../../lib/supabase"

/**
 * Supabaseからデータを取得するカスタムフック
 */
export function useSupabaseQuery<T = any>(
  tableName: string,
  options: {
    select?: string
    filters?: Record<string, any>
    order?: { column: string; ascending: boolean }
    enabled?: boolean
    queryKey?: any[]
  } = {},
) {
  const { select = "*", filters, order, enabled = true, queryKey = [tableName] } = options

  return useQuery({
    queryKey,
    queryFn: async () => {
      const supabase = getSupabaseClient()
      let query = supabase.from(tableName).select(select)

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value)
          }
        })
      }

      if (order) {
        query = query.order(order.column, { ascending: order.ascending })
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data as T[]
    },
    enabled,
  })
}

/**
 * Supabaseにデータを挿入するカスタムフック
 */
export function useSupabaseInsert<T = any>(tableName: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<T>) => {
      const supabase = getSupabaseClient()
      const { data: result, error } = await supabase.from(tableName).insert(data).select()

      if (error) {
        throw error
      }

      return result[0] as T
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] })
    },
  })
}

/**
 * Supabaseのデータを更新するカスタムフック
 */
export function useSupabaseUpdate<T = any>(tableName: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<T> }) => {
      const supabase = getSupabaseClient()
      const { data: result, error } = await supabase.from(tableName).update(data).eq("id", id).select()

      if (error) {
        throw error
      }

      return result[0] as T
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] })
    },
  })
}

/**
 * Supabaseのデータを削除するカスタムフック
 */
export function useSupabaseDelete(tableName: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from(tableName).delete().eq("id", id)

      if (error) {
        throw error
      }

      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] })
    },
  })
}
