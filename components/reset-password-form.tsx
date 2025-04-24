"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { getClientSupabaseInstance } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"

const formSchema = z
  .object({
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

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const supabase = getClientSupabaseInstance()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    // URLからトークンを取得
    const tokenParam = searchParams?.get("token")
    setToken(tokenParam)

    if (!tokenParam) {
      setError("リセットトークンが見つかりません。パスワードリセットのリンクが無効か期限切れです。")
    }
  }, [searchParams])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)

    try {
      if (!token) {
        setError("リセットトークンが見つかりません。パスワードリセットのリンクが無効か期限切れです。")
        setIsLoading(false)
        return
      }

      // Supabaseを使用してパスワードを更新
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      })

      if (error) {
        setError(error.message)
        setIsLoading(false)
        return
      }

      toast({
        title: "パスワードが更新されました",
        description: "新しいパスワードでログインできます。",
      })

      // ログインページにリダイレクト
      router.push("/login")
    } catch (err) {
      setError("予期せぬエラーが発生しました。もう一度お試しください。")
      console.error("Password update error:", err)
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>新しいパスワード</FormLabel>
              <FormControl>
                <Input type="password" placeholder="新しいパスワード" {...field} />
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
              <FormLabel>パスワードの確認</FormLabel>
              <FormControl>
                <Input type="password" placeholder="パスワードを再入力" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "更新中..." : "パスワードを更新"}
        </Button>
      </form>
    </Form>
  )
}
