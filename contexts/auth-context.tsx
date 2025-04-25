"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { SupabaseClient, User } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import type { ReactNode } from "react"
import { getClientSupabaseInstance } from "@/lib/supabase"
import { useRouter } from "next/navigation"

type UserRole = "admin" | "manager" | "staff" | "user"

type AuthContextType = {
  supabase: SupabaseClient<Database>
  user: User | null
  userRoles: UserRole[]
  isAdmin: boolean
  loading: boolean
  signIn: (idOrEmail: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = getClientSupabaseInstance()
  const [user, setUser] = useState<User | null>(null)
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // ユーザーのロールを取得する関数
  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId)

      if (error) {
        console.error("ロール取得エラー:", error)
        return []
      }

      return data.map((item) => item.role as UserRole)
    } catch (error) {
      console.error("ロール取得中のエラー:", error)
      return []
    }
  }

  // 初期化時にセッションをチェック
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true)
      try {
        // 現在のセッションを取得
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          setUser(session.user)
          const roles = await fetchUserRoles(session.user.id)
          setUserRoles(roles)
        } else {
          setUser(null)
          setUserRoles([])
        }
      } catch (error) {
        console.error("認証初期化エラー:", error)
        setUser(null)
        setUserRoles([])
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        const roles = await fetchUserRoles(session.user.id)
        setUserRoles(roles)
      } else {
        setUser(null)
        setUserRoles([])
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // ログイン関数
  const signIn = async (idOrEmail: string, password: string) => {
    try {
      // メールアドレスかどうかをチェック
      const isEmail = idOrEmail.includes("@")

      if (isEmail) {
        // メールアドレスでログイン（管理者用）
        const { data, error } = await supabase.auth.signInWithPassword({
          email: idOrEmail,
          password,
        })

        if (error) throw error
        return { success: true }
      } else {
        // ユーザーIDでログイン（一般ユーザー用）
        // まずユーザーIDからメールアドレスを取得
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("email")
          .eq("user_id", idOrEmail)
          .single()

        if (profileError) {
          return { success: false, error: "ユーザーIDが見つかりません" }
        }

        // 取得したメールアドレスでログイン
        const { data, error } = await supabase.auth.signInWithPassword({
          email: profileData.email,
          password,
        })

        if (error) throw error
        return { success: true }
      }
    } catch (error) {
      console.error("ログインエラー:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "ログインに失敗しました",
      }
    }
  }

  // ログアウト関数
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("ログアウトエラー:", error)
    }
  }

  const value = {
    supabase,
    user,
    userRoles,
    isAdmin: userRoles.includes("admin"),
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
