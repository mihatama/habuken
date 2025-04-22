"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

// バリデーションスキーマ
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
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  // フォーム送信ハンドラをメモ化
  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      setIsLoading(true)

      try {
        const { error } = await signUp(values.email, values.password, {
          full_name: values.fullName,
        })

        if (error) {
          toast({
            title: "登録エラー",
            description: error.message,
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }

        toast({
          title: "登録成功",
          description: "確認メールを送信しました。メールを確認してアカウントを有効化してください。",
        })

        router.push("/login")
      } catch (error) {
        toast({
          title: "エラーが発生しました",
          description: "登録処理中にエラーが発生しました。",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    },
    [router, toast, signUp],
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">氏名</FormLabel>
              <FormControl>
                <Input placeholder="山田 太郎" {...field} className="text-base h-12" />
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
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">パスワード（確認）</FormLabel>
              <FormControl>
                <Input type="password" placeholder="パスワードを再入力" {...field} className="text-base h-12" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full text-base h-12" disabled={isLoading}>
          {isLoading ? "登録中..." : "アカウント登録"}
        </Button>
      </form>
    </Form>
  )
}
