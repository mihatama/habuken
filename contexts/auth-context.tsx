"use client"

import { createContext, useContext, useEffect } from "react"
import type { ReactNode } from "react"
import { useAuthStore } from "../stores/auth-store"
import type { AuthUser } from "../types/models/user"
import { getClientSupabase } from "../lib/supabase-utils"

// 認証コンテキスト型
type AuthContextType = {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: loading, setUser, setLoading, signOut: clearUser } = useAuthStore()
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
          setMockUserIfDevelopment()
        }
      } catch (error) {
        console.error("セッション確認エラー:", error)
        setMockUserIfDevelopment()
      } finally {
        setLoading(false)
      }
    }

    // 開発環境の場合にモックユーザーを設定する関数
    const setMockUserIfDevelopment = () => {
      if (process.env.NODE_ENV === "development") {
        const mockUser: AuthUser = {
          id: "1",
          email: "yamada@example.com",
          user_metadata: {
            full_name: "山田太郎",
            role: "admin",
          },
        }
        setUser(mockUser)
      } else {
        setUser(null)
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
        setMockUserIfDevelopment()
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, setUser, setLoading])

  // サインアウト関数
  const signOut = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      clearUser()

      // 開発環境でのみモックユーザーを使用（ログアウト後すぐに設定しない）
      if (process.env.NODE_ENV === "development") {
        // モックユーザーを設定する前に少し待機
        await new Promise((resolve) => setTimeout(resolve, 500))
        const mockUser: AuthUser = {
          id: "1",
          email: "yamada@example.com",
          user_metadata: {
            full_name: "山田太郎",
            role: "admin",
          },
        }
        setUser(mockUser)
      }
    } catch (error) {
      console.error("サインアウトエラー:", error)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    signOut,
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
