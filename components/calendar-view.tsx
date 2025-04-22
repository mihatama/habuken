"use client"

import { useState } from "react"
import { ProjectCalendar } from "@/components/project-calendar"
import { StaffCalendar } from "@/components/staff-calendar"
import { ToolCalendar } from "@/components/tool-calendar"
import { CalendarViewSelector, type ViewType, type TimeframeType } from "@/components/calendar-view-selector"

// カレンダービューのprops型定義
interface CalendarViewProps {
  initialView?: ViewType
  initialTimeframe?: TimeframeType
}

export function CalendarView({ initialView = "project", initialTimeframe = "month" }: CalendarViewProps) {
  const [activeView, setActiveView] = useState<ViewType>(initialView)
  const [timeframe, setTimeframe] = useState<TimeframeType>(initialTimeframe)

  return (
    <div className="space-y-6">
      <CalendarViewSelector
        activeView={activeView}
        setActiveView={setActiveView}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
      />

      <div className="mt-6">
        {activeView === "project" && <ProjectCalendar />}
        {activeView === "staff" && <StaffCalendar />}
        {activeView === "resource" && <ToolCalendar />}
        {activeView === "timeline" && <div>Timeline View (Coming Soon)</div>}
      </div>
    </div>
  )
}
