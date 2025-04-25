"use client"

import type React from "react"

import { Header } from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  isAdmin?: boolean
}

export function DashboardLayout({ children, title, isAdmin = false }: DashboardLayoutProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
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
