"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"
import { UserNav } from "@/components/user-nav"
import { useAuth } from "@/contexts/auth-context"

export function Header() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  return (
    <header className="fixed top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold">建設業務管理</span>
          </Link>
          <nav className="hidden md:ml-10 md:flex md:items-center md:space-x-4">
            <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
              ダッシュボード
            </Link>
            <Link href="/master/project" className="text-sm font-medium transition-colors hover:text-primary">
              案件管理
            </Link>
            <Link href="/master/staff" className="text-sm font-medium transition-colors hover:text-primary">
              スタッフ管理
            </Link>
            <Link href="/tools" className="text-sm font-medium transition-colors hover:text-primary">
              備品管理
            </Link>
            <Link href="/reports" className="text-sm font-medium transition-colors hover:text-primary">
              レポート
            </Link>
            <Link href="/settings" className="text-sm font-medium transition-colors hover:text-primary">
              設定
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          {loading ? (
            // ローディング中は骨格UIを表示
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200"></div>
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
            <Button onClick={() => router.push("/login")}>ログイン</Button>
          )}
        </div>
      </div>
      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
    </header>
  )
}
