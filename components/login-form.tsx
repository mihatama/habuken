"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// バリデーションスキーマ
const formSchema = z.object({
  email: z.string().email({
    message: "有効なメールアドレスを入力してください。",
  }),
  password: z.string().min(1, {
    message: "パスワードを入力してください。",
  }),
})

export function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn } = useAuth()
  const [loginMode, setLoginMode] = useState<"demo" | "supabase">("demo")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: loginMode === "demo" ? "admin@habu-kensetsu.co.jp" : "",
      password: loginMode === "demo" ? "Password123!" : "",
    },
  })

  // フォーム送信ハンドラをメモ化
  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      setIsLoading(true)
      setError(null)

      try {
        console.log("Attempting to sign in with:", values.email, "Mode:", loginMode)

        // デモモードの場合
        if (
          loginMode === "demo" ||
          (values.email === "admin@habu-kensetsu.co.jp" && values.password === "Password123!")
        ) {
          // デモ用の成功レスポンス
          toast({
            title: "ログイン成功（デモモード）",
            description: "ダッシュボードへようこそ",
          })

          router.push("/dashboard")
          return
        }

        // Supabase認証モードの場合
        const { error, data } = await signIn(values.email, values.password)

        if (error) {
          console.error("Login error:", error)
          setError(
            error.message === "Invalid login credentials"
              ? "メールアドレスまたはパスワードが正しくありません。Supabaseにユーザーが登録されているか確認してください。"
              : `認証エラー: ${error.message}`,
          )
          setIsLoading(false)
          return
        }

        if (!data?.user) {
          setError("ログインに失敗しました。もう一度お試しください。")
          setIsLoading(false)
          return
        }

        toast({
          title: "ログイン成功",
          description: "ダッシュボードへようこそ",
        })

        router.push("/dashboard")
      } catch (err) {
        console.error("Unexpected error during login:", err)
        setError("予期せぬエラーが発生しました。もう一度お試しください。")
        setIsLoading(false)
      } finally {
        setIsLoading(false)
      }
    },
    [router, toast, signIn, loginMode],
  )

  // ログインモード変更時にフォームをリセット
  const handleModeChange = (mode: "demo" | "supabase") => {
    setLoginMode(mode)
    form.reset({
      email: mode === "demo" ? "admin@habu-kensetsu.co.jp" : "",
      password: mode === "demo" ? "Password123!" : "",
    })
    setError(null)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="demo" className="w-full" onValueChange={(v) => handleModeChange(v as "demo" | "supabase")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="demo">デモモード</TabsTrigger>
          <TabsTrigger value="supabase">Supabase認証</TabsTrigger>
        </TabsList>
        <TabsContent value="demo">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>デモモード</AlertTitle>
            <AlertDescription>
              デモアカウントを使用してログインします。実際のSupabase認証は使用しません。
            </AlertDescription>
          </Alert>
        </TabsContent>
        <TabsContent value="supabase">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Supabase認証</AlertTitle>
            <AlertDescription>
              Supabaseに登録されているアカウントでログインします。事前にユーザー登録が必要です。
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>エラー</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">メールアドレス</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} className="text-base h-12" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">パスワード</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="パスワードを入力" {...field} className="text-base h-12" />
                </FormControl>
                <FormMessage />
                <div className="text-sm text-right">
                  <Link href="/forgot-password" className="text-primary hover:underline">
                    パスワードをお忘れですか？
                  </Link>
                </div>
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full text-base h-12" disabled={isLoading}>
            {isLoading ? "ログイン中..." : "ログイン"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
