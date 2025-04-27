import { useSupabaseQuery, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from "@/hooks/supabase/use-query"

export type Vehicle = {
  id: string
  name: string
  type: string
  location: string
  last_inspection_date: string | null
  ownership_type: "自社保有" | "リース" | "その他"
  daily_rate: number | null
  weekly_rate: number | null
  monthly_rate: number | null
  created_at: string
  updated_at: string
}

/**
 * 車両データを取得するカスタムフック
 */
export function useVehicles(
  options: {
    filters?: Record<string, any>
    enabled?: boolean
  } = {},
) {
  return useSupabaseQuery<Vehicle>("vehicles", {
    order: { column: "created_at", ascending: false },
    ...options,
    queryKey: ["vehicles", options.filters],
  })
}

/**
 * 車両を追加するカスタムフック
 */
export function useAddVehicle() {
  return useSupabaseInsert<Vehicle>("vehicles")
}

/**
 * 車両を更新するカスタムフック
 */
export function useUpdateVehicle() {
  return useSupabaseUpdate<Vehicle>("vehicles")
}

/**
 * 車両を削除するカスタムフック
 */
export function useDeleteVehicle() {
  return useSupabaseDelete("vehicles")
}
