"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "./supabase-provider"

// 認証状態の型定義
type AuthState = {
  user: any | null
  isLoading: boolean
  error: Error | null
}

// 認証コンテキストの型定義
type AuthContextType = {
  authState: AuthState
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: any) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

// 認証コンテキストの作成
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 認証プロバイダーコンポーネント
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useSupabase()
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  })

  // 初期セッションの読み込み
  useEffect(() => {
    if (!supabase) return

    console.log("[Supabase Debug] AuthProvider: Loading session")

    const loadSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setAuthState((prev) => ({
          ...prev,
          user: session?.user || null,
          isLoading: false,
        }))
      } catch (error) {
        console.error("Error loading session:", error)
        setAuthState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
        }))
      }
    }

    loadSession()

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[Supabase Debug] AuthProvider: Auth state changed: ${event}`)
      setAuthState((prev) => ({
        ...prev,
        user: session?.user || null,
        isLoading: false,
      }))
    })

    // クリーンアップ関数
    return () => {
      console.log("[Supabase Debug] AuthProvider: Unsubscribing from auth state changes")
      subscription.unsubscribe()
    }
  }, [supabase])

  // サインイン関数
  const signIn = async (email: string, password: string) => {
    if (!supabase) return

    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push("/dashboard")
    } catch (error) {
      console.error("Sign in error:", error)
      setAuthState((prev) => ({
        ...prev,
        error: error as Error,
        isLoading: false,
      }))
    }
  }

  // サインアップ関数
  const signUp = async (email: string, password: string, userData: any) => {
    if (!supabase) return

    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      })
      if (error) throw error
      router.push("/dashboard")
    } catch (error) {
      console.error("Sign up error:", error)
      setAuthState((prev) => ({
        ...prev,
        error: error as Error,
        isLoading: false,
      }))
    }
  }

  // サインアウト関数
  const signOut = async () => {
    if (!supabase) return

    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push("/login")
    } catch (error) {
      console.error("Sign out error:", error)
      setAuthState((prev) => ({
        ...prev,
        error: error as Error,
        isLoading: false,
      }))
    }
  }

  // パスワードリセット関数
  const resetPassword = async (email: string) => {
    if (!supabase) return

    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
    } catch (error) {
      console.error("Reset password error:", error)
      setAuthState((prev) => ({
        ...prev,
        error: error as Error,
        isLoading: false,
      }))
    } finally {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  return (
    <AuthContext.Provider value={{ authState, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

// 認証コンテキストを使用するためのフック
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
