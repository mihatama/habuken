"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"
import { UserNav } from "@/components/user-nav"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Briefcase, Users, Truck, Car, Key, ClipboardList, FileText, Settings } from "lucide-react"

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  // デバッグ用のログ
  useEffect(() => {
    console.log("Header rendering with user:", user)
    console.log("Current pathname:", pathname)
  }, [user, pathname])

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

  return (
    <header className="fixed top-0 z-40 w-full border-b bg-background">
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
            <span className="text-xl font-bold">現助</span>
          </Link>
        </div>

        {!loading && user && (
          <nav className="hidden md:flex md:flex-1 md:items-center md:justify-between">
            <div className="flex items-center space-x-6">
              <Link
                href="/dashboard"
                className="flex flex-col items-center text-sm font-medium transition-colors hover:text-primary"
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/dashboard")
                }}
              >
                <Calendar className="h-5 w-5 mb-1" />
                <span>ダッシュボード</span>
              </Link>
              <Link
                href="/deals/register"
                className="flex flex-col items-center text-sm font-medium transition-colors hover:text-primary"
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/deals/register")
                }}
              >
                <Briefcase className="h-5 w-5 mb-1" />
                <span>案件</span>
              </Link>
              <Link
                href="/master/staff"
                className="flex flex-col items-center text-sm font-medium transition-colors hover:text-primary"
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/master/staff")
                }}
              >
                <Users className="h-5 w-5 mb-1" />
                <span>スタッフ</span>
              </Link>
              <Link
                href="/master/heavy"
                className="flex flex-col items-center text-sm font-medium transition-colors hover:text-primary"
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/master/heavy")
                }}
              >
                <Truck className="h-5 w-5 mb-1" />
                <span>重機</span>
              </Link>
              <Link
                href="/master/vehicle"
                className="flex flex-col items-center text-sm font-medium transition-colors hover:text-primary"
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/master/vehicle")
                }}
              >
                <Car className="h-5 w-5 mb-1" />
                <span>車両</span>
              </Link>
              <Link
                href="/tools"
                className="flex flex-col items-center text-sm font-medium transition-colors hover:text-primary"
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/tools")
                }}
              >
                <Key className="h-5 w-5 mb-1" />
                <span>備品</span>
              </Link>
              <Link
                href="/leave"
                className="flex flex-col items-center text-sm font-medium transition-colors hover:text-primary"
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/leave")
                }}
              >
                <ClipboardList className="h-5 w-5 mb-1" />
                <span>休暇申請</span>
              </Link>
              <Link
                href="/reports"
                className="flex flex-col items-center text-sm font-medium transition-colors hover:text-primary"
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/reports")
                }}
              >
                <FileText className="h-5 w-5 mb-1" />
                <span>現場報告</span>
              </Link>
              <Link
                href="/settings"
                className="flex flex-col items-center text-sm font-medium transition-colors hover:text-primary"
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/settings")
                }}
              >
                <Settings className="h-5 w-5 mb-1" />
                <span>設定</span>
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
            <Button variant="outline" onClick={() => router.push("/login")}>
              ログイン
            </Button>
          </div>
        ) : (
          <div className="ml-auto md:hidden">
            <Button variant="outline" size="icon" onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}>
              <span className="sr-only">メニューを開く</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        )}
      </div>
      {user && <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />}
    </header>
  )
}
