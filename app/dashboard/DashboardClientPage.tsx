"use client"

import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { logWithTimestamp, checkAuthStorage } from "@/lib/auth-debug"

// 既存のDashboardClientPageコンポーネントを拡張
export default function DashboardClientPage() {
  const { user, loading, authDiagnostics } = useAuth()

  useEffect(() => {
    // ダッシュボードページがマウントされたときの認証状態を確認
    logWithTimestamp("DashboardClientPage mounted")
    logWithTimestamp("Auth state on dashboard:", {
      user: user ? `${user.email} (${user.id.substring(0, 8)}...)` : "null",
      loading,
    })

    // ストレージの状態を確認
    checkAuthStorage()

    // 詳細な診断情報を収集
    const diagnostics = authDiagnostics()
    logWithTimestamp("Dashboard diagnostics:", diagnostics)
  }, [user, loading, authDiagnostics])

  // ここに既存のダッシュボードコンポーネントの内容を追加
  return (
    <div>
      <h1>ダッシュボード</h1>
      <p>ユーザー: {user ? user.email : "ログインしていません"}</p>
      {/* 既存のダッシュボードコンテンツ */}
    </div>
  )
}
