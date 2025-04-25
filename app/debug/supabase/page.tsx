"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function SupabaseDebugPage() {
  const { user, supabase } = useAuth()
  const [session, setSession] = useState<any>(null)
  const [envVars, setEnvVars] = useState<{ [key: string]: boolean }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking")
  const [redirectTest, setRedirectTest] = useState<"not_tested" | "success" | "failed">("not_tested")

  // 環境変数のチェック
  useEffect(() => {
    const checkEnvVars = async () => {
      try {
        const response = await fetch("/api/debug/env-check")
        const data = await response.json()
        setEnvVars(data)
      } catch (err) {
        console.error("環境変数チェックエラー:", err)
        setEnvVars({
          NEXT_PUBLIC_SUPABASE_URL: false,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: false,
        })
      }
    }

    checkEnvVars()
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

  // リダイレクトテスト
  const testRedirect = () => {
    try {
      // 現在のURLを保存
      const currentUrl = window.location.href

      // ダッシュボードへリダイレクト
      window.location.href = "/dashboard"

      // 3秒後にチェック（リダイレクトが成功していれば実行されない）
      setTimeout(() => {
        if (window.location.href === currentUrl) {
          setRedirectTest("failed")
        }
      }, 3000)

      // 念のため成功状態に設定（リダイレクトが成功すれば見えない）
      setRedirectTest("success")
    } catch (error) {
      console.error("リダイレクトテストエラー:", error)
      setRedirectTest("failed")
    }
  }

  // 新しいSupabaseクライアントを作成してテスト
  const testNewClient = async () => {
    try {
      setLoading(true)
      const newClient = createClientComponentClient()
      const { data, error } = await newClient.auth.getSession()

      if (error) {
        setError(`新しいクライアントでのエラー: ${error.message}`)
      } else {
        alert(`新しいクライアントでのセッション: ${data.session ? "あり" : "なし"}`)
      }
    } catch (err) {
      setError(`新しいクライアントでの例外: ${err instanceof Error ? err.message : "不明なエラー"}`)
    } finally {
      setLoading(false)
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
            <Button onClick={testNewClient} variant="outline" disabled={loading}>
              新しいクライアントでテスト
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

        {/* リダイレクトテスト */}
        <Card>
          <CardHeader>
            <CardTitle>リダイレクトテスト</CardTitle>
            <CardDescription>ダッシュボードへのリダイレクトをテストします</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              ステータス:{" "}
              <Badge
                variant={
                  redirectTest === "not_tested" ? "outline" : redirectTest === "success" ? "success" : "destructive"
                }
              >
                {redirectTest === "not_tested" ? "未テスト" : redirectTest === "success" ? "成功" : "失敗"}
              </Badge>
            </p>
            <div className="mt-4">
              <Button onClick={testRedirect}>リダイレクトをテスト</Button>
            </div>
          </CardContent>
        </Card>

        {/* 手動リダイレクトオプション */}
        <Card>
          <CardHeader>
            <CardTitle>手動リダイレクト</CardTitle>
            <CardDescription>各種リダイレクト方法を試します</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">window.location.href</h3>
              <Button onClick={() => (window.location.href = "/dashboard")} className="w-full">
                window.location.href でリダイレクト
              </Button>
            </div>
            <div>
              <h3 className="font-semibold mb-2">window.location.replace</h3>
              <Button onClick={() => window.location.replace("/dashboard")} className="w-full">
                window.location.replace でリダイレクト
              </Button>
            </div>
            <div>
              <h3 className="font-semibold mb-2">直接リンク</h3>
              <a href="/dashboard" className="block w-full">
                <Button className="w-full">通常のリンクでリダイレクト</Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
