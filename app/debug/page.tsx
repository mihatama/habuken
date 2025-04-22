"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { getClientSupabaseInstance } from "@/lib/supabase"
import { Info, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function DebugPage() {
  const [envVars, setEnvVars] = useState<Record<string, string | undefined>>({})
  const [supabaseStatus, setSupabaseStatus] = useState<"checking" | "success" | "error">("checking")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [connectionDetails, setConnectionDetails] = useState<string | null>(null)

  useEffect(() => {
    // 環境変数の確認
    const vars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? "設定済み（セキュリティのため値は表示しません）"
        : undefined,
      OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY
        ? "設定済み（セキュリティのため値は表示しません）"
        : undefined,
    }
    setEnvVars(vars)

    // Supabase接続テスト
    const testSupabaseConnection = async () => {
      try {
        const supabase = getClientSupabaseInstance()
        if (!supabase) {
          setSupabaseStatus("error")
          setErrorMessage("Supabaseクライアントの初期化に失敗しました。環境変数を確認してください。")
          return
        }

        // セッション取得テスト
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          setSupabaseStatus("error")
          setErrorMessage(`Supabase認証エラー: ${sessionError.message}`)
          return
        }

        // 簡単なデータベース接続テスト
        try {
          const { error: dbError } = await supabase.from("profiles").select("count", { count: "exact", head: true })

          if (dbError) {
            if (dbError.code === "PGRST116") {
              // テーブルが存在しないエラー - これは正常な場合もある
              setConnectionDetails(
                "データベース接続は成功しましたが、'profiles'テーブルが存在しないか、アクセス権がありません。",
              )
              setSupabaseStatus("success")
            } else {
              setSupabaseStatus("error")
              setErrorMessage(`データベース接続エラー: ${dbError.message}`)
            }
          } else {
            setConnectionDetails("Supabaseへの接続に成功し、データベースにアクセスできます。")
            setSupabaseStatus("success")
          }
        } catch (dbErr) {
          // データベースエラーがあっても認証は成功している可能性がある
          setConnectionDetails("認証サービスには接続できましたが、データベースへのアクセスに問題があります。")
          setSupabaseStatus("success")
        }
      } catch (err) {
        setSupabaseStatus("error")
        setErrorMessage(`予期せぬエラー: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    testSupabaseConnection()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">システム診断ページ</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>環境変数ステータス</CardTitle>
            <CardDescription>アプリケーションの環境変数の状態を確認します</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">{key}</span>
                  {value ? (
                    <span className="text-green-600 font-medium flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {value}
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      未設定
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supabase接続ステータス</CardTitle>
            <CardDescription>Supabaseへの接続状態を確認します</CardDescription>
          </CardHeader>
          <CardContent>
            {supabaseStatus === "checking" && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>確認中</AlertTitle>
                <AlertDescription>Supabaseへの接続を確認しています...</AlertDescription>
              </Alert>
            )}

            {supabaseStatus === "success" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">接続成功</AlertTitle>
                <AlertDescription>{connectionDetails || "Supabaseへの接続に成功しました。"}</AlertDescription>
              </Alert>
            )}

            {supabaseStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>接続エラー</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">接続に問題がある場合は、以下を確認してください：</p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>環境変数が正しく設定されているか</li>
                <li>Supabaseプロジェクトが有効か</li>
                <li>ネットワーク接続に問題がないか</li>
                <li>CORSの設定が正しいか</li>
              </ul>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <Button variant="outline" onClick={() => window.location.reload()}>
                再確認
              </Button>
              <Button asChild>
                <Link href="/login">ログインページへ</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>デモモードについて</CardTitle>
            <CardDescription>Supabase接続がなくてもデモモードで利用できます</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>デモモード</AlertTitle>
              <AlertDescription>
                Supabase接続がなくても、デモアカウント（admin@habu-kensetsu.co.jp / Password123!）でログインできます。
                デモモードではSupabaseの認証は使用せず、ハードコードされた認証情報でログインします。
              </AlertDescription>
            </Alert>

            <div className="mt-4 flex justify-end">
              <Button asChild>
                <Link href="/login">ログインページへ</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
