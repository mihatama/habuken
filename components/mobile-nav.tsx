"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getClientSupabase } from "@/lib/supabase-utils"
import { Calendar, Briefcase, Users, Truck, Car, Key, ClipboardList, FileText, Settings, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function MobileNav({ isOpen, onClose }) {
  const router = useRouter()
  const { user } = useAuth()

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
      window.location.href = "/login"
    } catch (error) {
      console.error("サインアウトエラー:", error)
    }
  }

  const handleNavigation = (path) => {
    window.location.href = path
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background p-6 md:hidden">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center"
          onClick={(e) => {
            e.preventDefault()
            handleNavigation("/")
          }}
        >
          <span className="text-xl font-bold">現助</span>
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

      {!user ? (
        <div className="mt-6 p-4 border rounded-lg">
          <h3 className="text-lg font-medium mb-4">システムにアクセス</h3>
          <Button className="w-full" onClick={() => router.push("/login")}>
            ログイン
          </Button>
        </div>
      ) : (
        <nav className="mt-6 flex flex-col space-y-4">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 text-lg font-medium"
            onClick={(e) => {
              e.preventDefault()
              handleNavigation("/dashboard")
            }}
          >
            <Calendar className="h-5 w-5" />
            <span>ダッシュボード</span>
          </Link>
          <Link
            href="/master/project"
            className="flex items-center space-x-2 text-lg font-medium"
            onClick={(e) => {
              e.preventDefault()
              handleNavigation("/master/project")
            }}
          >
            <Briefcase className="h-5 w-5" />
            <span>案件登録</span>
          </Link>
          <Link
            href="/master/staff"
            className="flex items-center space-x-2 text-lg font-medium"
            onClick={(e) => {
              e.preventDefault()
              handleNavigation("/master/staff")
            }}
          >
            <Users className="h-5 w-5" />
            <span>スタッフ</span>
          </Link>
          <Link
            href="/master/heavy"
            className="flex items-center space-x-2 text-lg font-medium"
            onClick={(e) => {
              e.preventDefault()
              handleNavigation("/master/heavy")
            }}
          >
            <Truck className="h-5 w-5" />
            <span>重機</span>
          </Link>
          <Link
            href="/master/vehicle"
            className="flex items-center space-x-2 text-lg font-medium"
            onClick={(e) => {
              e.preventDefault()
              handleNavigation("/master/vehicle")
            }}
          >
            <Car className="h-5 w-5" />
            <span>車両</span>
          </Link>
          <Link
            href="/tools"
            className="flex items-center space-x-2 text-lg font-medium"
            onClick={(e) => {
              e.preventDefault()
              handleNavigation("/tools")
            }}
          >
            <Key className="h-5 w-5" />
            <span>備品</span>
          </Link>
          <Link
            href="/leave"
            className="flex items-center space-x-2 text-lg font-medium"
            onClick={(e) => {
              e.preventDefault()
              handleNavigation("/leave")
            }}
          >
            <ClipboardList className="h-5 w-5" />
            <span>休暇申請</span>
          </Link>
          <Link
            href="/reports"
            className="flex items-center space-x-2 text-lg font-medium"
            onClick={(e) => {
              e.preventDefault()
              handleNavigation("/reports")
            }}
          >
            <FileText className="h-5 w-5" />
            <span>現場報告</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center space-x-2 text-lg font-medium"
            onClick={(e) => {
              e.preventDefault()
              handleNavigation("/settings")
            }}
          >
            <Settings className="h-5 w-5" />
            <span>設定</span>
          </Link>
          <Button variant="outline" className="flex items-center justify-center space-x-2" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
            <span>ログアウト</span>
          </Button>
        </nav>
      )}
    </div>
  )
}
