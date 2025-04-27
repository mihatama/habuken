"use client"

import { createContext, useContext, useEffect } from "react"
import type { ReactNode } from "react"
import { useAuthStore } from "@/stores/auth-store"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { AuthUser } from "@/types/models/user"

// 認証コンテキスト型
type AuthContextType = {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: loading, setUser, setLoading, signOut: clearUser } = useAuthStore()
  const supabase = createClientComponentClient()

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
          // 開発環境でのみモックユーザーを使用
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
            // 本番環境ではユーザーをnullに設定
            setUser(null)
          }
        }
      } catch (error) {
        console.error("セッション確認エラー:", error)
        // 開発環境でのみモックユーザーを使用
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
          // 本番環境ではユーザーをnullに設定
          setUser(null)
        }
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
        // 開発環境でのみモックユーザーを使用
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
          // 本番環境ではユーザーをnullに設定
          setUser(null)
        }
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
      await supabase.auth.signOut()
      clearUser()
      // 開発環境でのみモックユーザーを使用
      if (process.env.NODE_ENV === "development") {
        setTimeout(() => {
          const mockUser: AuthUser = {
            id: "1",
            email: "yamada@example.com",
            user_metadata: {
              full_name: "山田太郎",
              role: "admin",
            },
          }
          setUser(mockUser)
        }, 1000)
      }
    } catch (error) {
      console.error("サインアウトエラー:", error)
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
