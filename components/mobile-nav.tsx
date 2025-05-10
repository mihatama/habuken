"use client"

import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
// Lucideアイコンをインポート
import {
  X,
  LogOut,
  LayoutDashboard,
  Briefcase,
  Users,
  Truck,
  Car,
  Calendar,
  FileText,
  Box,
  UserPlus,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, signOut, refreshUserData } = useAuth()

  // コンポーネントマウント時にユーザーデータを更新
  useEffect(() => {
    if (user) {
      refreshUserData()
    }
  }, [])

  // ユーザーが管理者かどうかを確認
  const isAdmin = user?.user_metadata?.role === "admin"

  // デバッグ用
  useEffect(() => {
    if (user) {
      console.log("MobileNav - ユーザーロール:", user.user_metadata?.role)
      console.log("MobileNav - 管理者判定:", isAdmin)
    }
  }, [user, isAdmin])

  if (!isOpen) return null

  const handleNavigation = (path: string) => {
    router.push(path)
    onClose()
  }

  const isActive = (path: string) => {
    return pathname === path ? "bg-darkgray-light text-gold" : "text-white hover:bg-darkgray-light hover:text-gold"
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/login")
      onClose()
    } catch (error) {
      console.error("サインアウトエラー:", error)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
      style={{ overflow: isOpen ? "hidden" : "auto" }}
    >
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-gray-600/80 shadow-lg overflow-y-auto">
        <div className="flex h-16 items-center justify-between px-4 border-b border-gold/20">
          <div className="flex items-center">
            <div className="mr-2 p-0.5">
              <Image src="/habuken-logo.png" alt="現助ロゴ" width={24} height={24} className="rounded-full" />
            </div>
            <span style={{ fontFamily: "'Noto Serif JP', serif" }} className="text-xl font-bold text-gold">
              現助
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-darkgray-light hover:text-gold"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">閉じる</span>
          </Button>
        </div>

        {user && (
          <div className="p-4 border-b border-gold/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gold flex items-center justify-center">
                <span className="text-darkgray font-bold">{user.email?.charAt(0).toUpperCase() || "U"}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user.email}</p>
                <p className="text-xs text-muted-foreground">ログイン中</p>
              </div>
            </div>
          </div>
        )}

        {/* モバイルナビゲーションボタンにアイコンを追加 */}
        <div className="grid gap-1 p-2">
          <Button
            variant="ghost"
            className={`flex w-full justify-start p-3 ${isActive("/dashboard")}`}
            onClick={() => handleNavigation("/dashboard")}
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            一覧表示
          </Button>
          <Button
            variant="ghost"
            className={`flex w-full justify-start p-3 ${isActive("/deals")}`}
            onClick={() => handleNavigation("/deals")}
          >
            <Briefcase className="h-4 w-4 mr-2" />
            現場
          </Button>
          <Button
            variant="ghost"
            className={`flex w-full justify-start p-3 ${isActive("/master/staff")}`}
            onClick={() => handleNavigation("/master/staff")}
          >
            <Users className="h-4 w-4 mr-2" />
            スタッフ
          </Button>
          <Button
            variant="ghost"
            className={`flex w-full justify-start p-3 ${isActive("/master/heavy")}`}
            onClick={() => handleNavigation("/master/heavy")}
          >
            <Truck className="h-4 w-4 mr-2" />
            重機
          </Button>
          <Button
            variant="ghost"
            className={`flex w-full justify-start p-3 ${isActive("/master/vehicle")}`}
            onClick={() => handleNavigation("/master/vehicle")}
          >
            <Car className="h-4 w-4 mr-2" />
            車両
          </Button>
          <Button
            variant="ghost"
            className={`flex w-full justify-start p-3 ${isActive("/tools")}`}
            onClick={() => handleNavigation("/tools")}
          >
            <Box className="h-5 w-5 mr-2" />
            備品
          </Button>
          <Button
            variant="ghost"
            className={`flex w-full justify-start p-3 ${isActive("/leave")}`}
            onClick={() => handleNavigation("/leave")}
          >
            <Calendar className="h-4 w-4 mr-2" />
            休暇申請
          </Button>
          <Button
            variant="ghost"
            className={`flex w-full justify-start p-3 ${isActive("/reports")}`}
            onClick={() => handleNavigation("/reports")}
          >
            <FileText className="h-4 w-4 mr-2" />
            現場報告
          </Button>
          {/* 管理者のみユーザー作成メニューを表示 */}
          {isAdmin && (
            <Button
              variant="ghost"
              className={`flex w-full justify-start p-3 ${isActive("/admin/create-user")}`}
              onClick={() => handleNavigation("/admin/create-user")}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              ユーザー作成
            </Button>
          )}
        </div>

        <div className="border-t border-gold/20 p-2 mt-2">
          <Button
            variant="ghost"
            className="flex w-full justify-start gap-3 p-3 text-white hover:bg-destructive hover:text-white"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            <span>ログアウト</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
