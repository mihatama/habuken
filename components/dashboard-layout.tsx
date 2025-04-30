"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Header } from "@/components/header"
import { getClientSupabase } from "@/lib/supabase-utils"

interface DashboardLayoutProps {
  children?: React.ReactNode
  title?: string
  description?: string
  isAdmin?: boolean
}

export function DashboardLayout({ children, title, description, isAdmin = false }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)
        // シングルトンパターンを使用
        const supabase = getClientSupabase()

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/login")
          return
        }

        // 管理者ページの場合は権限チェック
        if (isAdmin) {
          const { data: userData, error } = await supabase
            .from("users")
            .select("role")
            .eq("id", session.user.id)
            .single()

          if (error || userData?.role !== "admin") {
            router.push("/dashboard")
            return
          }
        }

        setUser(session.user)
      } catch (error) {
        console.error("認証チェックエラー:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, isAdmin, pathname])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      <main className="flex-1 p-6 pt-16">
        <div className="mx-auto max-w-7xl">
          {title && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              {description && <p className="mt-2 text-muted-foreground">{description}</p>}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}
