"use client"

import { createContext, useContext } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import type { ReactNode } from "react"
import { getClientSupabaseInstance } from "@/lib/supabase"

// シンプル化したAuthContextType
type AuthContextType = {
  supabase: SupabaseClient<Database>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = getClientSupabaseInstance()

  // シンプル化したvalueオブジェクト
  const value = {
    supabase,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
