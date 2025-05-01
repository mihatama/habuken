import { DealsTabs } from "@/components/deals-tabs"
import { DealResourceCalendar } from "@/components/deal-resource-calendar"

export const metadata = {
  title: "案件カレンダー",
  description: "案件カレンダー表示",
}

export default function DealsCalendarPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">案件管理</h1>

      <DealsTabs />

      <DealResourceCalendar />
    </div>
  )
}
