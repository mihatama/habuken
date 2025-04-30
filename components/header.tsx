"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"
import { UserNav } from "@/components/user-nav"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

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

      // 強制的にページをリロード
      window.location.href = path
    } catch (error) {
      console.error("ナビゲーションエラー:", error)
    }
  }

  return (
    <header className="fixed top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center">
          <a
            href="/"
            className="flex items-center space-x-2"
            onClick={(e) => {
              e.preventDefault()
              handleNavigation("/")
            }}
          >
            <span className="text-xl font-bold">建設業務管理</span>
          </a>
          <nav className="hidden md:ml-10 md:flex md:items-center md:space-x-4">
            {!loading && user && (
              <>
                <a
                  href="/dashboard"
                  className="text-sm font-medium transition-colors hover:text-primary"
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavigation("/dashboard")
                  }}
                >
                  ダッシュボード
                </a>
                <a
                  href="/master/project"
                  className="text-sm font-medium transition-colors hover:text-primary"
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavigation("/master/project")
                  }}
                >
                  案件管理
                </a>
                <a
                  href="/master/staff"
                  className="text-sm font-medium transition-colors hover:text-primary"
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavigation("/master/staff")
                  }}
                >
                  スタッフ管理
                </a>
                <a
                  href="/tools"
                  className="text-sm font-medium transition-colors hover:text-primary"
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavigation("/tools")
                  }}
                >
                  備品管理
                </a>
                <a
                  href="/reports"
                  className="text-sm font-medium transition-colors hover:text-primary"
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavigation("/reports")
                  }}
                >
                  レポート
                </a>
                <a
                  href="/settings"
                  className="text-sm font-medium transition-colors hover:text-primary"
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavigation("/settings")
                  }}
                >
                  設定
                </a>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          {loading ? (
            <Skeleton className="h-10 w-10 rounded-full" />
          ) : user ? (
            <>
              <UserNav user={user} />
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              >
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
            </>
          ) : (
            <Button onClick={() => handleNavigation("/login")}>ログイン</Button>
          )}
        </div>
      </div>
      {user && <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />}
    </header>
  )
}
