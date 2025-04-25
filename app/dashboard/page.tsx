import { Suspense } from "react"
import { EmergencyDashboard } from "./emergency-dashboard"

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">ダッシュボードを読み込み中...</div>}>
      <EmergencyDashboard />
    </Suspense>
  )
}
