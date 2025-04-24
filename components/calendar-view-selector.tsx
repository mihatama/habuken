"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Users, Truck, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

export type ViewType = "project" | "staff" | "tool"
export type TimeframeType = "day" | "week" | "month"

type CalendarViewSelectorProps = {
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
  const [currentDate, setCurrentDate] = useState(new Date())

  // 前の期間に移動
  const goToPrevious = () => {
    const newDate = new Date(currentDate)
    if (timeframe === "day") {
      newDate.setDate(newDate.getDate() - 1)
    } else if (timeframe === "week") {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setMonth(newDate.getMonth() - 1)
    }
    setCurrentDate(newDate)
  }

  // 次の期間に移動
  const goToNext = () => {
    const newDate = new Date(currentDate)
    if (timeframe === "day") {
      newDate.setDate(newDate.getDate() + 1)
    } else if (timeframe === "week") {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  // 今日に移動
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // 表示する日付文字列を生成
  const getDateDisplay = () => {
    const options: Intl.DateTimeFormatOptions = {}

    if (timeframe === "day") {
      options.year = "numeric"
      options.month = "long"
      options.day = "numeric"
    } else if (timeframe === "week") {
      // 週の開始日と終了日を計算
      const startOfWeek = new Date(currentDate)
      const dayOfWeek = startOfWeek.getDay()
      const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // 月曜日を週の開始日とする
      startOfWeek.setDate(diff)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(endOfWeek.getDate() + 6)

      return `${startOfWeek.getFullYear()}年${startOfWeek.getMonth() + 1}月${startOfWeek.getDate()}日 - ${endOfWeek.getMonth() + 1}月${endOfWeek.getDate()}日`
    } else {
      options.year = "numeric"
      options.month = "long"
    }

    return new Intl.DateTimeFormat("ja-JP", options).format(currentDate)
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Button
              variant={activeView === "project" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveView("project")}
            >
              <Calendar className="mr-1 h-4 w-4" />
              案件別
            </Button>
            <Button
              variant={activeView === "staff" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveView("staff")}
            >
              <Users className="mr-1 h-4 w-4" />
              スタッフ別
            </Button>
            <Button
              variant={activeView === "tool" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveView("tool")}
            >
              <Truck className="mr-1 h-4 w-4" />
              車両・備品別
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant={timeframe === "day" ? "default" : "outline"} size="sm" onClick={() => setTimeframe("day")}>
              日
            </Button>
            <Button
              variant={timeframe === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe("week")}
            >
              週
            </Button>
            <Button
              variant={timeframe === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe("month")}
            >
              月
            </Button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={goToPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{getDateDisplay()}</span>
            <Button variant="outline" size="sm" onClick={goToToday}>
              今日
            </Button>
          </div>

          <Button variant="outline" size="icon" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
