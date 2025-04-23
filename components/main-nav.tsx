"use client"

import type * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Calendar, Users, Wrench, Truck, Car, ClipboardList, FileCheck, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MainNav({ className, isAdmin, ...props }: React.HTMLAttributes<HTMLElement> & { isAdmin?: boolean }) {
  const pathname = usePathname()

  return (
    <nav className={cn("hidden md:flex items-center space-x-4 lg:space-x-6 overflow-x-auto", className)} {...props}>
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
      <Button
        variant="outline"
        size="sm"
        className={cn("ml-2", pathname === "/master/project" ? "bg-primary text-primary-foreground" : "")}
        asChild
      >
        <Link href="/master/project">
          <Briefcase className="w-4 h-4 mr-2" />
          <span>案件登録</span>
        </Link>
      </Button>
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
        href="/master/vehicle"
        className={cn(
          "flex items-center text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
          pathname === "/master/vehicle" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <Car className="w-4 h-4 mr-2" />
        <span>車両</span>
      </Link>
      <Link
        href="/tools"
        className={cn(
          "flex items-center text-sm font-medium transition-colors hover:text-primary",
          pathname === "/tools" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <Wrench className="w-4 h-4 mr-2" />
        <span>備品</span>
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
      {isAdmin && (
        <Link
          href="/admin/users"
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            pathname === "/admin/users" ? "text-primary" : "text-muted-foreground",
          )}
        >
          ユーザー管理
        </Link>
      )}
    </nav>
  )
}
