"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { SupabaseClient, User } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import type { ReactNode } from "react"
import type { AuthError } from "@supabase/supabase-js"
import { getClientSupabaseInstance } from "@/lib/supabase"
import { logWithTimestamp, logAuthEvent, checkAuthStorage } from "@/lib/auth-debug"

// パスワード強度チェック用の正規表現
const PASSWORD_REGEX = {
  minLength: /.{6,}/,
}

export type PasswordStrength = {
  isValid: boolean
  errors: string[]
}

// AuthContextType型
type AuthContextType = {
  user: User | null
  supabase: SupabaseClient<Database>
  loading: boolean
  signOut: () => Promise<void>
  signIn: (emailOrId: string, password: string) => Promise<any>
  signUp: (email: string, password: string, metadata?: { full_name?: string }) => Promise<any>
  resetPassword: (email: string) => Promise<any>
  refreshSession: () => Promise<void>
  authDiagnostics: () => any
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getClientSupabaseInstance()
  const [redirectInProgress, setRedirectInProgress] = useState(false)
  const [lastAuthEvent, setLastAuthEvent] = useState<{ event: string; timestamp: number } | null>(null)

  // 認証診断情報を収集する関数
  const authDiagnostics = () => {
    logWithTimestamp("認証診断情報の収集開始")

    const diagnostics = {
      user: user
        ? {
            id: user.id,
            email: user.email,
            lastSignInAt: user.last_sign_in_at,
          }
        : null,
      loading,
      lastAuthEvent,
      storage: checkAuthStorage(),
      url: typeof window !== "undefined" ? window.location.href : null,
      timestamp: new Date().toISOString(),
    }

    logWithTimestamp("認証診断情報:", diagnostics)
    return diagnostics
  }

  // セッションを更新する関数
  const refreshSession = async () => {
    try {
      logWithTimestamp("セッション更新開始")
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("セッション更新エラー:", error)
        return
      }

      logWithTimestamp("セッション更新成功:", data.session?.user?.email || "セッションなし")
      setUser(data.session?.user ?? null)
    } catch (err) {
      console.error("セッション更新中の例外:", err)
    }
  }

  useEffect(() => {
    const getUser = async () => {
      try {
        logWithTimestamp("AuthProvider: セッション取得開始")
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
        } else {
          logWithTimestamp("AuthProvider: セッション取得成功", session?.user?.email || "未ログイン")
          logAuthEvent("INITIAL_SESSION", session)
        }

        setUser(session?.user ?? null)
        setLoading(false)

        // セッション変更を監視
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          logWithTimestamp(`Auth state changed: ${event}`, session?.user?.email)
          logAuthEvent(event, session)

          // 最後の認証イベントを記録
          setLastAuthEvent({
            event,
            timestamp: Date.now(),
          })

          // ユーザー状態を更新
          setUser(session?.user ?? null)

          // セッション変更イベントをより詳細にログ
          if (event === "SIGNED_IN") {
            logWithTimestamp("ユーザーがサインインしました - セッション詳細:", {
              user_id: session?.user?.id,
              email: session?.user?.email,
              session_id: session?.access_token?.substring(0, 8) + "...",
              expires_at: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : "unknown",
            })

            // サインイン後にストレージの状態を確認
            setTimeout(() => {
              checkAuthStorage()
            }, 100)
          } else if (event === "SIGNED_OUT") {
            logWithTimestamp("ユーザーがサインアウトしました")
          } else if (event === "TOKEN_REFRESHED") {
            logWithTimestamp("トークンが更新されました")
          }
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

      logWithTimestamp("Signing up with:", email)
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })
      logWithTimestamp("Sign up result:", result)
      return result
    } catch (err) {
      console.error("Sign up error:", err)
      return { error: err as AuthError, data: null }
    }
  }

  // signIn関数
  const signIn = async (emailOrId: string, password: string) => {
    try {
      logWithTimestamp("Signing in with:", emailOrId)

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

      // サインイン前のストレージ状態を確認
      checkAuthStorage()

      // メールアドレスかIDかを判断
      const isEmail = emailOrId.includes("@")

      let result

      if (isEmail) {
        // メールアドレスでログイン
        logWithTimestamp("メールアドレスでログイン試行:", emailOrId)
        const startTime = Date.now()
        result = await supabase.auth.signInWithPassword({
          email: emailOrId,
          password,
        })
        const duration = Date.now() - startTime
        logWithTimestamp(`ログイン処理完了: ${duration}ms`)
      } else {
        // IDでログイン - まずプロフィールからメールアドレスを取得
        logWithTimestamp("ユーザーIDでログイン試行:", emailOrId)
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("email")
          .eq("user_id", emailOrId)
          .single()

        if (profileError || !profileData) {
          console.error("ユーザーID検索エラー:", profileError)
          return {
            error: {
              message: "ユーザーIDが見つかりません",
            } as AuthError,
            data: null,
          }
        }

        logWithTimestamp("ユーザーIDからメールアドレスを取得:", profileData.email)

        // 取得したメールアドレスでログイン
        const startTime = Date.now()
        result = await supabase.auth.signInWithPassword({
          email: profileData.email,
          password,
        })
        const duration = Date.now() - startTime
        logWithTimestamp(`ログイン処理完了: ${duration}ms`)
      }

      logWithTimestamp("Sign in result:", {
        user: result.data?.user?.email,
        error: result.error?.message,
        session: result.data?.session ? "存在します" : "存在しません",
      })

      // サインイン後のストレージ状態を確認
      setTimeout(() => {
        checkAuthStorage()
      }, 100)

      // エラーがある場合は詳細をログに出力
      if (result.error) {
        console.error("Supabase auth error:", result.error)
      }

      // セッションが存在する場合はユーザー状態を更新
      if (result.data.session) {
        setUser(result.data.user)
        // セッションが正しく設定されたことをログに出力
        logWithTimestamp("Session set successfully:", {
          user: result.data.user?.email,
          expires_at: result.data.session.expires_at
            ? new Date(result.data.session.expires_at * 1000).toISOString()
            : "unknown",
        })
      }

      return result
    } catch (err) {
      console.error("Sign in error:", err)
      return { error: err as AuthError, data: null }
    }
  }

  const signOut = async () => {
    try {
      logWithTimestamp("ログアウト開始")
      await supabase.auth.signOut()
      logWithTimestamp("ログアウト完了")
    } catch (error) {
      console.error("ログアウトエラー:", error)
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

  // AuthProviderのvalueオブジェクト
  const value = {
    user,
    supabase,
    loading,
    signOut,
    signIn,
    signUp,
    resetPassword,
    refreshSession,
    authDiagnostics,
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
