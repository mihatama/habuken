"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/dashboard"
  const { signIn, supabase } = useAuth()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [loginError, setLoginError] = React.useState<string | null>(null)
  const [supabaseStatus, setSupabaseStatus] = React.useState<"checking" | "ok" | "error">("checking")
  const [redirectHistory, setRedirectHistory] = React.useState<string[]>([])

  // Supabase接続テスト
  React.useEffect(() => {
    const checkSupabase = async () => {
      try {
        console.log("Supabase接続テスト開始")
        // 簡単な接続テスト - 匿名セッションを取得
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error("Supabase connection error:", error)
          setSupabaseStatus("error")
        } else {
          console.log("Supabase connection successful", data)
          setSupabaseStatus("ok")

          // すでにログイン済みの場合はダッシュボードにリダイレクト
          if (data.session) {
            console.log("既存のセッションが見つかりました。ミドルウェアによるリダイレクトを待機します。")

            // リダイレクト履歴を記録
            setRedirectHistory((prev) => [...prev, "セッション検出: ミドルウェアによるリダイレクトを待機中"])
          }
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
        setIsLoading(false)
        return
      }

      console.log("Attempting login with:", values.emailOrId)
      setRedirectHistory((prev) => [...prev, `ログイン試行: ${values.emailOrId}`])

      // Supabase認証を使用
      const { error, data } = await signIn(values.emailOrId, values.password)

      if (error) {
        console.error("Login error:", error)
        setRedirectHistory((prev) => [...prev, `ログインエラー: ${error.message}`])

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
        setRedirectHistory((prev) => [...prev, "ログイン成功: セッション設定完了"])

        toast({
          title: "ログイン成功",
          description: "ログインに成功しました。",
        })

        // ミドルウェアによるリダイレクトを待機
        setRedirectHistory((prev) => [...prev, `リダイレクト待機中: ${redirect}`])
      }
    } catch (error) {
      console.error("Login error:", error)
      const errorMessage = error instanceof Error ? error.message : "不明なエラーが発生しました"
      setLoginError(errorMessage)
      setRedirectHistory((prev) => [...prev, `例外発生: ${errorMessage}`])

      toast({
        variant: "destructive",
        title: "エラー",
        description: "ログイン処理中にエラーが発生しました。" + errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 手動リダイレクト
  const handleManualRedirect = () => {
    setRedirectHistory((prev) => [...prev, `手動リダイレクト実行: ${redirect}`])
    window.location.href = redirect
  }

  // ストレージクリア
  const handleClearStorage = () => {
    localStorage.clear()
    sessionStorage.clear()
    setRedirectHistory((prev) => [...prev, "ローカルストレージとセッションストレージをクリア"])
    toast({
      title: "ストレージクリア",
      description: "ブラウザのストレージをクリアしました。",
    })
  }

  return (
    <div className="grid gap-6">
      {supabaseStatus === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>接続エラー</AlertTitle>
          <AlertDescription>
            Supabaseサービスとの接続に問題があります。
            <Link href="/debug/supabase" className="underline ml-1">
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
        <p>アカウントをお持ちでない場合は、管理者にお問い合わせください。</p>
      </div>

      <div className="text-center text-sm">
        <Link href="/debug/supabase" className="text-muted-foreground hover:text-primary">
          Supabase接続状態を詳細に確認する
        </Link>
      </div>

      {/* デバッグ情報とツール */}
      <div className="mt-6 border-t pt-4">
        <h3 className="text-sm font-medium mb-2">デバッグツール</h3>

        <div className="flex gap-2 mb-4">
          <Button onClick={handleManualRedirect} variant="outline" size="sm">
            手動リダイレクト
          </Button>
          <Button onClick={handleClearStorage} variant="outline" size="sm">
            ストレージクリア
          </Button>
        </div>

        {redirectHistory.length > 0 && (
          <div className="text-xs text-muted-foreground mt-2 border p-2 rounded bg-gray-50">
            <p className="font-medium mb-1">リダイレクト履歴:</p>
            <ul className="list-disc pl-4 space-y-1">
              {redirectHistory.map((entry, index) => (
                <li key={index}>{entry}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
