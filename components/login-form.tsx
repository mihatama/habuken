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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const formSchema = z.object({
  email: z.string().email({
    message: "有効なメールアドレスを入力してください。",
  }),
  password: z.string().min(8, {
    message: "パスワードは8文字以上である必要があります。",
  }),
  rememberMe: z.boolean().default(false),
})

export function LoginForm() {
  const { toast } = useToast()
  const router = useRouter()
  const { signIn } = useAuth()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [loginMode, setLoginMode] = React.useState<"demo" | "supabase">("demo")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      if (loginMode === "demo") {
        // デモモード: ハードコードされた認証情報をチェック
        if (values.email === "admin@habu-kensetsu.co.jp" && values.password === "Password123!") {
          // デモモードでの成功
          // クッキーを設定してログイン状態を保持
          document.cookie = "logged_in=true; path=/; max-age=86400" // 24時間有効

          toast({
            title: "ログイン成功",
            description: "デモモードでログインしました。",
          })

          router.push("/dashboard")
        } else {
          // デモモードでの失敗
          toast({
            variant: "destructive",
            title: "ログイン失敗",
            description: "デモアカウントの認証情報が正しくありません。",
          })
        }
      } else {
        // Supabaseモード: 実際の認証を使用
        const { error } = await signIn(values.email, values.password)

        if (error) {
          console.error("Login error:", error)
          toast({
            variant: "destructive",
            title: "ログイン失敗",
            description: error.message || "認証に失敗しました。認証情報を確認してください。",
          })
        } else {
          // Supabaseでの成功
          document.cookie = "logged_in=true; path=/; max-age=86400" // 24時間有効

          toast({
            title: "ログイン成功",
            description: "ログインに成功しました。",
          })

          router.push("/dashboard")
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        variant: "destructive",
        title: "エラー",
        description: "ログイン処理中にエラーが発生しました。",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Tabs defaultValue="demo" onValueChange={(value) => setLoginMode(value as "demo" | "supabase")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="demo">デモモード</TabsTrigger>
          <TabsTrigger value="supabase">Supabase認証</TabsTrigger>
        </TabsList>
        <TabsContent value="demo">
          <div className="text-sm text-muted-foreground mb-4">
            <p>デモアカウント:</p>
            <p>メール: admin@habu-kensetsu.co.jp</p>
            <p>パスワード: Password123!</p>
          </div>
        </TabsContent>
        <TabsContent value="supabase">
          <div className="text-sm text-muted-foreground mb-4">
            <p>Supabaseに登録されたアカウントでログインします。</p>
          </div>
        </TabsContent>
      </Tabs>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
    </div>
  )
}
