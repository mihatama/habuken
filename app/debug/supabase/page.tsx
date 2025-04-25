"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"

export default function SupabaseDebugPage() {
  const { user, supabase } = useAuth()
  const [session, setSession] = useState<any>(null)
  const [envVars, setEnvVars] = useState<{ [key: string]: boolean }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking")
  const [redirectHistory, setRedirectHistory] = useState<string[]>([])
  const { toast } = useToast()

  // 環境変数のチェック
  useEffect(() => {
    const checkEnvVars = () => {
      setEnvVars({
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      })
    }

    checkEnvVars()
  }, [])

  // リダイレクト履歴の記録
  useEffect(() => {
    // ローカルストレージからリダイレクト履歴を取得
    const storedHistory = localStorage.getItem("redirectHistory")
    if (storedHistory) {
      setRedirectHistory(JSON.parse(storedHistory))
    }

    // 現在のURLを履歴に追加
    const now = new Date().toISOString()
    const currentUrl = window.location.href
    const newEntry = `${now}: ${currentUrl}`

    setRedirectHistory((prev) => {
      const updated = [newEntry, ...prev].slice(0, 10) // 最新10件のみ保持
      localStorage.setItem("redirectHistory", JSON.stringify(updated))
      return updated
    })
  }, [])

  // セッション情報の取得
  useEffect(() => {
    const getSessionInfo = async () => {
      setLoading(true)
      setError(null)
      try {
        console.log("デバッグページ: セッション情報取得開始")
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("セッション取得エラー:", error)
          setError(error.message)
          setConnectionStatus("error")
        } else {
          console.log("セッション取得成功:", data)
          setSession(data.session)
          setConnectionStatus("connected")
        }
      } catch (err) {
        console.error("セッション取得中の例外:", err)
        setError(err instanceof Error ? err.message : "不明なエラー")
        setConnectionStatus("error")
      } finally {
        setLoading(false)
      }
    }

    getSessionInfo()
  }, [supabase])

  // 手動でセッション情報を更新
  const refreshSession = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        setError(error.message)
      } else {
        setSession(data.session)
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラー")
    } finally {
      setLoading(false)
    }
  }

  // リダイレクト履歴をクリア
  const clearRedirectHistory = () => {
    localStorage.removeItem("redirectHistory")
    setRedirectHistory([])
  }

  // ログアウト処理
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast({
        title: "ログアウト成功",
        description: "正常にログアウトしました。",
      })
      // ページをリロード
      window.location.reload()
    } catch (error) {
      console.error("ログアウトエラー:", error)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Supabase接続診断</h1>

      <div className="grid gap-6">
        {/* 接続ステータス */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              接続ステータス
              <Badge variant={connectionStatus === "connected" ? "success" : "destructive"}>
                {connectionStatus === "checking"
                  ? "確認中..."
                  : connectionStatus === "connected"
                    ? "接続済み"
                    : "エラー"}
              </Badge>
            </CardTitle>
            <CardDescription>Supabaseサービスとの接続状態</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>読み込み中...</p>
            ) : error ? (
              <Alert variant="destructive">
                <AlertTitle>接続エラー</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <div>
                <p>Supabaseサービスに正常に接続されています。</p>
                {session && (
                  <div className="mt-4">
                    <h3 className="font-semibold">セッション情報:</h3>
                    <pre className="bg-muted p-4 rounded-md mt-2 overflow-auto max-h-60 text-xs">
                      {JSON.stringify(session, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={refreshSession} disabled={loading}>
              {loading ? "更新中..." : "セッション情報を更新"}
            </Button>
            {session && (
              <Button onClick={handleLogout} variant="destructive">
                ログアウト
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* リダイレクト履歴 */}
        <Card>
          <CardHeader>
            <CardTitle>リダイレクト履歴</CardTitle>
            <CardDescription>最近のリダイレクト履歴を表示します</CardDescription>
          </CardHeader>
          <CardContent>
            {redirectHistory.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {redirectHistory.map((entry, index) => (
                  <li key={index} className="border-b pb-1">
                    {entry}
                  </li>
                ))}
              </ul>
            ) : (
              <p>リダイレクト履歴はありません</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={clearRedirectHistory} variant="outline" size="sm">
              履歴をクリア
            </Button>
          </CardFooter>
        </Card>

        {/* 環境変数ステータス */}
        <Card>
          <CardHeader>
            <CardTitle>環境変数ステータス</CardTitle>
            <CardDescription>必要な環境変数が設定されているか確認します</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {Object.entries(envVars).length > 0 ? (
                Object.entries(envVars).map(([key, isSet]) => (
                  <li key={key} className="flex items-center justify-between">
                    <span>{key}</span>
                    <Badge variant={isSet ? "success" : "destructive"}>{isSet ? "設定済み" : "未設定"}</Badge>
                  </li>
                ))
              ) : (
                <li>環境変数情報を取得中...</li>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* ユーザー情報 */}
        <Card>
          <CardHeader>
            <CardTitle>ユーザー情報</CardTitle>
            <CardDescription>現在のユーザー情報</CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <div>
                <p>
                  <strong>メールアドレス:</strong> {user.email}
                </p>
                <p>
                  <strong>ユーザーID:</strong> {user.id}
                </p>
                <p>
                  <strong>最終ログイン:</strong> {new Date(user.last_sign_in_at || "").toLocaleString()}
                </p>
              </div>
            ) : (
              <p>ログインしていません</p>
            )}
          </CardContent>
        </Card>

        {/* 手動ナビゲーション */}
        <Card>
          <CardHeader>
            <CardTitle>手動ナビゲーション</CardTitle>
            <CardDescription>各ページに手動で移動します</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button onClick={() => (window.location.href = "/login")} className="w-full">
              ログインページ
            </Button>
            <Button onClick={() => (window.location.href = "/dashboard")} className="w-full">
              ダッシュボード
            </Button>
            <Button onClick={() => (window.location.href = "/")} className="w-full">
              ホーム
            </Button>
            <Button onClick={() => (window.location.href = "/debug")} className="w-full">
              デバッグページ
            </Button>
          </CardContent>
        </Card>

        {/* Cookieクリア */}
        <Card>
          <CardHeader>
            <CardTitle>Cookieとストレージ</CardTitle>
            <CardDescription>ブラウザのストレージをクリアします</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                localStorage.clear()
                sessionStorage.clear()
                alert(
                  "ローカルストレージとセッションストレージをクリアしました。Cookieはブラウザの設定から手動でクリアしてください。",
                )
              }}
              variant="destructive"
              className="w-full"
            >
              ストレージをクリア
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
