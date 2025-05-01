"use client"

import { useQuery } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { getToolsData } from "@/lib/supabase-utils"
import { useData } from "./supabase/use-data"

// スタッフ一覧を取得するフック
export function useStaff() {
  return useData("staff", {
    queryKey: ["staff"],
    order: { column: "full_name", ascending: true },
  })
}

// 重機一覧を取得するフック
export function useHeavyMachinery() {
  return useData("heavy_machinery", {
    queryKey: ["heavyMachinery"],
    order: { column: "name", ascending: true },
  })
}

// 車両一覧を取得するフック
export function useVehicles() {
  return useData("vehicles", {
    queryKey: ["vehicles"],
    order: { column: "name", ascending: true },
  })
}

// 備品一覧を取得するフック
export function useTools() {
  const { toast } = useToast()

  return useQuery({
    queryKey: ["tools"],
    queryFn: async () => {
      try {
        const { data } = await getToolsData({
          order: { column: "name", ascending: true },
        })
        return data
      } catch (error) {
        toast({
          title: "エラー",
          description: error instanceof Error ? error.message : "備品一覧の取得に失敗しました",
          variant: "destructive",
        })
        throw error
      }
    },
  })
}
