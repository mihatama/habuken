"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"
import { UserNav } from "@/components/user-nav"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { Menu } from "lucide-react"

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

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
    <header className="fixed top-0 z-40 w-full border-b border-gold bg-darkgray">
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
              <Image
                src="/favicon.ico"
                alt="現助ロゴ"
                width={24}
                height={24}
                className="border-2 border-white rounded-full"
              />
            </div>
            <span style={{ fontFamily: "'Noto Serif JP', serif" }} className="text-xl font-bold text-gold">
              現助
            </span>
          </Link>
        </div>

        {!loading && user && (
          <nav className="hidden md:flex md:flex-1 md:items-center md:justify-between">
            <div className="flex items-center space-x-6">
              <Link
                href="/dashboard"
                className={`transition-colors ${isActive("/dashboard")}`}
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/dashboard")
                }}
              >
                ダッシュボード
              </Link>
              <Link
                href="/deals"
                className={`transition-colors ${isActive("/deals")}`}
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/deals")
                }}
              >
                案件
              </Link>
              <Link
                href="/master/staff"
                className={`transition-colors ${isActive("/master/staff")}`}
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/master/staff")
                }}
              >
                スタッフ
              </Link>
              <Link
                href="/master/heavy"
                className={`transition-colors ${isActive("/master/heavy")}`}
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/master/heavy")
                }}
              >
                重機
              </Link>
              <Link
                href="/master/vehicle"
                className={`transition-colors ${isActive("/master/vehicle")}`}
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/master/vehicle")
                }}
              >
                車両
              </Link>
              <Link
                href="/tools"
                className={`transition-colors ${isActive("/tools")}`}
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/tools")
                }}
              >
                備品
              </Link>
              <Link
                href="/leave"
                className={`transition-colors ${isActive("/leave")}`}
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/leave")
                }}
              >
                休暇申請
              </Link>
              <Link
                href="/reports"
                className={`transition-colors ${isActive("/reports")}`}
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/reports")
                }}
              >
                現場報告
              </Link>
            </div>
            <div className="flex items-center">
              <UserNav user={user} />
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
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
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
