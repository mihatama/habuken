"use client"

import { useEffect } from "react"
import { useAuthStore } from "../stores/auth-store"
import type { AuthUser } from "../types/models/user"
import { getClientSupabase } from "../lib/supabase-utils"

export function useAuth() {
  const { user, isLoading, setUser, setLoading, signOut } = useAuthStore()
  const supabase = getClientSupabase() // シングルトンインスタンスを使用

  useEffect(() => {
    // 初期ロード時に現在のセッションを確認
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session) {
          const userData: AuthUser = {
            id: session.user.id,
            email: session.user.email || "",
            user_metadata: {
              full_name: session.user.user_metadata.full_name || "",
              role: session.user.user_metadata.role || "user",
            },
          }
          setUser(userData)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("セッション確認エラー:", error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        const userData: AuthUser = {
          id: session.user.id,
          email: session.user.email || "",
          user_metadata: {
            full_name: session.user.user_metadata.full_name || "",
            role: session.user.user_metadata.role || "user",
          },
        }
        setUser(userData)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, setUser, setLoading])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      signOut()
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
