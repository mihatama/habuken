"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function SupabaseCleanup() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    console.log(`[Supabase] SupabaseCleanup: Path changed to ${pathname}`)

    // ページ遷移時のクリーンアップ処理
    return () => {
      console.log("[Supabase] SupabaseCleanup: Cleaning up before navigation")

      // ページ遷移時にGoTrueClientのリスナーをクリーンアップ
      if (typeof window !== "undefined" && window.__SUPABASE_CLIENT__) {
        try {
          // 必要に応じて追加のクリーンアップ処理を行う
          // 例: window.__SUPABASE_CLIENT__.auth.stopAutoRefresh()
        } catch (error) {
          console.error("[Supabase] Error during cleanup:", error)
        }
      }
    }
  }, [pathname, searchParams])

  return null
}
