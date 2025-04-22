"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { Session, User, AuthError } from "@supabase/supabase-js"
import { getClientSupabaseInstance } from "@/lib/supabase"

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = getClientSupabaseInstance()

  useEffect(() => {
    // セッションの初期化
    const initializeSession = async () => {
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

    initializeSession()
  }, [])

  const signUp = async (email: string, password: string, metadata?: { full_name?: string }) => {
    try {
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
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      console.log("Sign in result:", result)
      return result
    } catch (err) {
      console.error("Sign in error:", err)
      return { error: err as AuthError, data: null }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error("Sign out error:", err)
    }
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
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
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
