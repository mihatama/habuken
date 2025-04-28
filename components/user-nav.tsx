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

// モックユーザー
const mockUser = {
  id: "1",
  email: "yamada@example.com",
  user_metadata: {
    full_name: "山田太郎",
    role: "admin",
  },
}

export function UserNav() {
  const router = useRouter()

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

  // ダミーのサインアウト関数
  const signOut = useCallback(() => {
    console.log("サインアウト機能は現在無効化されています")
  }, [])

  // ユーザー情報
  const userName = mockUser?.user_metadata?.full_name || "ゲストユーザー"
  const userEmail = mockUser?.email || "guest@example.com"
  // 名前の最初の文字を取得（アバターのフォールバック用）
  const nameInitial = userName.charAt(0)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt={userName} />
            <AvatarFallback>{nameInitial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
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
        <DropdownMenuItem className="cursor-pointer" onClick={signOut}>
          ログアウト
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
