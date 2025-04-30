"use client"

import { createContext, useContext, useEffect, useRef } from "react"
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
  const isProcessingAuth = useRef(false) // 認証処理中フラグ

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

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    // 初期ロード時に現在のセッションを確認
    const checkSession = async () => {
      if (isProcessingAuth.current) return
      isProcessingAuth.current = true

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session && isMounted) {
          const userData: AuthUser = {
            id: session.user.id,
            email: session.user.email || "",
            user_metadata: {
              full_name: session.user.user_metadata.full_name || "",
              role: session.user.user_metadata.role || "user",
            },
          }
          setUser(userData)
        } else if (isMounted) {
          setMockUserIfDevelopment()
        }
      } catch (error) {
        console.error("セッション確認エラー:", error)
        if (isMounted) {
          setMockUserIfDevelopment()
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
        isProcessingAuth.current = false
      }
    }

    checkSession()

    // 認証状態の変更を監視（一度だけ設定）
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // 既に処理中の場合は無視
      if (isProcessingAuth.current) return
      isProcessingAuth.current = true

      console.log("Auth state changed:", event)

      if (session && isMounted) {
        const userData: AuthUser = {
          id: session.user.id,
          email: session.user.email || "",
          user_metadata: {
            full_name: session.user.user_metadata.full_name || "",
            role: session.user.user_metadata.role || "user",
          },
        }
        setUser(userData)
      } else if (isMounted && event === "SIGNED_OUT") {
        // 明示的なサインアウトイベントの場合のみnullに設定
        if (process.env.NODE_ENV === "development") {
          // 開発環境ではモックユーザーを設定
          setTimeout(() => {
            if (isMounted) {
              setMockUserIfDevelopment()
            }
            isProcessingAuth.current = false
          }, 500)
        } else {
          setUser(null)
          isProcessingAuth.current = false
        }
      } else {
        isProcessingAuth.current = false
      }

      if (isMounted) {
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase, setUser, setLoading])

  // サインアウト関数
  const signOut = async () => {
    if (isProcessingAuth.current) return
    isProcessingAuth.current = true

    try {
      setLoading(true)
      await supabase.auth.signOut()
      clearUser()

      // 開発環境でのみモックユーザーを使用
      if (process.env.NODE_ENV === "development") {
        // モックユーザーを設定する前に少し待機
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setMockUserIfDevelopment()
      }
    } catch (error) {
      console.error("サインアウトエラー:", error)
    } finally {
      setLoading(false)
      isProcessingAuth.current = false
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
