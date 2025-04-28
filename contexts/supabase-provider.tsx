"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import { getBrowserSupabase } from "@/lib/supabase/browser-client"

// コンテキストの型定義
type SupabaseContextType = {
  supabase: SupabaseClient<Database> | null
}

// コンテキストの作成
const SupabaseContext = createContext<SupabaseContextType>({
  supabase: null,
})

// プロバイダーコンポーネント
export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  // 初期化時に一度だけSupabaseクライアントを取得
  const [supabase] = useState(() => {
    if (typeof window === "undefined") {
      return null
    }
    console.log("[Supabase] Initializing Supabase client in SupabaseProvider")
    return getBrowserSupabase()
  })

  useEffect(() => {
    console.log("[Supabase] SupabaseProvider mounted")
    return () => {
      console.log("[Supabase] SupabaseProvider unmounted")
    }
  }, [])

  return <SupabaseContext.Provider value={{ supabase }}>{children}</SupabaseContext.Provider>
}

// カスタムフック
export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider")
  }
  return context.supabase
}
