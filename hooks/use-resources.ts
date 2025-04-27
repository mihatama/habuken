"use client"

import { useQuery } from "@tanstack/react-query"
import { getStaff, getHeavyMachinery, getVehicles, getTools } from "@/actions/resources"
import { useToast } from "@/hooks/use-toast"

// スタッフ一覧を取得するフック
export function useStaff() {
  const { toast } = useToast()

  return useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const result = await getStaff()

      if (!result.success) {
        toast({
          title: "エラー",
          description: result.error || "スタッフ一覧の取得に失敗しました",
          variant: "destructive",
        })
        throw new Error(result.error)
      }

      return result.data
    },
  })
}

// 重機一覧を取得するフック
export function useHeavyMachinery() {
  const { toast } = useToast()

  return useQuery({
    queryKey: ["heavyMachinery"],
    queryFn: async () => {
      const result = await getHeavyMachinery()

      if (!result.success) {
        toast({
          title: "エラー",
          description: result.error || "重機一覧の取得に失敗しました",
          variant: "destructive",
        })
        throw new Error(result.error)
      }

      return result.data
    },
  })
}

// 車両一覧を取得するフック
export function useVehicles() {
  const { toast } = useToast()

  return useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const result = await getVehicles()

      if (!result.success) {
        toast({
          title: "エラー",
          description: result.error || "車両一覧の取得に失敗しました",
          variant: "destructive",
        })
        throw new Error(result.error)
      }

      return result.data
    },
  })
}

// 備品一覧を取得するフック
export function useTools() {
  const { toast } = useToast()

  return useQuery({
    queryKey: ["tools"],
    queryFn: async () => {
      const result = await getTools()

      if (!result.success) {
        toast({
          title: "エラー",
          description: result.error || "備品一覧の取得に失敗しました",
          variant: "destructive",
        })
        throw new Error(result.error)
      }

      return result.data
    },
  })
}
