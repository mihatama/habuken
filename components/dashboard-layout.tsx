import { Header } from "@/components/header"
import type React from "react"

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  isAdmin?: boolean
  className?: string
  description?: string
}

export function DashboardLayout({ children, title, description, isAdmin = false, className }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container flex-1">
        <main className="flex w-full flex-col overflow-hidden p-4 md:py-8">
          {title && <h1 className="mb-2 text-2xl font-bold">{title}</h1>}
          {description && <p className="text-muted-foreground mb-6">{description}</p>}
          {children}
        </main>
      </div>
    </div>
  )
}
