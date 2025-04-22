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
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        })
      }, 1000)
    },
    [toast],
  )

  // パスワード変更ハンドラをメモ化
  const handleChangePassword = useCallback(() => {
    // パスワード変更ロジックをここに実装
    toast({
      title: "Feature not implemented",
      description: "Password change functionality is not implemented yet.",
    })
  }, [toast])

  // 通知設定ハンドラをメモ化
  const handleNotificationSettings = useCallback(() => {
    // 通知設定ロジックをここに実装
    toast({
      title: "Feature not implemented",
      description: "Notification settings functionality is not implemented yet.",
    })
  }, [toast])

  // 2FA有効化ハンドラをメモ化
  const handleEnable2FA = useCallback(() => {
    // 2FA有効化ロジックをここに実装
    toast({
      title: "Feature not implemented",
      description: "Two-factor authentication functionality is not implemented yet.",
    })
  }, [toast])

  // アカウント無効化ハンドラをメモ化
  const handleDeactivateAccount = useCallback(() => {
    // アカウント無効化ロジックをここに実装
    toast({
      title: "Feature not implemented",
      description: "Account deactivation functionality is not implemented yet.",
    })
  }, [toast])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details and contact information.</CardDescription>
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
                  Change Avatar
                </Button>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Full Name</FormLabel>
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
                      <FormLabel className="text-base">Email</FormLabel>
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
                      <FormLabel className="text-base">Phone</FormLabel>
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
                      <FormLabel className="text-base">Position</FormLabel>
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
                      <FormLabel className="text-base">Department</FormLabel>
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
                    <FormLabel className="text-base">Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        className="text-base min-h-[120px]"
                        placeholder="Tell us a little about yourself"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Brief description for your profile. Maximum 500 characters.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="text-base h-12" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account preferences and security settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Password</h3>
            <p className="text-sm text-muted-foreground mb-4">Change your password to keep your account secure.</p>
            <Button variant="outline" className="text-base" onClick={handleChangePassword}>
              Change Password
            </Button>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Notifications</h3>
            <p className="text-sm text-muted-foreground mb-4">Configure how you receive notifications and alerts.</p>
            <Button variant="outline" className="text-base" onClick={handleNotificationSettings}>
              Notification Settings
            </Button>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Two-Factor Authentication</h3>
            <p className="text-sm text-muted-foreground mb-4">Add an extra layer of security to your account.</p>
            <Button variant="outline" className="text-base" onClick={handleEnable2FA}>
              Enable 2FA
            </Button>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button variant="destructive" className="text-base" onClick={handleDeactivateAccount}>
            Deactivate Account
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
