"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import type { AuthUser } from "@/types/models/user"
import { getClientSupabase } from "@/lib/supabase-client-browser"
import type { Session } from "@supabase/supabase-js"
import { useRouter, usePathname } from "next/navigation"

// 認証コンテキスト型
type AuthContextType = {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshUserData: () => Promise<void> // 新しい関数を追加
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const supabase = getClientSupabase()
  const router = useRouter()
  const pathname = usePathname()

  // デバッグ用のログ
  useEffect(() => {
    console.log("認証状態:", { user, loading, pathname })
    if (user) {
      console.log("ユーザーメタデータ:", user.user_metadata)
    }
  }, [user, loading, pathname])

  // 認証状態に基づいてリダイレクト
  useEffect(() => {
    if (!loading && !isRedirecting) {
      // ログイン済みでログインページにいる場合はダッシュボードに即時リダイレクト
      if (user && (pathname === "/login" || pathname === "/signup" || pathname === "/")) {
        console.log("認証済みユーザーがログインページにいます。即時リダイレクトします。")
        setIsRedirecting(true)
        // replace: true を使用して履歴にログインページを残さないようにする
        router.replace("/dashboard")
      }
    }
  }, [user, loading, pathname, router, isRedirecting])

  // ユーザーデータを最新の状態に更新する関数
  const refreshUserData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const userData = {
            id: user.id,
            email: user.email || "",
            user_metadata: {
              full_name: user.user_metadata.full_name || "",
              role: user.user_metadata.role || "user",
            },
          }
          console.log("ユーザーデータを更新:", userData)
          setUser(userData)
          setSession(session)
        }
      }
    } catch (error) {
      console.error("ユーザーデータ更新エラー:", error)
    }
  }

  // セッションからユーザー情報を設定する関数
  const setUserFromSession = (session: Session | null) => {
    if (session) {
      const userData = {
        id: session.user.id,
        email: session.user.email || "",
        user_metadata: {
          full_name: session.user.user_metadata.full_name || "",
          role: session.user.user_metadata.role || "user",
        },
      }
      console.log("セッションからユーザー情報を設定:", userData)
      console.log("メタデータ詳細:", session.user.user_metadata)
      setUser(userData)
      setSession(session)
    } else {
      console.log("セッションなし、ユーザー情報をクリア")
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
        console.log("認証状態を初期化中...")

        // 現在のセッションを取得
        const {
          data: { session },
        } = await supabase.auth.getSession()

        console.log("セッション取得結果:", !!session)
        if (session) {
          console.log("セッションユーザー:", session.user)
          console.log("セッションメタデータ:", session.user.user_metadata)
        }
        setUserFromSession(session)
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
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("認証状態変更イベント:", event)
      if (session) {
        console.log("新しいセッションユーザー:", session.user)
        console.log("新しいセッションメタデータ:", session.user.user_metadata)

        // セッションの有効期限をチェック
        const expiresAt = session.expires_at
        const now = Math.floor(Date.now() / 1000)

        if (expiresAt && now > expiresAt - 300) {
          // 5分前に更新
          console.log("セッショントークンを更新します")
          supabase.auth.refreshSession()
        }
      }
      setUserFromSession(session)

      // ログイン成功時にリダイレクトフラグをリセット
      if (event === "SIGNED_IN") {
        setIsRedirecting(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // サインイン関数
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
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
      console.log("ユーザーメタデータ:", data.user.user_metadata)
      setUserFromSession(data.session)

      // ログイン成功後、即座にダッシュボードにリダイレクト（ローディングなし）
      console.log("ダッシュボードへ即時リダイレクトします")
      setIsRedirecting(true)
      setLoading(false)
      // replace: true を使用して履歴にログインページを残さないようにする
      router.replace("/dashboard")

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
      console.log("ログアウト処理開始")

      // すべてのデバイスからログアウト
      await supabase.auth.signOut({ scope: "global" })

      console.log("ログアウト成功")
      setUser(null)
      setSession(null)

      // セッションストレージをクリア
      if (typeof window !== "undefined") {
        window.sessionStorage.clear()
      }

      // ログアウト後、明示的にログインページにリダイレクト
      router.push("/login")
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
    refreshUserData, // 新しい関数を公開
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
