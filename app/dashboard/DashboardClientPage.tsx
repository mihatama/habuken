"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { logWithTimestamp } from "@/lib/auth-debug"
import DirectAccess from "./direct-access"

export default function DashboardClientPage() {
  const { user, session, loading } = useAuth()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showDirectAccess, setShowDirectAccess] = useState(false)

  useEffect(() => {
    // クライアントサイドでのログ
    logWithTimestamp("DashboardClientPage: マウント", {
      user: user?.email || "未ログイン",
      hasSession: !!session,
      loading,
    })

    // 認証状態を確認
    if (!loading) {
      if (user && session) {
        setIsAuthenticated(true)
        logWithTimestamp("DashboardClientPage: 認証済みユーザー", {
          email: user.email,
          id: user.id,
        })
      } else {
        setIsAuthenticated(false)
        logWithTimestamp("DashboardClientPage: 未認証ユーザー")

        // 3秒後に直接アクセスコンポーネントを表示
        const timer = setTimeout(() => {
          setShowDirectAccess(true)
        }, 3000)

        return () => clearTimeout(timer)
      }
    }
  }, [user, session, loading])

  if (loading) {
    return <div className="p-8 text-center">認証状態を確認中...</div>
  }

  if (!isAuthenticated) {
    if (showDirectAccess) {
      return <DirectAccess />
    }
    return <div className="p-8 text-center">認証されていません。ログインページにリダイレクトします...</div>
  }

  // 以下は既存のダッシュボードコンテンツ
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">ダッシュボード</h1>
      <p>ようこそ、{user?.email}さん！</p>
      {/* ダッシュボードの残りのコンテンツ */}
    </div>
  )
}
