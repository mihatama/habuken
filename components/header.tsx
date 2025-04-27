"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { useAuth } from "@/contexts/auth-context"
import { Calendar, Briefcase, Users, Truck, Car, Wrench, ClipboardList, FileCheck, Settings } from "lucide-react"

export function Header() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-6 flex items-center">
          <Link href="/" className="flex items-center">
            <span className="font-kaisho text-3xl font-bold">現助</span>
          </Link>
        </div>

        <nav className="flex items-center space-x-4 lg:space-x-6">
          <Link
            href="/dashboard"
            className={`flex items-center flex-col text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Calendar className="h-5 w-5 mb-1" />
            <span>ダッシュボード</span>
          </Link>

          <Link
            href="/master/project"
            className={`flex items-center flex-col text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/master/project" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Briefcase className="h-5 w-5 mb-1" />
            <span>案件登録</span>
          </Link>

          <Link
            href="/master/staff"
            className={`flex items-center flex-col text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/master/staff" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Users className="h-5 w-5 mb-1" />
            <span>スタッフ</span>
          </Link>

          <Link
            href="/master/heavy"
            className={`flex items-center flex-col text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/master/heavy" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Truck className="h-5 w-5 mb-1" />
            <span>重機</span>
          </Link>

          <Link
            href="/master/vehicle"
            className={`flex items-center flex-col text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/master/vehicle" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Car className="h-5 w-5 mb-1" />
            <span>車両</span>
          </Link>

          <Link
            href="/tools"
            className={`flex items-center flex-col text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/tools" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Wrench className="h-5 w-5 mb-1" />
            <span>備品</span>
          </Link>

          <Link
            href="/leave"
            className={`flex items-center flex-col text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/leave" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <ClipboardList className="h-5 w-5 mb-1" />
            <span>休暇申請</span>
          </Link>

          <Link
            href="/reports"
            className={`flex items-center flex-col text-sm font-medium transition-colors hover:text-primary ${
              pathname.startsWith("/reports") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <FileCheck className="h-5 w-5 mb-1" />
            <span>現場報告</span>
          </Link>

          <Link
            href="/settings"
            className={`flex items-center flex-col text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/settings" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Settings className="h-5 w-5 mb-1" />
            <span>設定</span>
          </Link>
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          {user && <UserNav />}
        </div>
      </div>
    </header>
  )
}
