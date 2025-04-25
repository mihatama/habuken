"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Info, RefreshCw } from "lucide-react"

export default function SupabaseDebugPage() {
  const { supabase, user, refreshSession } = useAuth()
  const [sessionData, setSessionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "ok" | "error">("checking")
  const [redirectHistory, setRedirectHistory] = useState<string[]>([])

  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true)
        setError(null)

        // セッション情報を取得
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          setError(error.message)
          setConnectionStatus("error")
        } else {
          setSessionData(data)
          setConnectionStatus("ok")

          // リダイレクト履歴に追加
          if (data.session) {
            setRedirectHistory((prev) => [...prev, `セッション検出: ${data.session.user.email}`])
          } else {
            setRedirectHistory((prev) => [...prev, "セッションなし"])
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "不明なエラーが発生しました")
        setConnectionStatus("error")
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [supabase])

  // セッション更新
  const handleRefreshSession = async () => {
    try {
      setLoading(true)
      await refreshSession()

      // セッション情報を再取得
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        setError(error.message)
      } else {
        setSessionData(data)
        setRedirectHistory((prev) => [...prev, "セッション更新: " + (data.session ? "成功" : "セッションなし")])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  // ストレージクリア
  const handleClearStorage = () => {
    localStorage.clear()
    sessionStorage.clear()
    setRedirectHistory((prev) => [...prev, "ストレージクリア実行"])
  }

  // 手動リダイレクト
  const handleRedirect = (path: string) => {
    setRedirectHistory((prev) => [...prev, `リダイレクト実行: ${path}`])
    window.location.href = path
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Supabaseデバッグページ</h1>

      {/* 接続状態 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>接続状態</CardTitle>
          <CardDescription>Supabaseとの接続状態を表示します</CardDescription>
        </CardHeader>
        <CardContent>
          {connectionStatus === "checking" && (
            <Alert>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <AlertTitle>確認中</AlertTitle>
              <AlertDescription>Supabaseとの接続を確認しています...</AlertDescription>
            </Alert>
          )}

          {connectionStatus === "ok" && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">接続成功</AlertTitle>
              <AlertDescription>Supabaseサービスに正常に接続されています。</AlertDescription>
            </Alert>
          )}

          {connectionStatus === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>接続エラー</AlertTitle>
              <AlertDescription>{error || "Supabaseとの接続に問題があります。"}</AlertDescription>
            </Alert>
          )}

          <div className="mt-4 flex gap-2">
            <Button onClick={handleRefreshSession} disabled={loading} size="sm">
              {loading ? "更新中..." : "接続を再確認"}
            </Button>
            <Button onClick={handleClearStorage} variant="outline" size="sm">
              ストレージクリア
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* セッション情報 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>セッション情報</CardTitle>
          <CardDescription>現在のセッション情報を表示します</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p>セッション情報を取得中...</p>
            </div>
          ) : sessionData?.session ? (
            <div className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-600">セッション有効</AlertTitle>
                <AlertDescription>ユーザー: {sessionData.session.user.email}</AlertDescription>
              </Alert>

              <div className="border rounded-md p-4 bg-gray-50">
                <h3 className="font-medium mb-2">セッション詳細</h3>
                <ul className="space-y-1 text-sm">
                  <li>
                    <span className="font-medium">ユーザーID:</span> {sessionData.session.user.id}
                  </li>
                  <li>
                    <span className="font-medium">メールアドレス:</span> {sessionData.session.user.email}
                  </li>
                  <li>
                    <span className="font-medium">有効期限:</span>{" "}
                    {new Date(sessionData.session.expires_at * 1000).toLocaleString()}
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>セッションなし</AlertTitle>
              <AlertDescription>現在アクティブなセッションがありません。ログインしてください。</AlertDescription>
            </Alert>
          )}

          <div className="mt-4 flex gap-2">
            <Button onClick={handleRefreshSession} size="sm">
              セッション更新
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ユーザー情報 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>ユーザー情報</CardTitle>
          <CardDescription>現在のユーザー情報を表示します</CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="border rounded-md p-4 bg-gray-50">
              <h3 className="font-medium mb-2">ユーザー詳細</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <span className="font-medium">ユーザーID:</span> {user.id}
                </li>
                <li>
                  <span className="font-medium">メールアドレス:</span> {user.email}
                </li>
                <li>
                  <span className="font-medium">最終更新日時:</span> {new Date(user.updated_at || "").toLocaleString()}
                </li>
              </ul>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>ユーザーなし</AlertTitle>
              <AlertDescription>現在ログインしているユーザーはいません。</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* リダイレクト履歴 */}
      {redirectHistory.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>リダイレクト履歴</CardTitle>
            <CardDescription>このページでのリダイレクト履歴を表示します</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-4 space-y-1 text-sm">
              {redirectHistory.map((entry, index) => (
                <li key={index}>{entry}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* ナビゲーション */}
      <Card>
        <CardHeader>
          <CardTitle>ナビゲーション</CardTitle>
          <CardDescription>各ページに手動でナビゲートします</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleRedirect("/dashboard")} variant="outline" size="sm">
              ダッシュボード
            </Button>
            <Button onClick={() => handleRedirect("/login")} variant="outline" size="sm">
              ログイン
            </Button>
            <Button onClick={() => handleRedirect("/")} variant="outline" size="sm">
              ホーム
            </Button>
            <Button onClick={() => handleRedirect("/profile")} variant="outline" size="sm">
              プロフィール
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
