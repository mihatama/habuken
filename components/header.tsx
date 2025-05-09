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
import { ThemeToggle } from "@/components/theme-toggle"
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
  }, [])

  // ユーザーが管理者かどうかを確認
  const isAdmin = user?.user_metadata?.role === "admin"

  // デバッグ用
  useEffect(() => {
    if (user) {
      console.log("Header - ユーザーロール:", user.user_metadata?.role)
      console.log("Header - 管理者判定:", isAdmin)
    }
  }, [user, isAdmin])

  // プログラムによるナビゲーション関数
  const handleNavigation = (path: string) => {
    try {
      console.log(`${path} へ遷移します`)
      // 現在のパスと同じ場合は何もしない
      if (pathname === path) {
        console.log("既に同じページにいます")
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
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center mr-6"
            onClick={(e) => {
              e.preventDefault()
              router.push("/")
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
            {/* ナビゲーションリンクにアイコンを追加 */}
            <div className="flex items-center space-x-6">
              <Link
                href="/dashboard"
                className={`transition-colors ${isActive("/dashboard")} flex items-center gap-1`}
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/dashboard")
                }}
              >
                <LayoutDashboard className="h-4 w-4" />
                一覧表示
              </Link>
              <Link
                href="/deals"
                className={`transition-colors ${isActive("/deals")} flex items-center gap-1`}
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/deals")
                }}
              >
                <Briefcase className="h-4 w-4" />
                現場
              </Link>
              <Link
                href="/master/staff"
                className={`transition-colors ${isActive("/master/staff")} flex items-center gap-1`}
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/master/staff")
                }}
              >
                <Users className="h-4 w-4" />
                スタッフ
              </Link>
              <Link
                href="/master/heavy"
                className={`transition-colors ${isActive("/master/heavy")} flex items-center gap-1`}
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/master/heavy")
                }}
              >
                <Truck className="h-4 w-4" />
                重機
              </Link>
              <Link
                href="/master/vehicle"
                className={`transition-colors ${isActive("/master/vehicle")} flex items-center gap-1`}
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/master/vehicle")
                }}
              >
                <Car className="h-4 w-4" />
                車両
              </Link>
              <Link
                href="/tools"
                className={`transition-colors ${isActive("/tools")} flex items-center gap-1`}
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/tools")
                }}
              >
                <Package className="h-4 w-4" />
                備品
              </Link>
              <Link
                href="/leave"
                className={`transition-colors ${isActive("/leave")} flex items-center gap-1`}
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/leave")
                }}
              >
                <Calendar className="h-4 w-4" />
                休暇申請
              </Link>
              <Link
                href="/reports"
                className={`transition-colors ${isActive("/reports")} flex items-center gap-1`}
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/reports")
                }}
              >
                <FileText className="h-4 w-4" />
                現場報告
              </Link>
              {/* 管理者のみユーザー作成メニューを表示 */}
              {isAdmin && (
                <Link
                  href="/admin/create-user"
                  className={`transition-colors ${isActive("/admin/create-user")} flex items-center gap-1`}
                  onClick={(e) => {
                    e.preventDefault()
                    router.push("/admin/create-user")
                  }}
                >
                  <UserPlus className="h-4 w-4" />
                  ユーザー作成
                </Link>
              )}
            </div>
            <div className="flex items-center">
              <div className="mr-4">
                <ThemeToggle />
              </div>
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
              onClick={() => {
                // 既に開いていたら無視
                if (isMobileNavOpen) return
                setIsMobileNavOpen(true)
              }}
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
