import { useQuery } from "@tanstack/react-query"
import { getSupabaseClient } from "@/lib/supabase/supabaseClient"

// スタッフの型定義
export type Staff = {
  id: string
  full_name: string
  position?: string
  phone?: string
  email?: string
  department?: string
  hire_date?: string
  status: "active" | "inactive" | "on_leave"
  created_at: string
  updated_at: string
}

// 重機の型定義
export type HeavyMachinery = {
  id: string
  name: string
  type?: string
  model?: string
  manufacturer?: string
  year?: number
  ownership_type: "owned" | "rented" | "leased"
  location?: string
  status: "available" | "in_use" | "maintenance" | "retired"
  last_maintenance_date?: string
  next_maintenance_date?: string
  created_at: string
  updated_at: string
}

// 重機入力の型定義
export type HeavyMachineryInput = Omit<HeavyMachinery, "id" | "created_at" | "updated_at">

// 車両の型定義
export type Vehicle = {
  id: string
  name: string
  type?: string
  model?: string
  manufacturer?: string
  year?: number
  license_plate?: string
  ownership_type: "owned" | "rented" | "leased"
  location?: string
  status: "available" | "in_use" | "maintenance" | "retired"
  last_maintenance_date?: string
  next_maintenance_date?: string
  created_at: string
  updated_at: string
}

// 備品の型定義
export type Tool = {
  id: string
  name: string
  type?: string
  model?: string
  manufacturer?: string
  purchase_date?: string
  storage_location?: string
  condition: "excellent" | "good" | "fair" | "poor"
  status: "available" | "in_use" | "maintenance" | "retired"
  last_maintenance_date?: string
  next_maintenance_date?: string
  created_at: string
  updated_at: string
}

/**
 * スタッフ一覧を取得するカスタムフック
 */
export function useStaff(
  options: {
    filters?: Record<string, any>
    enabled?: boolean
  } = {},
) {
  const { filters } = options

  return useQuery({
    queryKey: ["staff", filters],
    queryFn: async () => {
      const supabase = getSupabaseClient()
      let query = supabase.from("staff").select("*")

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            query = query.eq(key, value)
          }
        })
      }

      query = query.order("full_name", { ascending: true })

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data
    },
    ...options,
  })
}

/**
 * 重機一覧を取得するカスタムフック
 */
export function useHeavyMachinery(
  options: {
    filters?: Record<string, any>
    enabled?: boolean
  } = {},
) {
  const { filters } = options

  return useQuery({
    queryKey: ["heavyMachinery", filters],
    queryFn: async () => {
      const supabase = getSupabaseClient()
      let query = supabase.from("heavy_machinery").select("*")

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            query = query.eq(key, value)
          }
        })
      }

      query = query.order("name", { ascending: true })

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data
    },
    ...options,
  })
}

/**
 * 車両一覧を取得するカスタムフック
 */
export function useVehicles(
  options: {
    filters?: Record<string, any>
    enabled?: boolean
  } = {},
) {
  const { filters } = options

  return useQuery({
    queryKey: ["vehicles", filters],
    queryFn: async () => {
      const supabase = getSupabaseClient()
      let query = supabase.from("vehicles").select("*")

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            query = query.eq(key, value)
          }
        })
      }

      query = query.order("name", { ascending: true })

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data
    },
    ...options,
  })
}

/**
 * 備品一覧を取得するカスタムフック
 */
export function useTools(
  options: {
    filters?: Record<string, any>
    enabled?: boolean
  } = {},
) {
  const { filters } = options

  return useQuery({
    queryKey: ["tools", filters],
    queryFn: async () => {
      const supabase = getSupabaseClient()
      let query = supabase.from("tools").select("*")

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            query = query.eq(key, value)
          }
        })
      }

      query = query.order("name", { ascending: true })

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data
    },
    ...options,
  })
}
