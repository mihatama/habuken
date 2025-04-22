"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"

// フォームスキーマを修正
const formSchema = z.object({
  emailOrId: z.string().min(1, {
    message: "メールアドレスまたはユーザーIDを入力してください。",
  }),
  password: z.string().min(6, {
    message: "パスワードは6文字以上である必要があります。",
  }),
  rememberMe: z.boolean().default(false),
})

export function LoginForm() {
  const { toast } = useToast()
  const router = useRouter()
  const { signIn, supabase } = useAuth()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [loginError, setLoginError] = React.useState<string | null>(null)
  const [supabaseStatus, setSupabaseStatus] = React.useState<"checking" | "ok" | "error">("checking")

  // Supabase接続テスト
  React.useEffect(() => {
    const checkSupabase = async () => {
      try {
        // 簡単な接続テスト - 匿名セッションを取得
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error("Supabase connection error:", error)
          setSupabaseStatus("error")
        } else {
          console.log("Supabase connection successful")
          setSupabaseStatus("ok")
        }
      } catch (err) {
        console.error("Supabase check error:", err)
        setSupabaseStatus("error")
      }
    }

    checkSupabase()
  }, [supabase])

  // フォームのデフォルト値を修正
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailOrId: "",
      password: "",
      rememberMe: false,
    },
  })

  // onSubmit関数を修正
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setLoginError(null)

    try {
      // Supabase接続状態を確認
      if (supabaseStatus === "error") {
        setLoginError("Supabaseとの接続に問題があります。管理者にお問い合わせください。")
        return
      }

      console.log("Attempting login with:", values.emailOrId)

      // Supabase認証を使用
      const { error, data } = await signIn(values.emailOrId, values.password)

      if (error) {
        console.error("Login error:", error)

        // エラーメッセージをより具体的に
        let errorMessage = "認証に失敗しました。"

        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "ユーザーIDまたはパスワードが正しくありません。"
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "メールアドレスが確認されていません。メールボックスを確認してください。"
        } else if (error.message.includes("Too many requests")) {
          errorMessage = "ログイン試行回数が多すぎます。しばらく待ってから再試行してください。"
        } else if (error.message.includes("ユーザーIDが見つかりません")) {
          errorMessage = "ユーザーIDが見つかりません。"
        } else {
          errorMessage = `エラー: ${error.message}`
        }

        setLoginError(errorMessage)
        toast({
          variant: "destructive",
          title: "ログイン失敗",
          description: errorMessage,
        })
      } else {
        // ログイン成功
        console.log("Login successful:", data)
        toast({
          title: "ログイン成功",
          description: "ログインに成功しました。",
        })

        // セッションが確実に設定されるようにする
        setTimeout(() => {
          router.push("/dashboard")
        }, 500)
      }
    } catch (error) {
      console.error("Login error:", error)
      const errorMessage = error instanceof Error ? error.message : "不明なエラーが発生しました"
      setLoginError(errorMessage)
      toast({
        variant: "destructive",
        title: "エラー",
        description: "ログイン処理中にエラーが発生しました。" + errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      {supabaseStatus === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>接続エラー</AlertTitle>
          <AlertDescription>
            Supabaseサービスとの接続に問題があります。
            <Link href="/supabase-debug" className="underline ml-1">
              詳細を確認する
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {supabaseStatus === "ok" && (
        <Alert className="bg-green-50 border-green-200">
          <Info className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">接続状態</AlertTitle>
          <AlertDescription>Supabaseサービスに正常に接続されています。</AlertDescription>
        </Alert>
      )}

      {loginError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>ログインエラー</AlertTitle>
          <AlertDescription>{loginError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* フォームフィールドを修正 */}
          <FormField
            control={form.control}
            name="emailOrId"
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
                <FormLabel>パスワード</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-primary">
                    パスワードをお忘れですか？
                  </Link>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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
            {isLoading ? "ログイン中..." : "ログイン"}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        <p>
          アカウントをお持ちでない場合は、
          <Link href="/signup" className="text-primary hover:underline">
            新規登録
          </Link>
          してください。
        </p>
      </div>

      <div className="text-center text-sm">
        <Link href="/supabase-debug" className="text-muted-foreground hover:text-primary">
          Supabase接続状態を詳細に確認する
        </Link>
      </div>
    </div>
  )
}
