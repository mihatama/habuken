"use client"

import { useState, useCallback } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CalendarView } from "@/components/calendar-view"
import { CalendarViewSelector, type ViewType, type TimeframeType } from "@/components/calendar-view-selector"

export default function DashboardClientPage() {
  const [activeView, setActiveView] = useState<ViewType>("project")
  const [timeframe, setTimeframe] = useState<TimeframeType>("month")

  // ビュー変更ハンドラをメモ化
  const handleViewChange = useCallback((view: ViewType) => {
    setActiveView(view)
  }, [])

  // タイムフレーム変更ハンドラをメモ化
  const handleTimeframeChange = useCallback((tf: TimeframeType) => {
    setTimeframe(tf)
  }, [])

  return (
    <DashboardLayout title="Calendar" isAdmin={true}>
      <div className="flex flex-col space-y-6">
        <CalendarViewSelector
          activeView={activeView}
          setActiveView={handleViewChange}
          timeframe={timeframe}
          setTimeframe={handleTimeframeChange}
        />
        <CalendarView activeView={activeView} timeframe={timeframe} />
      </div>
    </DashboardLayout>
  )
}
