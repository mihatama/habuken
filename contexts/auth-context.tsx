"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { SupabaseClient, User, Session } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import type { ReactNode } from "react"
import type { AuthError } from "@supabase/supabase-js"
import { getClientSupabaseInstance, checkSessionPersistence } from "@/lib/supabase/supabaseClient"
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
  session: Session | null
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
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getClientSupabaseInstance()
  const [lastAuthEvent, setLastAuthEvent] = useState<{ event: string; timestamp: number } | null>(null)

  // 認証診断情報を収集する関数
  const authDiagnostics = useCallback(() => {
    logWithTimestamp("認証診断情報の収集開始")

    const diagnostics = {
      user: user
        ? {
            id: user.id,
            email: user.email,
            lastSignInAt: user.last_sign_in_at,
          }
        : null,
      session: session
        ? {
            expires_at: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
            refresh_token: session.refresh_token ? "存在します" : "存在しません",
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
  }, [user, session, loading, lastAuthEvent])

  // セッションを更新する関数
  const refreshSession = useCallback(async () => {
    try {
      logWithTimestamp("セッション更新開始")
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("セッション更新エラー:", error)
        return
      }

      if (data.session) {
        logWithTimestamp("セッション更新成功:", data.session.user.email)
        setUser(data.session.user)
        setSession(data.session)
      } else {
        logWithTimestamp("セッション更新: セッションなし")
        setUser(null)
        setSession(null)
      }
    } catch (err) {
      console.error("セッション更新中の例外:", err)
    }
  }, [supabase.auth])

  // セッションの有効期限をチェックし、必要に応じて更新する
  const checkSessionExpiry = useCallback(() => {
    if (!session) return

    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0
    const now = Date.now()
    const timeUntilExpiry = expiresAt - now

    // セッションの有効期限が1時間未満の場合、更新を試みる
    if (timeUntilExpiry < 60 * 60 * 1000) {
      logWithTimestamp("セッションの有効期限が近いため更新を試みます", {
        expiresAt: new Date(expiresAt).toISOString(),
        timeUntilExpiry: Math.floor(timeUntilExpiry / 1000 / 60) + "分",
      })
      refreshSession()
    }
  }, [session, refreshSession])

  // 定期的にセッションの有効期限をチェック
  useEffect(() => {
    const interval = setInterval(checkSessionExpiry, 15 * 60 * 1000) // 15分ごとにチェック
    return () => clearInterval(interval)
  }, [checkSessionExpiry])

  useEffect(() => {
    const getUser = async () => {
      try {
        logWithTimestamp("AuthProvider: セッション取得開始")

        // まず永続化されたセッションの状態を確認
        const persistenceCheck = await checkSessionPersistence()
        logWithTimestamp("永続化されたセッション状態:", {
          hasSession: persistenceCheck.hasSession,
          user: persistenceCheck.user?.email || null,
        })

        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
        } else if (currentSession) {
          logWithTimestamp("AuthProvider: セッション取得成功", currentSession.user.email)
          logAuthEvent("INITIAL_SESSION", currentSession)

          setUser(currentSession.user)
          setSession(currentSession)
        } else {
          logWithTimestamp("AuthProvider: セッションなし")
        }

        setLoading(false)

        // セッション変更を監視
        const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
          logWithTimestamp(`Auth state changed: ${event}`, newSession?.user?.email)
          logAuthEvent(event, newSession)

          // 最後の認証イベントを記録
          setLastAuthEvent({
            event,
            timestamp: Date.now(),
          })

          // ユーザー状態とセッション状態を更新
          if (newSession) {
            setUser(newSession.user)
            setSession(newSession)
          } else if (event === "SIGNED_OUT") {
            setUser(null)
            setSession(null)
          }

          // セッション変更イベントをより詳細にログ
          if (event === "SIGNED_IN") {
            logWithTimestamp("ユーザーがサインインしました - セッション詳細:", {
              user_id: newSession?.user?.id,
              email: newSession?.user?.email,
              session_id: newSession?.access_token?.substring(0, 8) + "...",
              expires_at: newSession?.expires_at ? new Date(newSession.expires_at * 1000).toISOString() : "unknown",
            })

            // サインイン後にストレージの状態を確認
            setTimeout(() => {
              checkAuthStorage()
            }, 100)
          } else if (event === "SIGNED_OUT") {
            logWithTimestamp("ユーザーがサインアウトしました")
          } else if (event === "TOKEN_REFRESHED") {
            logWithTimestamp("トークンが更新されました", {
              expires_at: newSession?.expires_at ? new Date(newSession.expires_at * 1000).toISOString() : "unknown",
            })
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
        setSession(result.data.session)

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

      // ログアウト前のストレージ状態を確認
      checkAuthStorage()

      const result = await supabase.auth.signOut()

      // ログアウト後のストレージ状態を確認
      setTimeout(() => {
        checkAuthStorage()
      }, 100)

      logWithTimestamp("ログアウト完了", result)

      // 明示的にユーザーとセッションをクリア
      setUser(null)
      setSession(null)
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
    session,
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
