"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import type { AuthUser } from "@/types/models/user"
import { getClientSupabase } from "@/lib/supabase-utils"
import type { Session } from "@supabase/supabase-js"

// 認証コンテキスト型
type AuthContextType = {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 開発環境用のモックユーザー
const MOCK_USER: AuthUser = {
  id: "1",
  email: "info@mihatama.com",
  user_metadata: {
    full_name: "管理者",
    role: "admin",
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getClientSupabase()

  // セッションからユーザー情報を設定する関数
  const setUserFromSession = (session: Session | null) => {
    if (session) {
      setUser({
        id: session.user.id,
        email: session.user.email || "",
        user_metadata: {
          full_name: session.user.user_metadata.full_name || "",
          role: session.user.user_metadata.role || "user",
        },
      })
      setSession(session)
    } else {
      setUser(null)
      setSession(null)
    }
  }

  // 初期化時に一度だけ実行
  useEffect(() => {
    // 認証状態を初期化
    const initAuth = async () => {
      try {
        setLoading(true)

        // 現在のセッションを取得
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          setUserFromSession(session)
        } else if (process.env.NODE_ENV === "development") {
          // 開発環境ではモックユーザーを使用（オプション）
          // setUser(MOCK_USER)
          // console.log("開発環境: モックユーザーを設定しました")
        } else {
          setUser(null)
          setSession(null)
        }
      } catch (error) {
        console.error("認証初期化エラー:", error)
        setUser(null)
        setSession(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserFromSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // サインイン関数
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)

      // 開発環境での特別なログイン処理（テスト用）
      if (process.env.NODE_ENV === "development" && email === "info@mihatama.com" && password === "gensuke") {
        console.log("開発環境: 管理者としてログインします")
        setUser(MOCK_USER)
        return { success: true }
      }

      console.log(`ログイン試行: ${email}`)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("認証エラー詳細:", error)
        throw error
      }

      console.log("ログイン成功:", data)
      setUserFromSession(data.session)
      return { success: true }
    } catch (error: any) {
      console.error("サインインエラー:", error)
      return {
        success: false,
        error: error.message || "ログインに失敗しました。認証情報を確認してください。",
      }
    } finally {
      setLoading(false)
    }
  }

  // サインアウト関数
  const signOut = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error("サインアウトエラー:", error)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
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
