import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/use-toast"
import { fetchClientData, insertClientData, updateClientData, deleteClientData } from "@/lib/supabase-utils"

// Vehicle型定義を修正
export type Vehicle = {
  id: string
  vehicle_number: string // 変更: name → vehicle_number
  vehicle_type: string // 変更: type → vehicle_type
  manufacturer: string
  model: string
  year: number
  status: string
  next_inspection_date: string
  last_maintenance_date: string
  notes: string | null
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
  const { filters = {}, searchTerm, enabled = true } = options

  return useQuery({
    queryKey: ["vehicles", filters, searchTerm],
    queryFn: async () => {
      try {
        const { data } = await fetchClientData<Vehicle>("vehicles", {
          filters,
          order: { column: "display_order", ascending: true },
        })

        // useVehicles関数内のフィルタリング部分を修正
        if (searchTerm) {
          const lowercaseSearchTerm = searchTerm.toLowerCase()
          return data.filter(
            (vehicle) =>
              vehicle.vehicle_number
                .toLowerCase()
                .includes(lowercaseSearchTerm) || // 変更
              vehicle.vehicle_type.toLowerCase().includes(lowercaseSearchTerm) || // 変更
              vehicle.manufacturer.toLowerCase().includes(lowercaseSearchTerm),
          )
        }

        return data
      } catch (error) {
        throw error
      }
    },
    enabled,
  })
}

/**
 * 車両を追加するカスタムフック
 */
export function useAddVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: VehicleInput) => {
      try {
        const result = await insertClientData<Vehicle>("vehicles", data)
        return result
      } catch (error) {
        throw error
      }
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
      try {
        const updatedData = {
          ...data,
          updated_at: new Date().toISOString(),
        }
        const result = await updateClientData<Vehicle>("vehicles", id, updatedData)
        return result
      } catch (error) {
        throw error
      }
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
      try {
        await deleteClientData("vehicles", id)
        return id
      } catch (error) {
        throw error
      }
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
