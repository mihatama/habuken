import { useSupabaseQuery, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from "@/hooks/supabase/use-query"

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
  return useSupabaseQuery<Staff>("staff", {
    order: { column: "full_name", ascending: true },
    ...options,
    queryKey: ["staff", options.filters],
  })
}

/**
 * スタッフを追加するカスタムフック
 */
export function useAddStaff() {
  return useSupabaseInsert<Staff>("staff")
}

/**
 * スタッフを更新するカスタムフック
 */
export function useUpdateStaff() {
  return useSupabaseUpdate<Staff>("staff")
}

/**
 * スタッフを削除するカスタムフック
 */
export function useDeleteStaff() {
  return useSupabaseDelete("staff")
}
