"use client"

import type React from "react"

import { Header } from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  isAdmin?: boolean
}

export function DashboardLayout({ children, title, isAdmin = false }: DashboardLayoutProps) {
  const { user, loading, isAdmin: userIsAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }

    // 管理者権限が必要なページで、ユーザーが管理者でない場合
    if (!loading && isAdmin && !userIsAdmin) {
      router.push("/dashboard")
    }
  }, [user, loading, router, isAdmin, userIsAdmin])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container mx-auto flex-1 p-4 md:p-6">
        {title && <h1 className="mb-6 text-2xl font-bold">{title}</h1>}
        {children}
      </div>
    </div>
  )
}
