"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { logWithTimestamp } from "@/lib/auth-debug"

export default function DashboardClientPage() {
  const { user, session, authDiagnostics } = useAuth()
  const [redirectInfo, setRedirectInfo] = useState<any>(null)
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    // ダッシュボードページがロードされたことをログに記録
    logWithTimestamp("DashboardClientPage: クライアントサイドレンダリング完了", {
      user: user?.email || "未ログイン",
      hasSession: !!session,
    })

    // セッションストレージからリダイレクト情報を取得
    try {
      const timestamp = sessionStorage.getItem("auth_redirect_timestamp")
      const redirectUser = sessionStorage.getItem("auth_redirect_user")
      const sessionExists = sessionStorage.getItem("auth_redirect_session_exists")

      if (timestamp && redirectUser) {
        const info = {
          timestamp,
          user: redirectUser,
          sessionExists,
          timeSinceRedirect: Date.now() - Number(timestamp),
        }
        setRedirectInfo(info)
        logWithTimestamp("リダイレクト情報を取得:", info)
      }
    } catch (e) {
      console.error("セッションストレージからの読み取りに失敗:", e)
    }

    // 認証診断情報を収集
    const diagnostics = authDiagnostics()
    logWithTimestamp("ダッシュボード: 認証診断情報", diagnostics)
  }, [user, session, authDiagnostics])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ダッシュボード</h1>

      {user ? (
        <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
          <p className="text-green-800">
            <strong>{user.email}</strong> としてログインしています
          </p>
          {session && (
            <p className="text-sm text-green-600">
              セッション有効期限: {new Date(session.expires_at! * 1000).toLocaleString()}
            </p>
          )}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
          <p className="text-yellow-800">ログインしていません</p>
        </div>
      )}

      {redirectInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
          <p className="text-blue-800">
            <strong>{redirectInfo.user}</strong> としてリダイレクトされました
          </p>
          <p className="text-sm text-blue-600">
            リダイレクト時刻: {new Date(Number(redirectInfo.timestamp)).toLocaleString()} (
            {Math.round(redirectInfo.timeSinceRedirect / 1000)}秒前)
          </p>
        </div>
      )}

      <button onClick={() => setShowDebug(!showDebug)} className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded mb-4">
        {showDebug ? "デバッグ情報を隠す" : "デバッグ情報を表示"}
      </button>

      {showDebug && (
        <div className="bg-gray-50 border border-gray-200 rounded p-4 overflow-auto max-h-96">
          <h2 className="text-lg font-semibold mb-2">デバッグ情報</h2>
          <pre className="text-xs">{JSON.stringify(authDiagnostics(), null, 2)}</pre>
        </div>
      )}

      {/* ダッシュボードの内容 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {/* ダッシュボードの内容はそのまま */}
      </div>
    </div>
  )
}
