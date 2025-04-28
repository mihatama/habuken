"use client"

import type * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { getNavItems } from "@/components/navigation/nav-items"

export function MobileNav({
  className,
  isAdmin = false,
  ...props
}: React.HTMLAttributes<HTMLElement> & { isAdmin?: boolean }) {
  const pathname = usePathname()
  const navItems = getNavItems()

  return (
    <nav className={cn("flex md:hidden items-center justify-between overflow-x-auto", className)} {...props}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex flex-col items-center justify-center px-2 py-1 text-xs font-medium transition-colors hover:text-primary",
            item.matchPath?.(pathname) ? "text-primary" : "text-muted-foreground",
          )}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
