"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getSupabaseClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"

// 車両の型定義
export type Vehicle = {
  id: string
  name: string
  type?: string
  location?: string
  last_inspection_date?: string
  ownership_type: "自社保有" | "リース" | "その他"
  daily_rate: number | null
  weekly_rate: number | null
  monthly_rate: number | null
  created_at: string
  updated_at: string
}

// 車両入力の型定義
export type VehicleInput = Omit<Vehicle, "id" | "created_at" | "updated_at">

/**
 * 車両一覧を取得するカスタムフック
 */
export function useVehicles(options: { searchTerm?: string } = {}) {
  const { searchTerm } = options

  return useQuery({
    queryKey: ["vehicles", searchTerm],
    queryFn: async () => {
      const supabase = getSupabaseClient()
      let query = supabase.from("vehicles").select("*").order("name")

      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data || []
    },
  })
}

/**
 * 車両を追加するカスタムフック
 */
export function useAddVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (vehicleData: VehicleInput) => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from("vehicles")
        .insert({
          id: uuidv4(),
          ...vehicleData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (error) {
        throw error
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] })
    },
  })
}

/**
 * 車両を更新するカスタムフック
 */
export function useUpdateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<VehicleInput> }) => {
      const supabase = getSupabaseClient()
      const { data: result, error } = await supabase
        .from("vehicles")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()

      if (error) {
        throw error
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] })
    },
  })
}

/**
 * 車両を削除するカスタムフック
 */
export function useDeleteVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from("vehicles").delete().eq("id", id)

      if (error) {
        throw error
      }

      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] })
    },
  })
}
