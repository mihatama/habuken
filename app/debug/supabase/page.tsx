"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Info } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function SupabaseDebugPage() {
  const { supabase, user } = useAuth()
  const [sessionData, setSessionData] = useState<any>(null)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "ok" | "error">("checking")
  const [envVars, setEnvVars] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    // 環境変数のチェック
    const checkEnvVars = () => {
      const vars = {
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      }
      setEnvVars(vars)
    }

    // Supabase接続テスト
    const checkSupabaseConnection = async () => {
      try {
        setConnectionStatus("checking")
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Supabase connection error:", error)
          setSessionError(error.message)
          setConnectionStatus("error")
        } else {
          console.log("Supabase connection successful:", data)
          setSessionData(data)
          setConnectionStatus("ok")
        }
      } catch (err) {
        console.error("Supabase check error:", err)
        setSessionError(err instanceof Error ? err.message : "Unknown error")
        setConnectionStatus("error")
      }
    }

    checkEnvVars()
    checkSupabaseConnection()
  }, [supabase])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = "/login"
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const handleRefreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        setSessionError(error.message)
      } else {
        setSessionData(data)
        setSessionError(null)
      }
    } catch (err) {
      setSessionError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Supabase接続診断</h1>

      <div className="grid gap-6">
        {/* 環境変数ステータス */}
        <Card>
          <CardHeader>
            <CardTitle>環境変数ステータス</CardTitle>
            <CardDescription>Supabase接続に必要な環境変数の状態</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {Object.entries(envVars).map(([key, exists]) => (
                <li key={key} className="flex items-center">
                  {exists ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span>
                    {key}: {exists ? "設定済み" : "未設定"}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* 接続ステータス */}
        <Card>
          <CardHeader>
            <CardTitle>Supabase接続ステータス</CardTitle>
            <CardDescription>Supabaseサービスとの接続状態</CardDescription>
          </CardHeader>
          <CardContent>
            {connectionStatus === "checking" && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>確認中</AlertTitle>
                <AlertDescription>Supabase接続を確認しています...</AlertDescription>
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
                <AlertDescription>Supabaseサービスとの接続に問題があります: {sessionError}</AlertDescription>
              </Alert>
            )}

            <div className="mt-4">
              <Button onClick={handleRefreshSession}>接続を再確認</Button>
            </div>
          </CardContent>
        </Card>

        {/* セッション情報 */}
        <Card>
          <CardHeader>
            <CardTitle>セッション情報</CardTitle>
            <CardDescription>現在のSupabaseセッションの詳細</CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <div>
                <Alert className="bg-green-50 border-green-200 mb-4">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-600">ログイン済み</AlertTitle>
                  <AlertDescription>
                    ユーザー: {user.email} (ID: {user.id})
                  </AlertDescription>
                </Alert>

                <div className="mt-4 space-y-2">
                  <h3 className="font-medium">ユーザー情報:</h3>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{JSON.stringify(user, null, 2)}</pre>

                  <h3 className="font-medium mt-4">セッション情報:</h3>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(sessionData, null, 2)}
                  </pre>
                </div>

                <Button onClick={handleSignOut} variant="destructive" className="mt-4">
                  ログアウト
                </Button>
              </div>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>未ログイン</AlertTitle>
                <AlertDescription>
                  現在ログインしていません。
                  <a href="/login" className="underline ml-1">
                    ログインページへ
                  </a>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
