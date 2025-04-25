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
import { logWithTimestamp, logNavigation, collectAuthDiagnostics } from "@/lib/auth-debug"
import { cleanupAuthStorage } from "@/lib/supabase/supabaseClient"

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
  const { signIn, supabase, authDiagnostics, session, user } = useAuth()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [loginError, setLoginError] = React.useState<string | null>(null)
  const [supabaseStatus, setSupabaseStatus] = React.useState<"checking" | "ok" | "error">("checking")
  const [redirectHistory, setRedirectHistory] = React.useState<string[]>([])
  const [redirectMethod, setRedirectMethod] = React.useState<"router" | "location" | "none">("location")
  const [redirectDelay, setRedirectDelay] = React.useState<number>(500)
  const [autoRedirectEnabled, setAutoRedirectEnabled] = React.useState<boolean>(true)
  const redirectAttemptedRef = React.useRef<boolean>(false)
  const [forceRedirect, setForceRedirect] = React.useState<boolean>(false)

  // 初回マウント時に認証ストレージをクリーンアップ
  React.useEffect(() => {
    cleanupAuthStorage()
  }, [])

  // セッションが既に存在する場合は自動的にリダイレクト
  React.useEffect(() => {
    if ((session && user && autoRedirectEnabled && !redirectAttemptedRef.current) || forceRedirect) {
      redirectAttemptedRef.current = true

      logWithTimestamp("既存のセッションを検出しました - 自動リダイレクト", {
        user: user?.email || "不明",
        redirect,
        sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : "unknown",
        forceRedirect,
      })

      setRedirectHistory((prev) => [...prev, `既存セッション検出: ${user?.email || "不明"} - 自動リダイレクト準備`])

      // 少し遅延を入れてからリダイレクト
      const timer = setTimeout(() => {
        setRedirectHistory((prev) => [...prev, `自動リダイレクト実行: ${redirect}`])
        executeRedirect(redirect, "location")
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [session, user, redirect, autoRedirectEnabled, forceRedirect])

  // Supabase接続テスト
  React.useEffect(() => {
    const checkSupabase = async () => {
      try {
        logWithTimestamp("Supabase接続テスト開始")
        // 簡単な接続テスト - 匿名セッションを取得
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error("Supabase connection error:", error)
          setSupabaseStatus("error")
        } else {
          logWithTimestamp("Supabase connection successful", {
            hasSession: !!data.session,
            user: data.session?.user?.email || "未ログイン",
          })
          setSupabaseStatus("ok")

          // セッションがあるが自動リダイレクトが無効の場合は通知
          if (data.session && !autoRedirectEnabled) {
            setRedirectHistory((prev) => [...prev, `セッション検出: ${data.session.user.email} (自動リダイレクト無効)`])
          }
        }
      } catch (err) {
        console.error("Supabase check error:", err)
        setSupabaseStatus("error")
      }
    }

    checkSupabase()
  }, [supabase, autoRedirectEnabled])

  // フォームのデフォルト値を修正
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailOrId: "",
      password: "",
      rememberMe: true, // デフォルトでログイン状態を保持するように変更
    },
  })

  // リダイレクト実行関数
  const executeRedirect = (destination: string, method: "router" | "location") => {
    logNavigation("実行", `${destination} (方法: ${method})`)

    if (method === "router") {
      setRedirectHistory((prev) => [...prev, `Next.jsルーターでリダイレクト: ${destination}`])
      router.push(destination)
    } else {
      setRedirectHistory((prev) => [...prev, `window.locationでリダイレクト: ${destination}`])

      // リダイレクト前に診断情報を収集
      const diagnostics = collectAuthDiagnostics()
      console.log("リダイレクト前の診断情報:", diagnostics)

      // 少し遅延を入れてからリダイレクト
      setTimeout(() => {
        // リダイレクト前に認証情報をセッションストレージに一時保存
        // これにより、ページ遷移後も認証状態を維持できる
        if (session && user) {
          try {
            sessionStorage.setItem("auth_redirect_timestamp", Date.now().toString())
            sessionStorage.setItem("auth_redirect_user", user.email || user.id)
            sessionStorage.setItem("auth_redirect_session_exists", "true")

            // 認証情報の一時保存をログに記録
            logWithTimestamp("認証情報を一時保存しました", {
              user: user.email || user.id,
              timestamp: Date.now(),
            })
          } catch (e) {
            console.error("セッションストレージへの保存に失敗:", e)
          }
        }

        // リダイレクト直前の状態を記録
        logWithTimestamp("リダイレクト直前の状態:", {
          cookies: document.cookie,
          localStorage: Object.keys(localStorage).filter(
            (k) => k.includes("auth") || k.includes("supabase") || k.includes("habuken"),
          ),
        })

        // 強制的にリダイレクト
        window.location.href = destination
      }, redirectDelay)
    }
  }

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

      logWithTimestamp("Attempting login with:", values.emailOrId)
      setRedirectHistory((prev) => [...prev, `ログイン試行: ${values.emailOrId}`])

      // ログイン前の診断情報を収集
      const preDiagnostics = authDiagnostics()
      logWithTimestamp("ログイン前の診断情報:", preDiagnostics)

      // Supabase認証を使用
      const startTime = Date.now()
      const { error, data } = await signIn(values.emailOrId, values.password)
      const duration = Date.now() - startTime
      logWithTimestamp(`ログイン処理完了: ${duration}ms`)

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
        logWithTimestamp("Login successful:", {
          user: data.user?.email,
          session: data.session ? "存在します" : "存在しません",
        })
        setRedirectHistory((prev) => [...prev, "ログイン成功: セッション設定完了"])

        // ログイン後の診断情報を収集
        const postDiagnostics = authDiagnostics()
        logWithTimestamp("ログイン後の診断情報:", postDiagnostics)

        toast({
          title: "ログイン成功",
          description: "ログインに成功しました。",
        })

        // 明示的にリダイレクトを実行
        logWithTimestamp(`リダイレクト先: ${redirect} (方法: ${redirectMethod})`)
        setRedirectHistory((prev) => [...prev, `リダイレクト実行: ${redirect} (方法: ${redirectMethod})`])

        // リダイレクト前に少し待機して認証状態が確実に更新されるようにする
        setTimeout(() => {
          executeRedirect(redirect, redirectMethod)
        }, redirectDelay)
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
    executeRedirect(redirect, redirectMethod)
  }

  // 強制リダイレクト
  const handleForceRedirect = () => {
    setRedirectHistory((prev) => [...prev, `強制リダイレクト実行: ${redirect}`])
    setForceRedirect(true)
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

  // 診断情報収集
  const handleCollectDiagnostics = () => {
    const diagnostics = authDiagnostics()
    setRedirectHistory((prev) => [...prev, `診断情報収集: ${JSON.stringify(diagnostics)}`])
    toast({
      title: "診断情報収集",
      description: "認証診断情報を収集しました。コンソールを確認してください。",
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

      {user && session && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-600">既存のセッション</AlertTitle>
          <AlertDescription>
            {user.email} としてログイン済みです。
            {autoRedirectEnabled ? (
              <span> ダッシュボードに自動的にリダイレクトします...</span>
            ) : (
              <Button onClick={handleManualRedirect} variant="link" className="p-0 h-auto text-blue-600">
                ダッシュボードに移動
              </Button>
            )}
          </AlertDescription>
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
          {/* ログイン状態の表示 */}
          {user && session ? (
            <div className="p-2 text-sm text-center bg-blue-50 rounded border border-blue-200">
              <p className="font-medium text-blue-700">{user.email} としてログイン済みです</p>
              <p className="text-blue-600">ボタンをクリックして続行できます</p>
            </div>
          ) : null}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "ログイン中..." : user && session ? "既にログイン済み" : "ログイン"}
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
        <div className="text-xs p-2 bg-gray-50 rounded border mb-2">
          <p>
            <strong>現在の状態:</strong> {user ? "ユーザーあり" : "ユーザーなし"} /{" "}
            {session ? "セッションあり" : "セッションなし"}
          </p>
          <p>
            <strong>ボタン状態:</strong> {isLoading ? "読み込み中" : user && session ? "ログイン済み" : "クリック可能"}
          </p>
        </div>
        <h3 className="text-sm font-medium mb-2">デバッグツール</h3>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="text-sm font-medium">リダイレクト方法:</div>
            <div className="flex gap-2">
              <Button
                onClick={() => setRedirectMethod("router")}
                variant={redirectMethod === "router" ? "default" : "outline"}
                size="sm"
              >
                Next.js Router
              </Button>
              <Button
                onClick={() => setRedirectMethod("location")}
                variant={redirectMethod === "location" ? "default" : "outline"}
                size="sm"
              >
                window.location
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-sm font-medium">リダイレクト遅延: {redirectDelay}ms</div>
            <div className="flex gap-2">
              <Button
                onClick={() => setRedirectDelay(0)}
                variant={redirectDelay === 0 ? "default" : "outline"}
                size="sm"
              >
                0ms
              </Button>
              <Button
                onClick={() => setRedirectDelay(300)}
                variant={redirectDelay === 300 ? "default" : "outline"}
                size="sm"
              >
                300ms
              </Button>
              <Button
                onClick={() => setRedirectDelay(500)}
                variant={redirectDelay === 500 ? "default" : "outline"}
                size="sm"
              >
                500ms
              </Button>
              <Button
                onClick={() => setRedirectDelay(1000)}
                variant={redirectDelay === 1000 ? "default" : "outline"}
                size="sm"
              >
                1000ms
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-sm font-medium">自動リダイレクト:</div>
            <div className="flex gap-2">
              <Button
                onClick={() => setAutoRedirectEnabled(true)}
                variant={autoRedirectEnabled ? "default" : "outline"}
                size="sm"
              >
                有効
              </Button>
              <Button
                onClick={() => setAutoRedirectEnabled(false)}
                variant={!autoRedirectEnabled ? "default" : "outline"}
                size="sm"
              >
                無効
              </Button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleManualRedirect} variant="outline" size="sm">
              手動リダイレクト
            </Button>
            <Button onClick={handleForceRedirect} variant="outline" size="sm">
              強制リダイレクト
            </Button>
            <Button onClick={handleClearStorage} variant="outline" size="sm">
              ストレージクリア
            </Button>
            <Button onClick={handleCollectDiagnostics} variant="outline" size="sm">
              診断情報収集
            </Button>
          </div>
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
