"use client"

import { useQuery } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { fetchClientData } from "@/lib/supabase-utils"

// スタッフ一覧を取得するフック
export function useStaff() {
  const { toast } = useToast()

  return useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      try {
        const { data } = await fetchClientData("staff", {
          order: { column: "full_name", ascending: true },
        })
        return data
      } catch (error) {
        toast({
          title: "エラー",
          description: error instanceof Error ? error.message : "スタッフ一覧の取得に失敗しました",
          variant: "destructive",
        })
        throw error
      }
    },
  })
}

// 重機一覧を取得するフック
export function useHeavyMachinery() {
  const { toast } = useToast()

  return useQuery({
    queryKey: ["heavyMachinery"],
    queryFn: async () => {
      try {
        const { data } = await fetchClientData("heavy_machinery", {
          order: { column: "name", ascending: true },
        })
        return data
      } catch (error) {
        toast({
          title: "エラー",
          description: error instanceof Error ? error.message : "重機一覧の取得に失敗しました",
          variant: "destructive",
        })
        throw error
      }
    },
  })
}

// 車両一覧を取得するフック
export function useVehicles() {
  const { toast } = useToast()

  return useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      try {
        const { data } = await fetchClientData("vehicles", {
          order: { column: "name", ascending: true },
        })
        return data
      } catch (error) {
        toast({
          title: "エラー",
          description: error instanceof Error ? error.message : "車両一覧の取得に失敗しました",
          variant: "destructive",
        })
        throw error
      }
    },
  })
}

// 備品一覧を取得するフック
export function useTools() {
  const { toast } = useToast()

  return useQuery({
    queryKey: ["tools"],
    queryFn: async () => {
      try {
        const { data } = await fetchClientData("resources", {
          filters: { type: "工具" },
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
