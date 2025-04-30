"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import type { AuthUser } from "../types/models/user"
import { getClientSupabase } from "../lib/supabase-utils"

// 認証コンテキスト型
type AuthContextType = {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 開発環境用のモックユーザー
const MOCK_USER: AuthUser = {
  id: "1",
  email: "yamada@example.com",
  user_metadata: {
    full_name: "山田太郎",
    role: "admin",
  },
}

// 認証状態を管理する単一のソース
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getClientSupabase()

  // 初期化時に一度だけ実行
  useEffect(() => {
    // 認証状態を初期化
    const initAuth = async () => {
      try {
        setLoading(true)

        // セッションを確認
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          // 実際のユーザー情報を設定
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            user_metadata: {
              full_name: session.user.user_metadata.full_name || "",
              role: session.user.user_metadata.role || "user",
            },
          })
        } else if (process.env.NODE_ENV === "development") {
          // 開発環境ではモックユーザーを使用
          setUser(MOCK_USER)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("認証初期化エラー:", error)
        if (process.env.NODE_ENV === "development") {
          setUser(MOCK_USER)
        } else {
          setUser(null)
        }
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // 認証状態の変更を監視（一度だけ設定）
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event)

      if (event === "SIGNED_IN" && session) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          user_metadata: {
            full_name: session.user.user_metadata.full_name || "",
            role: session.user.user_metadata.role || "user",
          },
        })
      } else if (event === "SIGNED_OUT") {
        if (process.env.NODE_ENV === "development") {
          // 開発環境では、ログアウト後にモックユーザーを設定
          // ただし、すぐには設定せず、少し遅延させる
          setTimeout(() => {
            setUser(MOCK_USER)
          }, 1000)
        } else {
          setUser(null)
        }
      }
      // その他のイベントは無視
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // サインアウト関数
  const signOut = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()

      // 開発環境では、すぐにnullに設定し、その後モックユーザーを設定
      if (process.env.NODE_ENV === "development") {
        setUser(null) // 一旦nullに設定
      } else {
        setUser(null)
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
