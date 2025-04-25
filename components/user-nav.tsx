"use client"

import { useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function UserNav() {
  const router = useRouter()
  const { user, signOut } = useAuth()

  // ナビゲーション関数をメモ化
  const navigateToProfile = useCallback(() => {
    router.push("/profile")
  }, [router])

  const navigateToSettings = useCallback(() => {
    router.push("/settings")
  }, [router])

  const navigateToDashboard = useCallback(() => {
    router.push("/dashboard")
  }, [router])

  const handleSignOut = useCallback(async () => {
    await signOut()
  }, [signOut])

  // ユーザー名を取得（メールアドレスの@前の部分またはデフォルト値）
  const userName = user?.email ? user.email.split("@")[0] : "ユーザー"
  // ユーザーのイニシャルを取得
  const userInitials = userName.substring(0, 2).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt={userName} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer" onClick={navigateToProfile}>
            プロフィール
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={navigateToSettings}>
            設定
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={navigateToDashboard}>
          ダッシュボード
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleSignOut}>
          ログアウト
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
