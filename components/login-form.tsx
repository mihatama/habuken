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
import { AlertCircle } from "lucide-react"

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // フォーム送信ハンドラをメモ化
  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      setIsLoading(true)
      setError(null)

      try {
        console.log("Attempting to sign in with:", values.email)

        // デモ用のハードコードされた認証情報
        if (values.email === "admin@habu-kensetsu.co.jp" && values.password === "Password123!") {
          // デモ用の成功レスポンス
          toast({
            title: "ログイン成功",
            description: "ダッシュボードへようこそ",
          })

          router.push("/dashboard")
          return
        }

        const { error, data } = await signIn(values.email, values.password)

        if (error) {
          console.error("Login error:", error)
          setError(
            error.message === "Invalid login credentials"
              ? "メールアドレスまたはパスワードが正しくありません。"
              : error.message,
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
      }
    },
    [router, toast, signIn],
  )

  return (
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

        {/* デモ用の注意書き */}
        <p className="text-sm text-center text-muted-foreground mt-4">
          デモ用アカウント: admin@habu-kensetsu.co.jp / Password123!
        </p>
      </form>
    </Form>
  )
}
