import type React from "react"
import { Header } from "@/components/header"

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  isAdmin?: boolean // isAdminプロパティを追加（オプショナルに設定）
}

export function DashboardLayout({ children, title, isAdmin = false }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {title && (
          <div className="border-b">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold">{title}</h1>
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
