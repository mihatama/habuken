import { CalendarView } from "@/components/calendar-view"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function DashboardPage() {
  return (
    <DashboardLayout title="カレンダー">
      <CalendarView />
    </DashboardLayout>
  )
}
