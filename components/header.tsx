"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

export function Header() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <>
          <MainNav />
          <MobileNav />
        </>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">{/* 検索フォームなどがあればここに */}</div>
          <nav className="flex items-center space-x-2">
            {user ? (
              <>
                <ThemeToggle />
                <UserNav />
              </>
            ) : (
              <>
                <ThemeToggle />
                {pathname !== "/login" && (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/login">ログイン</Link>
                  </Button>
                )}
                {pathname !== "/signup" && (
                  <Button asChild size="sm">
                    <Link href="/signup">新規登録</Link>
                  </Button>
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
