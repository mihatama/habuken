"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"

// フォームスキーマ
const formSchema = z.object({
  email: z.string().email({
    message: "有効なメールアドレスを入力してください。",
  }),
  password: z.string().min(6, {
    message: "パスワードは6文字以上である必要があります。",
  }),
  rememberMe: z.boolean().default(false),
})

export function SimpleLoginForm() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<boolean>(false)
  const [user, setUser] = React.useState<any>(null)
  const router = useRouter()

  // Supabaseクライアントを初期化
  const supabase = createClientComponentClient()

  // フォームの初期化
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  // 現在のセッションを確認
  React.useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (data.session) {
          setUser(data.session.user)
          console.log("既存のセッションを検出:", data.session.user.email)
        }
      } catch (err) {
        console.error("セッション確認エラー:", err)
      }
    }

    checkSession()
  }, [supabase.auth])

  // フォーム送信処理
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      console.log("ログイン試行:", values.email)

      // Supabaseでログイン
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        console.error("ログインエラー:", error.message)
        setError(error.message)
        return
      }

      if (data.user) {
        console.log("ログイン成功:", data.user.email)
        setUser(data.user)
        setSuccess(true)

        // 成功メッセージを表示した後、ダッシュボードにリダイレクト
        setTimeout(() => {
          router.push("/dashboard")
        }, 1000)
      }
    } catch (err) {
      console.error("ログイン例外:", err)
      setError("ログイン処理中にエラーが発生しました。")
    } finally {
      setIsLoading(false)
    }
  }

  // ダッシュボードに移動
  const goToDashboard = () => {
    router.push("/dashboard")
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">ログイン</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <Info className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">ログイン成功</AlertTitle>
          <AlertDescription>ダッシュボードにリダイレクトします...</AlertDescription>
        </Alert>
      )}

      {user && (
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-600">ログイン済み</AlertTitle>
          <AlertDescription>
            {user.email} としてログイン済みです
            <Button onClick={goToDashboard} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white">
              ダッシュボードに移動
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>メールアドレスまたはユーザーID</FormLabel>
                <FormControl>
                  <Input placeholder="user@example.com または user123" {...field} />
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
                <div className="flex items-center justify-between">
                  <FormLabel>パスワード</FormLabel>
                  <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">
                    パスワードをお忘れですか？
                  </Link>
                </div>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>ログイン状態を保持する</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "ログイン中..." : user ? "再ログイン" : "ログイン"}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center text-sm">
        <p>
          {user ? (
            <span className="text-blue-600">{user.email} としてログイン済みです</span>
          ) : (
            <span>アカウントをお持ちでない場合は、管理者にお問い合わせください。</span>
          )}
        </p>
      </div>

      {user && (
        <div className="mt-4 pt-4 border-t">
          <Button onClick={goToDashboard} className="w-full">
            ダッシュボードに移動
          </Button>
        </div>
      )}
    </div>
  )
}
