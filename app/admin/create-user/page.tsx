"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"

export default function CreateUserPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [loadingPage, setLoadingPage] = useState(true)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [result, setResult] = useState<any | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "user", // デフォルト値
  })

  // 権限チェック
  useEffect(() => {
    if (!loading) {
      // ユーザーがログインしていない、または管理者でない場合はリダイレクト
      if (!user || user.user_metadata?.role !== "admin") {
        router.push("/dashboard")
      } else {
        setLoadingPage(false)
      }
    }
  }, [user, loading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }))
  }

  const handleCreateUser = async () => {
    try {
      setLoadingSubmit(true)

      // 新しいAPIエンドポイントにPOSTリクエストを送信
      const response = await fetch("/api/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        // 成功したらフォームをリセット
        setFormData({
          email: "",
          password: "",
          role: "user",
        })
      }

      console.log("ユーザー作成結果:", data)
    } catch (error: any) {
      console.error("エラー:", error)
      setResult({
        success: false,
        message: `エラーが発生しました: ${error.message}`,
        debug: { error: error.toString() },
      })
    } finally {
      setLoadingSubmit(false)
    }
  }

  if (loadingPage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">ユーザー作成</CardTitle>
          <CardDescription>新しいユーザーを作成します</CardDescription>
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
              <AlertTitle>{result.success ? "成功しました" : "エラーが発生しました"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>

              {/* デバッグ情報（常に表示） */}
              {result.debug && (
                <div className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  <pre>{JSON.stringify(result.debug, null, 2)}</pre>
                </div>
              )}
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="パスワード"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">権限</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="権限を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">管理者</SelectItem>
                  <SelectItem value="user">一般ユーザー</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleCreateUser}
            className="w-full"
            disabled={loadingSubmit || !formData.email || !formData.password}
          >
            {loadingSubmit ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                作成中...
              </>
            ) : (
              "ユーザーを作成する"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
