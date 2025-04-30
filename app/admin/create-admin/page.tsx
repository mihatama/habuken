"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createAdminUser } from "@/actions/create-admin-user"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function CreateAdminPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any | null>(null)

  const handleCreateAdmin = async () => {
    try {
      setLoading(true)
      const response = await createAdminUser()
      setResult(response)
      console.log("管理者ユーザー作成結果:", response)
    } catch (error: any) {
      console.error("エラー:", error)
      setResult({
        success: false,
        message: `エラーが発生しました: ${error.message}`,
        debug: { error },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">管理者ユーザー作成</CardTitle>
          <CardDescription>システム管理者ユーザーを作成します</CardDescription>
        </CardHeader>
        <CardContent>
          {result && (
            <Alert
              variant={result.success ? "default" : "destructive"}
              className={`mb-4 ${result.success ? "bg-green-50 border-green-200" : ""}`}
            >
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>{result.success ? "成功" : "エラー"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>

              {/* デバッグ情報（開発環境のみ） */}
              {process.env.NODE_ENV === "development" && result.debug && (
                <div className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  <pre>{JSON.stringify(result.debug, null, 2)}</pre>
                </div>
              )}
            </Alert>
          )}
          <div className="space-y-4">
            <p>以下の情報で管理者ユーザーを作成します：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>メールアドレス: info@mihatama.com</li>
              <li>パスワード: gensuke</li>
              <li>権限: 管理者（admin）</li>
            </ul>
            <p className="text-sm text-gray-500">注意: 既にユーザーが存在する場合は、パスワードのみ更新されます。</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCreateAdmin} className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                作成中...
              </>
            ) : (
              "管理者ユーザーを作成"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
