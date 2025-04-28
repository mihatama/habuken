"use client"

import { useEffect } from "react"
import { runTests } from "@/lib/supabase/test"

export function SupabaseTest() {
  useEffect(() => {
    // コンポーネントがマウントされたときにテストを実行
    runTests()
  }, [])

  return null
}
