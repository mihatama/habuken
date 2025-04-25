"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"
import Link from "next/link"
import DashboardClientPage from "./DashboardClientPage"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"

export function EmergencyDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showOriginalDashboard, setShowOriginalDashboard] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function getUser() {
      try {
        console.log("ダッシュボード: ユーザー情報を取得中...")
        const { data, error } = await supabase.auth.getUser()

        if (error) {
          console.error("認証エラー:", error.message)
          setError(error.message)
          return
        }

        if (data?.user) {
          console.log("ユーザー情報取得成功:", data.user.email)
          setUser(data.user)

          // ユーザー情報が取得できたら、元のダッシュボードを表示する準備をする
          setTimeout(() => {
            setShowOriginalDashboard(true)
          }, 500)
        } else {
          console.log("ユーザー情報なし")
          setError("認証されていません。ログインしてください。")
        }
      } catch (err) {
        console.error("ユーザー情報取得エラー:", err)
        setError("ユーザー情報の取得中にエラーが発生しました。")
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [supabase.auth])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = "/login"
    } catch (err) {
      console.error("ログアウトエラー:", err)
    }
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg">ユーザー情報を読み込み中...</p>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>認証エラー</AlertTitle>
          <AlertDescription>{error || "認証されていません。ログインしてください。"}</AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Button onClick={handleRefresh} className="w-full">
            ページを再読み込み
          </Button>

          <Link href="/login" className="block w-full">
            <Button variant="outline" className="w-full">
              ログインページに移動
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // 元のダッシュボードを表示する場合
  if (showOriginalDashboard) {
    return <DashboardClientPage />
  }

  // 認証成功したが、まだ元のダッシュボードを表示する準備ができていない場合
  return (
    <div>
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <MainNav isAdmin={user.email === "admin@example.com"} className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 mt-4">
        <Alert className="mb-6 bg-green-50 border-green-200">
          <Info className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">認証成功</AlertTitle>
          <AlertDescription>
            {user.email} として正常にログインしました。ダッシュボードを読み込んでいます...
          </AlertDescription>
        </Alert>

        <div className="text-center mt-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
          <p>ダッシュボードを準備しています...</p>
          <Button onClick={() => setShowOriginalDashboard(true)} className="mt-4">
            今すぐダッシュボードを表示
          </Button>
        </div>
      </div>
    </div>
  )
}
