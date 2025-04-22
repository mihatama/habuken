"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CalendarView } from "@/components/calendar-view"
import { CalendarViewSelector, type ViewType, type TimeframeType } from "@/components/calendar-view-selector"

export default function DashboardClientPage() {
  const [activeView, setActiveView] = useState<ViewType>("project")
  const [timeframe, setTimeframe] = useState<TimeframeType>("month")

  return (
    <DashboardLayout title="Calendar" isAdmin={true}>
      <div className="flex flex-col space-y-6">
        <CalendarViewSelector
          activeView={activeView}
          setActiveView={setActiveView}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
        />
        <CalendarView activeView={activeView} timeframe={timeframe} />
      </div>
    </DashboardLayout>
  )
}
