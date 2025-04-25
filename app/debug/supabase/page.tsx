"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { getClientSupabaseInstance } from "@/lib/supabase"
import { AlertCircle, CheckCircle, Info } from "lucide-react"

export default function SupabaseDebugPage() {
  const [supabaseStatus, setSupabaseStatus] = useState<"checking" | "ok" | "error">("checking")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [envVars, setEnvVars] = useState<{ [key: string]: string | undefined }>({})
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    // 環境変数の確認
    const checkEnvironmentVars = () => {
      const vars = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 5) + "...",
      }
      setEnvVars(vars)
    }

    // Supabase接続テスト
    const checkSupabase = async () => {
      try {
        const supabase = getClientSupabaseInstance()

        // セッション取得テスト
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Supabase connection error:", error)
          setSupabaseStatus("error")
          setErrorMessage(error.message)
        } else {
          console.log("Supabase connection successful")
          setSupabaseStatus("ok")
          setSessionInfo(data)
        }
      } catch (err) {
        console.error("Supabase check error:", err)
        setSupabaseStatus("error")
        setErrorMessage(err instanceof Error ? err.message : "不明なエラーが発生しました")
      }
    }

    checkEnvironmentVars()
    checkSupabase()
  }, [])

  const runConnectionTest = async () => {
    try {
      setTestResult(null)
      const supabase = getClientSupabaseInstance()

      // 簡単なクエリテスト
      const { data, error } = await supabase.from("profiles").select("count(*)", { count: "exact" }).limit(1)

      if (error) {
        setTestResult({
          success: false,
          message: `テスト失敗: ${error.message}`,
        })
      } else {
        setTestResult({
          success: true,
          message: `テスト成功: プロフィールテーブルに接続できました`,
        })
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: `テスト失敗: ${err instanceof Error ? err.message : "不明なエラー"}`,
      })
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Supabase接続診断</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>環境変数</CardTitle>
            <CardDescription>Supabase接続に必要な環境変数の状態</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">{key}</span>
                  <span className={value ? "text-green-600" : "text-red-600"}>{value ? value : "未設定"}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>接続状態</CardTitle>
            <CardDescription>Supabaseサービスへの接続状態</CardDescription>
          </CardHeader>
          <CardContent>
            {supabaseStatus === "checking" && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>確認中</AlertTitle>
                <AlertDescription>Supabase接続を確認しています...</AlertDescription>
              </Alert>
            )}

            {supabaseStatus === "ok" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">接続成功</AlertTitle>
                <AlertDescription>Supabaseサービスに正常に接続されています。</AlertDescription>
              </Alert>
            )}

            {supabaseStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>接続エラー</AlertTitle>
                <AlertDescription>{errorMessage || "Supabaseサービスとの接続に問題があります。"}</AlertDescription>
              </Alert>
            )}

            <div className="mt-4">
              <Button onClick={runConnectionTest}>接続テストを実行</Button>

              {testResult && (
                <Alert
                  className={`mt-4 ${testResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                >
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertTitle className={testResult.success ? "text-green-600" : "text-red-600"}>テスト結果</AlertTitle>
                  <AlertDescription>{testResult.message}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>セッション情報</CardTitle>
            <CardDescription>現在のセッション状態</CardDescription>
          </CardHeader>
          <CardContent>
            {sessionInfo ? (
              <div>
                <p className="mb-2">
                  <strong>セッション状態:</strong> {sessionInfo.session ? "アクティブ" : "なし"}
                </p>
                {sessionInfo.session && (
                  <div className="space-y-2">
                    <p>
                      <strong>ユーザーID:</strong> {sessionInfo.session.user.id}
                    </p>
                    <p>
                      <strong>メール:</strong> {sessionInfo.session.user.email}
                    </p>
                    <p>
                      <strong>最終更新:</strong> {new Date(sessionInfo.session.updated_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p>セッション情報を取得中...</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
