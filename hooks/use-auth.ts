"use client"

import { useAuth as useAuthContext } from "../contexts/auth-context"
import { getClientSupabase } from "../lib/supabase-utils"

export function useAuth() {
  const { user, loading: isLoading, signOut } = useAuthContext()
  const supabase = getClientSupabase()

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await signOut()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  return {
    user,
    isLoading,
    login,
    logout,
  }
}
