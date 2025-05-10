"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"
import { UserNav } from "@/components/user-nav"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
// Lucideアイコンをインポート
import {
  Menu,
  LayoutDashboard,
  Briefcase,
  Users,
  Truck,
  Car,
  Package,
  Calendar,
  FileText,
  UserPlus,
} from "lucide-react"
import { InstallButton } from "@/components/pwa-install-prompt"

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, refreshUserData } = useAuth()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  // コンポーネントマウント時にユーザーデータを更新
  useEffect(() => {
    if (user) {
      refreshUserData()
    }
  }, [refreshUserData, user])

  // ユーザーが管理者かどうかを確認
  const isAdmin = user?.user_metadata?.role === "admin"

  // プログラムによるナビゲーション関数
  const handleNavigation = (path: string) => {
    try {
      // 現在のパスと同じ場合は何もしない
      if (pathname === path) {
        return
      }

      // Next.jsのルーターを使用
      router.push(path)
    } catch (error) {
      console.error("ナビゲーションエラー:", error)
    }
  }

  const isActive = (path: string) => {
    return pathname === path ? "text-gold font-medium" : "text-white hover:text-gold font-medium"
  }

  return (
    <header className="fixed top-0 z-40 w-full border-b border-gold bg-gray-600/80">
      <div className="container flex h-16 items-center px-2 sm:px-4">
        <div className="flex items-center">
          <Link
            href="/dashboard"
            className="flex items-center mr-6"
            onClick={(e) => {
              e.preventDefault()
              router.push("/dashboard")
            }}
          >
            <div className="mr-2 p-0.5">
              <Image src="/habuken-logo.png" alt="現助ロゴ" width={28} height={28} className="rounded-full" />
            </div>
            <span style={{ fontFamily: "'Noto Serif JP', serif" }} className="text-xl font-bold text-gold">
              現助
            </span>
          </Link>
        </div>

        {!loading && user && (
          <nav className="hidden md:flex md:flex-1 md:items-center md:justify-between">
            {/* ナビゲーションリンク */}
            <div className="flex items-center space-x-4 overflow-x-auto nav-links">
              <Button
                variant="ghost"
                className={`nav-link ${isActive("/dashboard")}`}
                onClick={() => handleNavigation("/dashboard")}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                一覧表示
              </Button>
              <Button
                variant="ghost"
                className={`nav-link ${isActive("/deals")}`}
                onClick={() => handleNavigation("/deals")}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                現場
              </Button>
              <Button
                variant="ghost"
                className={`nav-link ${isActive("/master/staff")}`}
                onClick={() => handleNavigation("/master/staff")}
              >
                <Users className="h-4 w-4 mr-2" />
                スタッフ
              </Button>
              <Button
                variant="ghost"
                className={`nav-link ${isActive("/master/heavy")}`}
                onClick={() => handleNavigation("/master/heavy")}
              >
                <Truck className="h-4 w-4 mr-2" />
                重機
              </Button>
              <Button
                variant="ghost"
                className={`nav-link ${isActive("/master/vehicle")}`}
                onClick={() => handleNavigation("/master/vehicle")}
              >
                <Car className="h-4 w-4 mr-2" />
                車両
              </Button>
              <Button
                variant="ghost"
                className={`nav-link ${isActive("/tools")}`}
                onClick={() => handleNavigation("/tools")}
              >
                <Package className="h-4 w-4 mr-2" />
                備品
              </Button>
              <Button
                variant="ghost"
                className={`nav-link ${isActive("/leave")}`}
                onClick={() => handleNavigation("/leave")}
              >
                <Calendar className="h-4 w-4 mr-2" />
                休暇申請
              </Button>
              <Button
                variant="ghost"
                className={`nav-link ${isActive("/reports")}`}
                onClick={() => handleNavigation("/reports")}
              >
                <FileText className="h-4 w-4 mr-2" />
                現場報告
              </Button>
              {/* 管理者のみユーザー作成メニューを表示 */}
              {isAdmin && (
                <Button
                  variant="ghost"
                  className={`nav-link ${isActive("/admin/create-user")}`}
                  onClick={() => handleNavigation("/admin/create-user")}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  ユーザー作成
                </Button>
              )}
            </div>
            <div className="flex items-center ml-4">
              <div className="flex items-center gap-2">
                <InstallButton />
                <UserNav user={user} />
              </div>
            </div>
          </nav>
        )}

        {loading ? (
          <div className="ml-auto">
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        ) : !user ? (
          <div className="ml-auto">
            <Button variant="gold" onClick={() => router.push("/login")}>
              ログイン
            </Button>
          </div>
        ) : (
          <div className="ml-auto md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileNavOpen(true)}
              className="text-white hover:bg-darkgray-light hover:text-gold"
            >
              <span className="sr-only">メニューを開く</span>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>
      {user && <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />}
    </header>
  )
}
