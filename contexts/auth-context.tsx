"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import type { ReactNode } from "react"
import type { AuthError } from "@supabase/supabase-js"
import { getClientSupabaseInstance } from "@/lib/supabase-client"

// パスワード強度チェック用の正規表現
const PASSWORD_REGEX = {
  minLength: /.{6,}/,
}

export type PasswordStrength = {
  isValid: boolean
  errors: string[]
}

type AuthContextType = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  signIn: (emailOrId: string, password: string) => Promise<any>
  signUp: (email: string, password: string, metadata?: { full_name?: string }) => Promise<any>
  resetPassword: (email: string) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getClientSupabaseInstance()

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
        }

        setUser(session?.user ?? null)
        setLoading(false)

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          console.log("Auth state changed:", event, session?.user?.email)
          setUser(session?.user ?? null)
        })

        return () => {
          authListener.subscription.unsubscribe()
        }
      } catch (err) {
        console.error("Error in getUser:", err)
        setLoading(false)
      }
    }

    getUser()
  }, [supabase.auth])

  // パスワード強度チェック関数
  const checkPasswordStrength = (password: string): PasswordStrength => {
    const errors: string[] = []

    if (!PASSWORD_REGEX.minLength.test(password)) {
      errors.push("パスワードは6文字以上である必要があります")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  const signUp = async (email: string, password: string, metadata?: { full_name?: string }) => {
    try {
      // パスワード強度チェック
      const passwordCheck = checkPasswordStrength(password)
      if (!passwordCheck.isValid) {
        return {
          error: {
            message: `パスワードが要件を満たしていません: ${passwordCheck.errors.join(", ")}`,
          } as AuthError,
          data: null,
        }
      }

      console.log("Signing up with:", email)
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })
      console.log("Sign up result:", result)
      return result
    } catch (err) {
      console.error("Sign up error:", err)
      return { error: err as AuthError, data: null }
    }
  }

  // signIn関数 - IDによるログインをサポート
  const signIn = async (emailOrId: string, password: string) => {
    try {
      console.log("Signing in with:", emailOrId)

      // メールアドレスかIDかを判断
      const isEmail = emailOrId.includes("@")

      let result

      if (isEmail) {
        // メールアドレスでログイン
        result = await supabase.auth.signInWithPassword({
          email: emailOrId,
          password,
        })
      } else {
        // IDでログイン - まずプロフィールからメールアドレスを取得
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("email")
          .eq("user_id", emailOrId)
          .single()

        if (profileError || !profileData) {
          return {
            error: {
              message: "ユーザーIDが見つかりません",
            } as AuthError,
            data: null,
          }
        }

        // 取得したメールアドレスでログイン
        result = await supabase.auth.signInWithPassword({
          email: profileData.email,
          password,
        })
      }

      console.log("Sign in result:", result)

      // エラーがある場合は詳細をログに出力
      if (result.error) {
        console.error("Supabase auth error:", result.error)
      }

      // セッションが存在する場合はユーザー状態を更新
      if (result.data.session) {
        setUser(result.data.user)
        // セッションが正しく設定されたことをログに出力
        console.log("Session set successfully:", result.data.session)
      }

      return result
    } catch (err) {
      console.error("Sign in error:", err)
      return { error: err as AuthError, data: null }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    try {
      return await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
    } catch (err) {
      console.error("Reset password error:", err)
      return { error: err as AuthError, data: null }
    }
  }

  const value = {
    user,
    loading,
    signOut,
    signIn,
    signUp,
    resetPassword,
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
