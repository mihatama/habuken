"use client"

import { useState, useCallback } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"

// バリデーションスキーマ
const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(6, {
    message: "Phone number must be at least 6 characters.",
  }),
  position: z.string().min(2, {
    message: "Position must be at least 2 characters.",
  }),
  department: z.string().min(2, {
    message: "Department must be at least 2 characters.",
  }),
  bio: z.string().max(500, {
    message: "Bio must not be longer than 500 characters.",
  }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // デフォルト値
  const defaultValues: Partial<ProfileFormValues> = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "555-123-4567",
    position: "Project Manager",
    department: "Management",
    bio: "Experienced project manager with a focus on construction and infrastructure projects.",
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  })

  // フォーム送信ハンドラをメモ化
  const onSubmit = useCallback(
    (data: ProfileFormValues) => {
      setIsLoading(true)

      // API呼び出しをシミュレート
      setTimeout(() => {
        setIsLoading(false)
        toast({
          title: "プロフィールを更新しました",
          description: "プロフィール情報が正常に更新されました。",
        })
      }, 1000)
    },
    [toast],
  )

  // パスワード変更ハンドラをメモ化
  const handleChangePassword = useCallback(() => {
    // パスワード変更ロジックをここに実装
    toast({
      title: "機能未実装",
      description: "パスワード変更機能はまだ実装されていません。",
    })
  }, [toast])

  // 通知設定ハンドラをメモ化
  const handleNotificationSettings = useCallback(() => {
    // 通知設定ロジックをここに実装
    toast({
      title: "機能未実装",
      description: "通知設定機能はまだ実装されていません。",
    })
  }, [toast])

  // 2FA有効化ハンドラをメモ化
  const handleEnable2FA = useCallback(() => {
    // 2FA有効化ロジックをここに実装
    toast({
      title: "機能未実装",
      description: "二要素認証機能はまだ実装されていません。",
    })
  }, [toast])

  // アカウント無効化ハンドラをメモ化
  const handleDeactivateAccount = useCallback(() => {
    // アカウント無効化ロジックをここに実装
    toast({
      title: "機能未実装",
      description: "アカウント無効化機能はまだ実装されていません。",
    })
  }, [toast])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>個人情報</CardTitle>
          <CardDescription>個人情報や連絡先を更新してください。</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Profile" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Button variant="outline" type="button">
                  プロフィール画像を変更
                </Button>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">氏名</FormLabel>
                    <FormControl>
                      <Input className="text-base h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">メールアドレス</FormLabel>
                      <FormControl>
                        <Input className="text-base h-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">電話番号</FormLabel>
                      <FormControl>
                        <Input className="text-base h-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">役職</FormLabel>
                      <FormControl>
                        <Input className="text-base h-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">部署</FormLabel>
                      <FormControl>
                        <Input className="text-base h-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">自己紹介</FormLabel>
                    <FormControl>
                      <Textarea
                        className="text-base min-h-[120px]"
                        placeholder="Tell us a little about yourself"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>プロフィールの簡単な説明です。最大500文字まで。</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="text-base h-12" disabled={isLoading}>
                {isLoading ? "保存中..." : "変更を保存"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>アカウント設定</CardTitle>
          <CardDescription>アカウントの設定やセキュリティ設定を管理します。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">パスワード</h3>
            <p className="text-sm text-muted-foreground mb-4">
              アカウントを安全に保つためにパスワードを変更してください。
            </p>
            <Button variant="outline" className="text-base" onClick={handleChangePassword}>
              パスワードを変更
            </Button>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">通知設定</h3>
            <p className="text-sm text-muted-foreground mb-4">通知やアラートの受け取り方を設定します。</p>
            <Button variant="outline" className="text-base" onClick={handleNotificationSettings}>
              通知設定
            </Button>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">二要素認証</h3>
            <p className="text-sm text-muted-foreground mb-4">アカウントにセキュリティ層を追加します。</p>
            <Button variant="outline" className="text-base" onClick={handleEnable2FA}>
              二要素認証を有効化
            </Button>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button variant="destructive" className="text-base" onClick={handleDeactivateAccount}>
            アカウントを無効化
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
