"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { Session, User, AuthError } from "@supabase/supabase-js"
import { getClientSupabaseInstance } from "@/lib/supabase"

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
  session: Session | null
  isLoading: boolean
  signUp: (
    email: string,
    password: string,
    metadata?: { full_name?: string },
  ) => Promise<{
    error: AuthError | null
    data: { user: User | null; session: Session | null } | null
  }>
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    error: AuthError | null
    data: { user: User | null; session: Session | null } | null
  }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{
    error: AuthError | null
    data: {} | null
  }>
  checkPasswordStrength: (password: string) => PasswordStrength
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [supabase, setSupabase] = useState<any>(null)

  // Supabaseクライアントの初期化
  useEffect(() => {
    try {
      const client = getClientSupabaseInstance()
      setSupabase(client)
    } catch (error) {
      console.error("Supabaseクライアントの初期化に失敗しました:", error)
    }
  }, [])

  useEffect(() => {
    // セッションの初期化
    const initializeSession = async () => {
      if (!supabase) return

      try {
        console.log("Initializing session...")
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Session initialization error:", error)
          setIsLoading(false)
          return
        }

        console.log("Session data:", data)
        setSession(data.session)
        setUser(data.session?.user || null)
        setIsLoading(false)

        // セッション変更のリスナーを設定
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          console.log("Auth state changed:", event, session?.user?.email)
          setSession(session)
          setUser(session?.user || null)
          setIsLoading(false)
        })

        return () => {
          authListener.subscription.unsubscribe()
        }
      } catch (err) {
        console.error("Error in session initialization:", err)
        setIsLoading(false)
      }
    }

    if (supabase) {
      initializeSession()
    }
  }, [supabase])

  // パスワード強度チェック
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
      if (result.data.session) {
        setSession(result.data.session)
        setUser(result.data.user)
      }

      return result
    } catch (err) {
      console.error("Sign in error:", err)
      return { error: err as AuthError, data: null }
    }
  }

  const signOut = async () => {
    try {
      if (!supabase) {
        console.error("Supabaseクライアントが初期化されていません")
        return
      }

      await supabase.auth.signOut()
      // セッションをクリア
      setSession(null)
      setUser(null)

      // ページをリロード
      window.location.href = "/login"
    } catch (err) {
      console.error("Sign out error:", err)
    }
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
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    checkPasswordStrength,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
