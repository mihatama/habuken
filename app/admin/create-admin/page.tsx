"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createAdminUser } from "@/actions/create-admin-user"

export default function CreateAdminPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleCreateAdmin = async () => {
    try {
      setLoading(true)
      const response = await createAdminUser()
      setResult(response)
    } catch (error: any) {
      setResult({ success: false, message: `エラーが発生しました: ${error.message}` })
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
            <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            <p>以下の情報で管理者ユーザーを作成します：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>メールアドレス: info@mihatama.com</li>
              <li>パスワード: gensuke</li>
              <li>権限: 管理者（admin）</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCreateAdmin} className="w-full" disabled={loading}>
            {loading ? "作成中..." : "管理者ユーザーを作成"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
