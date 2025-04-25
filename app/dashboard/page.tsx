import DashboardClientPage from "./DashboardClientPage"
import { logWithTimestamp } from "@/lib/auth-debug"

// ページコンポーネントの先頭に追加
logWithTimestamp("Dashboard page component rendered")

export default function DashboardPage() {
  return <DashboardClientPage />
}
