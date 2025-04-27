import { useSupabaseQuery, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from "@/hooks/supabase/use-query"

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
  return useSupabaseQuery<Tool>("resources", {
    filters: { type: "工具", ...options.filters },
    order: { column: "name", ascending: true },
    ...options,
    queryKey: ["tools", options.filters],
  })
}

/**
 * 工具を追加するカスタムフック
 */
export function useAddTool() {
  return useSupabaseInsert<Tool>("resources")
}

/**
 * 工具を更新するカスタムフック
 */
export function useUpdateTool() {
  return useSupabaseUpdate<Tool>("resources")
}

/**
 * 工具を削除するカスタムフック
 */
export function useDeleteTool() {
  return useSupabaseDelete("resources")
}
