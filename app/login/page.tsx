"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [email, setEmail] = useState("info@mihatama.com") // デフォルト値を設定
  const [password, setPassword] = useState("gensuke") // デフォルト値を設定
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { signIn, loading, user } = useAuth()
  const router = useRouter()

  // ユーザーが既にログインしている場合はダッシュボードにリダイレクト
  useEffect(() => {
    if (user) {
      console.log("ユーザーは既にログインしています。ダッシュボードにリダイレクトします。")
      router.push("/dashboard")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してくださいね")
      setIsSubmitting(false)
      return
    }

    try {
      console.log("ログイン処理を開始します")
      const result = await signIn(email, password)
      if (result.success) {
        console.log("ログイン成功、リダイレクトします")
        // 認証コンテキストがリダイレクトを処理します
      } else {
        setError(result.error || "ログインに失敗しました")
        setIsSubmitting(false)
      }
    } catch (err: any) {
      console.error("ログイン処理エラー:", err)
      setError(err.message || "予期せぬエラーが発生しました")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">ログイン</CardTitle>
          <CardDescription>システムにログインしてくださいね</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="メールアドレスを入力"
                required
                disabled={isSubmitting || loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">パスワード</Label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                  パスワードを忘れた方はこちら
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting || loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
              {isSubmitting || loading ? "ログイン中..." : "ログインする"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            アカウントをお持ちでない方は{" "}
            <Link href="/signup" className="text-blue-600 hover:text-blue-500">
              新規登録
            </Link>
            してくださいね
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
