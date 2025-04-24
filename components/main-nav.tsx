"use client"

import type * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Calendar, Settings, Users, Wrench, Truck, ClipboardList, FileCheck } from "lucide-react"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6 overflow-x-auto", className)} {...props}>
      <Link
        href="/dashboard"
        className={cn(
          "flex items-center text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <Calendar className="w-4 h-4 mr-2" />
        <span>ダッシュボード</span>
      </Link>
      <Link
        href="/staff"
        className={cn(
          "flex items-center text-sm font-medium transition-colors hover:text-primary",
          pathname === "/staff" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <Users className="w-4 h-4 mr-2" />
        <span>スタッフ</span>
      </Link>
      <Link
        href="/tools"
        className={cn(
          "flex items-center text-sm font-medium transition-colors hover:text-primary",
          pathname === "/tools" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <Wrench className="w-4 h-4 mr-2" />
        <span>工具</span>
      </Link>
      <Link
        href="/master/heavy"
        className={cn(
          "flex items-center text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
          pathname === "/master/heavy" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <Truck className="w-4 h-4 mr-2" />
        <span>重機</span>
      </Link>
      <Link
        href="/leave"
        className={cn(
          "flex items-center text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
          pathname === "/leave" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <ClipboardList className="w-4 h-4 mr-2" />
        <span>休暇申請</span>
      </Link>
      <Link
        href="/reports"
        className={cn(
          "flex items-center text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
          pathname.startsWith("/reports") ? "text-primary" : "text-muted-foreground",
        )}
      >
        <FileCheck className="w-4 h-4 mr-2" />
        <span>現場報告</span>
      </Link>
      <Link
        href="/settings"
        className={cn(
          "flex items-center text-sm font-medium transition-colors hover:text-primary",
          pathname === "/settings" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <Settings className="w-4 h-4 mr-2" />
        <span>設定</span>
      </Link>
    </nav>
  )
}
