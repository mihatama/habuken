"use client"

import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Truck, Clock } from "lucide-react"

export type ViewType = "project" | "staff" | "resource" | "timeline"
export type TimeframeType = "month" | "week"

interface CalendarViewSelectorProps {
  activeView: ViewType
  setActiveView: (view: ViewType) => void
  timeframe: TimeframeType
  setTimeframe: (timeframe: TimeframeType) => void
}

export function CalendarViewSelector({
  activeView,
  setActiveView,
  timeframe,
  setTimeframe,
}: CalendarViewSelectorProps) {
  // ビュー変更ハンドラをメモ化
  const handleViewChange = useCallback(
    (view: ViewType) => {
      setActiveView(view)
    },
    [setActiveView],
  )

  // タイムフレーム変更ハンドラをメモ化
  const handleTimeframeChange = useCallback(
    (tf: TimeframeType) => {
      setTimeframe(tf)
    },
    [setTimeframe],
  )

  return (
    <div className="flex flex-wrap gap-2 justify-between">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeView === "project" ? "default" : "outline"}
          className="text-base h-12 px-4"
          onClick={() => handleViewChange("project")}
        >
          <Calendar className="mr-2 h-5 w-5" />
          Project View
        </Button>
        <Button
          variant={activeView === "staff" ? "default" : "outline"}
          className="text-base h-12 px-4"
          onClick={() => handleViewChange("staff")}
        >
          <Users className="mr-2 h-5 w-5" />
          Staff View
        </Button>
        <Button
          variant={activeView === "resource" ? "default" : "outline"}
          className="text-base h-12 px-4"
          onClick={() => handleViewChange("resource")}
        >
          <Truck className="mr-2 h-5 w-5" />
          Resource View
        </Button>
        <Button
          variant={activeView === "timeline" ? "default" : "outline"}
          className="text-base h-12 px-4"
          onClick={() => handleViewChange("timeline")}
        >
          <Clock className="mr-2 h-5 w-5" />
          Timeline View
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant={timeframe === "month" ? "default" : "outline"}
          className="text-base h-12 px-4"
          onClick={() => handleTimeframeChange("month")}
        >
          Month
        </Button>
        <Button
          variant={timeframe === "week" ? "default" : "outline"}
          className="text-base h-12 px-4"
          onClick={() => handleTimeframeChange("week")}
        >
          Week
        </Button>
      </div>
    </div>
  )
}
