"use client"

import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"

// 簡略化された認証コンテキスト型
type AuthContextType = {
  user: any | null
  loading: boolean
  signOut: () => void
}

// モックユーザーデータ
const MOCK_USER = {
  id: "1",
  email: "yamada@example.com",
  user_metadata: {
    full_name: "山田太郎",
    role: "admin",
  },
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  // コンポーネントマウント時にモックユーザーを設定
  useEffect(() => {
    // モックユーザーをセット
    setTimeout(() => {
      setUser(MOCK_USER)
      setLoading(false)
    }, 500) // 読み込み感を出すために少し遅延
  }, [])

  // 簡略化されたサインアウト関数
  const signOut = () => {
    setUser(null)
    // 実際のアプリではここでリダイレクトなどの処理を行う
    console.log("サインアウト処理（モック）")
    // すぐにサインインし直す（デモ用）
    setTimeout(() => {
      setUser(MOCK_USER)
    }, 1000)
  }

  const value = {
    user,
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
