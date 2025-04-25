import { Suspense } from "react"
import DashboardClientPage from "./DashboardClientPage"
import { logWithTimestamp } from "@/lib/auth-debug"

export default function DashboardPage() {
  // サーバーサイドでのログ
  logWithTimestamp("DashboardPage: サーバーサイドレンダリング開始")

  return (
    <Suspense fallback={<div className="p-8 text-center">ダッシュボードを読み込み中...</div>}>
      <DashboardClientPage />
    </Suspense>
  )
}
