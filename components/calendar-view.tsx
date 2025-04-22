"use client"

import { useState, useEffect } from "react"
import { ProjectCalendar } from "@/components/project-calendar"
import { StaffCalendar } from "@/components/staff-calendar"
import { ToolCalendar } from "@/components/tool-calendar"
import { CalendarViewSelector, type ViewType, type TimeframeType } from "@/components/calendar-view-selector"

// CalendarViewProps インターフェースを更新して、activeView と timeframe プロパティも受け入れるようにします
interface CalendarViewProps {
  initialView?: ViewType
  initialTimeframe?: TimeframeType
  activeView?: ViewType
  timeframe?: TimeframeType
}

// コンポーネントの引数を更新して、新しいプロパティを使用します
export function CalendarView({
  initialView = "project",
  initialTimeframe = "month",
  activeView: externalActiveView,
  timeframe: externalTimeframe,
}: CalendarViewProps) {
  const [activeView, setActiveView] = useState<ViewType>(externalActiveView || initialView)
  const [timeframe, setTimeframe] = useState<TimeframeType>(externalTimeframe || initialTimeframe)

  // 外部から提供された値が変更された場合に状態を更新
  useEffect(() => {
    if (externalActiveView) {
      setActiveView(externalActiveView)
    }
  }, [externalActiveView])

  useEffect(() => {
    if (externalTimeframe) {
      setTimeframe(externalTimeframe)
    }
  }, [externalTimeframe])

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
