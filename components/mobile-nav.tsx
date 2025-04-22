"use client"

import type * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Calendar, Users, Wrench, Truck, FileCheck, ClipboardList, Settings } from "lucide-react"

export function MobileNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex items-center justify-between overflow-x-auto", className)} {...props}>
      <Link
        href="/dashboard"
        className={cn(
          "flex flex-col items-center justify-center px-2 py-1 text-xs font-medium transition-colors hover:text-primary",
          pathname === "/dashboard" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <Calendar className="w-5 h-5 mb-1" />
        <span>ダッシュボード</span>
      </Link>
      <Link
        href="/staff"
        className={cn(
          "flex flex-col items-center justify-center px-2 py-1 text-xs font-medium transition-colors hover:text-primary",
          pathname === "/staff" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <Users className="w-5 h-5 mb-1" />
        <span>スタッフ</span>
      </Link>
      <Link
        href="/tools"
        className={cn(
          "flex flex-col items-center justify-center px-2 py-1 text-xs font-medium transition-colors hover:text-primary",
          pathname === "/tools" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <Wrench className="w-5 h-5 mb-1" />
        <span>工具</span>
      </Link>
      <Link
        href="/master/heavy"
        className={cn(
          "flex flex-col items-center justify-center px-2 py-1 text-xs font-medium transition-colors hover:text-primary",
          pathname === "/master/heavy" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <Truck className="w-5 h-5 mb-1" />
        <span>重機</span>
      </Link>
      <Link
        href="/leave"
        className={cn(
          "flex flex-col items-center justify-center px-2 py-1 text-xs font-medium transition-colors hover:text-primary",
          pathname === "/leave" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <ClipboardList className="w-5 h-5 mb-1" />
        <span>休暇申請</span>
      </Link>
      <Link
        href="/reports"
        className={cn(
          "flex flex-col items-center justify-center px-2 py-1 text-xs font-medium transition-colors hover:text-primary",
          pathname.startsWith("/reports") ? "text-primary" : "text-muted-foreground",
        )}
      >
        <FileCheck className="w-5 h-5 mb-1" />
        <span>現場報告</span>
      </Link>
      <Link
        href="/settings"
        className={cn(
          "flex flex-col items-center justify-center px-2 py-1 text-xs font-medium transition-colors hover:text-primary",
          pathname === "/settings" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <Settings className="w-5 h-5 mb-1" />
        <span>設定</span>
      </Link>
    </nav>
  )
}
