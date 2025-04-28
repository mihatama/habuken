import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/use-toast"
import { getClientSupabase } from "@/lib/supabase/client" // 絶対パスを使用

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

export type VehicleInput = Omit<Vehicle, "id" | "created_at" | "updated_at">

/**
 * 車両データを取得するカスタムフック
 */
export function useVehicles(
  options: {
    filters?: Record<string, any>
    enabled?: boolean
    searchTerm?: string
  } = {},
) {
  const { filters, searchTerm } = options

  return useQuery({
    queryKey: ["vehicles", filters, searchTerm],
    queryFn: async () => {
      const supabase = getClientSupabase()
      let query = supabase.from("vehicles").select("*")

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            query = query.eq(key, value)
          }
        })
      }

      query = query.order("created_at", { ascending: false })

      const { data, error } = await query

      if (error) {
        throw error
      }

      // 検索語句でフィルタリング（クライアント側）
      if (searchTerm) {
        const lowercaseSearchTerm = searchTerm.toLowerCase()
        return data.filter(
          (vehicle) =>
            vehicle.name.toLowerCase().includes(lowercaseSearchTerm) ||
            vehicle.type.toLowerCase().includes(lowercaseSearchTerm) ||
            vehicle.location.toLowerCase().includes(lowercaseSearchTerm),
        )
      }

      return data
    },
    ...options,
  })
}

/**
 * 車両を追加するカスタムフック
 */
export function useAddVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: VehicleInput) => {
      const supabase = getClientSupabase()
      const { data: result, error } = await supabase.from("vehicles").insert(data).select()

      if (error) {
        throw error
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] })
      toast({
        title: "成功",
        description: "車両を追加しました",
      })
    },
    onError: (error) => {
      console.error("車両追加エラー:", error)
      toast({
        title: "エラー",
        description: "車両の追加に失敗しました",
        variant: "destructive",
      })
    },
  })
}

/**
 * 車両を更新するカスタムフック
 */
export function useUpdateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Vehicle> }) => {
      const supabase = getClientSupabase()
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
      toast({
        title: "成功",
        description: "車両情報を更新しました",
      })
    },
    onError: (error) => {
      console.error("車両更新エラー:", error)
      toast({
        title: "エラー",
        description: "車両情報の更新に失敗しました",
        variant: "destructive",
      })
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
      const supabase = getClientSupabase()
      const { error } = await supabase.from("vehicles").delete().eq("id", id)

      if (error) {
        throw error
      }

      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] })
      toast({
        title: "成功",
        description: "車両を削除しました",
      })
    },
    onError: (error) => {
      console.error("車両削除エラー:", error)
      toast({
        title: "エラー",
        description: "車両の削除に失敗しました",
        variant: "destructive",
      })
    },
  })
}
