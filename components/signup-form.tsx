"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

const formSchema = z
  .object({
    fullName: z.string().min(2, {
      message: "名前は2文字以上である必要があります。",
    }),
    email: z.string().email({
      message: "有効なメールアドレスを入力してください。",
    }),
    password: z.string().min(8, {
      message: "パスワードは8文字以上である必要があります。",
    }),
    confirmPassword: z.string().min(8, {
      message: "パスワードは8文字以上である必要があります。",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません。",
    path: ["confirmPassword"],
  })

export function SignupForm() {
  const { toast } = useToast()
  const router = useRouter()
  const { signUp } = useAuth()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [signupError, setSignupError] = React.useState<string | null>(null)
  const [signupSuccess, setSignupSuccess] = React.useState<boolean>(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setSignupError(null)
    setSignupSuccess(false)

    try {
      // Supabase認証を使用
      const { error, data } = await signUp(values.email, values.password, {
        full_name: values.fullName,
      })

      if (error) {
        console.error("Signup error:", error)

        // エラーメッセージをより具体的に
        let errorMessage = "登録に失敗しました。"

        if (error.message.includes("already registered")) {
          errorMessage = "このメールアドレスは既に登録されています。"
        } else if (error.message.includes("password")) {
          errorMessage = "パスワードが要件を満たしていません。"
        } else {
          errorMessage = `エラー: ${error.message}`
        }

        setSignupError(errorMessage)
        toast({
          variant: "destructive",
          title: "登録失敗",
          description: errorMessage,
        })
      } else {
        // 登録成功
        console.log("Signup successful:", data)
        setSignupSuccess(true)
        toast({
          title: "登録成功",
          description: "アカウントが作成されました。メールを確認して登録を完了してください。",
        })

        // フォームをリセット
        form.reset()
      }
    } catch (error) {
      console.error("Signup error:", error)
      const errorMessage = error instanceof Error ? error.message : "不明なエラーが発生しました"
      setSignupError(errorMessage)
      toast({
        variant: "destructive",
        title: "エラー",
        description: "登録処理中にエラーが発生しました。" + errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      {signupError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>登録エラー</AlertTitle>
          <AlertDescription>{signupError}</AlertDescription>
        </Alert>
      )}

      {signupSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">登録成功</AlertTitle>
          <AlertDescription className="text-green-700">
            アカウントが作成されました。メールを確認して登録を完了してください。
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>氏名</FormLabel>
                <FormControl>
                  <Input placeholder="山田 太郎" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>メールアドレス</FormLabel>
                <FormControl>
                  <Input placeholder="m@example.com" {...field} />
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
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>パスワード（確認）</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "登録中..." : "アカウント作成"}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        <p>
          既にアカウントをお持ちの場合は、
          <Link href="/login" className="text-primary hover:underline">
            ログイン
          </Link>
          してください。
        </p>
      </div>
    </div>
  )
}
