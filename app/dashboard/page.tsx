import { CalendarView } from "@/components/calendar-view"
import { DashboardLayout } from "@/components/dashboard-layout"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })

  // 必要なデータをサーバーサイドで取得する場合はここに追加

  return (
    <DashboardLayout title="カレンダー">
      <CalendarView />
    </DashboardLayout>
  )
}
