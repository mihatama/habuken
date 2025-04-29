"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getClientSupabase } from "@/lib/supabase-utils"

export function MobileNav({ isOpen, onClose }) {
  const router = useRouter()

  // ESCキーでナビゲーションを閉じる
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose])

  // 画面外クリックでナビゲーションを閉じる
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const handleSignOut = async () => {
    try {
      const supabase = getClientSupabase()
      await supabase.auth.signOut()
      onClose()
      router.push("/login")
    } catch (error) {
      console.error("サインアウトエラー:", error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background p-6 md:hidden">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center space-x-2" onClick={onClose}>
          <span className="text-xl font-bold">建設業務管理</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <span className="sr-only">閉じる</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>
      <nav className="mt-6 flex flex-col space-y-4">
        <Link href="/dashboard" className="text-lg font-medium" onClick={onClose}>
          ダッシュボード
        </Link>
        <Link href="/master/project" className="text-lg font-medium" onClick={onClose}>
          案件管理
        </Link>
        <Link href="/master/staff" className="text-lg font-medium" onClick={onClose}>
          スタッフ管理
        </Link>
        <Link href="/tools" className="text-lg font-medium" onClick={onClose}>
          備品管理
        </Link>
        <Link href="/reports" className="text-lg font-medium" onClick={onClose}>
          レポート
        </Link>
        <Link href="/settings" className="text-lg font-medium" onClick={onClose}>
          設定
        </Link>
        <Button variant="outline" onClick={handleSignOut}>
          ログアウト
        </Button>
      </nav>
    </div>
  )
}
