"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function DealsTabs() {
  const pathname = usePathname()

  const tabs = [
    {
      name: "現場リスト",
      href: "/deals",
      icon: "📋",
      current: pathname === "/deals",
    },
    {
      name: "カレンダー",
      href: "/deals/calendar",
      icon: "📅",
      current: pathname === "/deals/calendar",
    },
    {
      name: "現場登録",
      href: "/deals/register",
      icon: "✏️",
      current: pathname === "/deals/register",
    },
  ]

  return (
    <div className="border rounded-lg overflow-hidden mb-6">
      <div className="grid grid-cols-3">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            href={tab.href}
            className={cn(
              "flex items-center justify-center py-3 px-4 text-center hover:bg-muted/50 transition-colors",
              tab.current ? "bg-muted font-medium" : "text-muted-foreground",
            )}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
