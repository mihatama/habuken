"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { SupabaseClient, User } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import type { ReactNode } from "react"
import type { AuthError } from "@supabase/supabase-js"

// パスワード強度チェック用の正規表現
const PASSWORD_REGEX = {
  minLength: /.{8,}/,
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/,
}

export type PasswordStrength = {
  isValid: boolean
  errors: string[]
}

type AuthContextType = {
  user: User | null
  supabase: SupabaseClient<Database>
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)

      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null)
      })

      return () => {
        authListener.subscription.unsubscribe()
      }
    }

    getUser()
  }, [supabase.auth])

  const checkPasswordStrength = (password: string): PasswordStrength => {
    const errors: string[] = []

    if (!PASSWORD_REGEX.minLength.test(password)) {
      errors.push("パスワードは8文字以上である必要があります")
    }

    if (!PASSWORD_REGEX.hasUpperCase.test(password)) {
      errors.push("大文字を含める必要があります")
    }

    if (!PASSWORD_REGEX.hasLowerCase.test(password)) {
      errors.push("小文字を含める必要があります")
    }

    if (!PASSWORD_REGEX.hasNumber.test(password)) {
      errors.push("数字を含める必要があります")
    }

    if (!PASSWORD_REGEX.hasSpecialChar.test(password)) {
      errors.push("特殊文字を含める必要があります")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  const signUp = async (email: string, password: string, metadata?: { full_name?: string }) => {
    try {
      if (!supabase) {
        return {
          error: {
            message: "Supabase環境変数が設定されていないため、サインアップできません。",
          } as AuthError,
          data: null,
        }
      }

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
        },
      })
      console.log("Sign up result:", result)
      return result
    } catch (err) {
      console.error("Sign up error:", err)
      return { error: err as AuthError, data: null }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in with:", email)

      // Supabaseクライアントが存在しない場合はエラーを返す
      if (!supabase) {
        console.error("Supabaseクライアントが初期化されていません")
        return {
          error: {
            message: "Supabase環境変数が設定されていないため、認証できません。",
          } as AuthError,
          data: null,
        }
      }

      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      console.log("Sign in result:", result)

      // セッションを即時更新
      // if (result.data.session) {
      //   setSession(result.data.session)
      //   setUser(result.data.user)
      // }

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
      if (!supabase) {
        return {
          error: {
            message: "Supabase環境変数が設定されていないため、パスワードリセットできません。",
          } as AuthError,
          data: null,
        }
      }

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
    supabase,
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
