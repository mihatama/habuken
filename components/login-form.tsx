"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

// ログインフォームのバリデーションスキーマ
const loginSchema = z.object({
  identifier: z.string().min(1, { message: "メールアドレスまたはIDを入力してください" }),
  password: z.string().min(1, { message: "パスワードを入力してください" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const { signIn } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"admin" | "user">("admin")

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn(data.identifier, data.password)

      if (result.success) {
        router.push("/dashboard")
        router.refresh()
      } else {
        setError(result.error || "ログインに失敗しました。認証情報を確認してください。")
      }
    } catch (err) {
      setError("ログイン処理中にエラーが発生しました。")
      console.error("ログインエラー:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">現助 - ログイン</CardTitle>
        <CardDescription className="text-center">プロジェクト管理システムにログインしてください</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "admin" | "user")}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="admin">管理者</TabsTrigger>
            <TabsTrigger value="user">一般ユーザー</TabsTrigger>
          </TabsList>

          <TabsContent value="admin">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">メールアドレス</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="info@mihatama.com"
                  {...form.register("identifier")}
                  disabled={isLoading}
                />
                {form.formState.errors.identifier && (
                  <p className="text-sm text-red-500">{form.formState.errors.identifier.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="admin-password">パスワード</Label>
                </div>
                <Input id="admin-password" type="password" {...form.register("password")} disabled={isLoading} />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ログイン中...
                  </>
                ) : (
                  "ログイン"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="user">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-id">ユーザーID</Label>
                <Input id="user-id" placeholder="ユーザーID" {...form.register("identifier")} disabled={isLoading} />
                {form.formState.errors.identifier && (
                  <p className="text-sm text-red-500">{form.formState.errors.identifier.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="user-password">パスワード</Label>
                </div>
                <Input id="user-password" type="password" {...form.register("password")} disabled={isLoading} />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ログイン中...
                  </>
                ) : (
                  "ログイン"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center text-muted-foreground">※管理者アカウント: info@mihatama.com / 123456!</div>
      </CardFooter>
    </Card>
  )
}
