"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Users, Truck, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import type { CalendarViewType, TimeframeType } from "@/types/calendar"
import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from "date-fns"
import { ja } from "date-fns/locale"

type CalendarViewSelectorProps = {
  activeView?: CalendarViewType
  timeframe?: TimeframeType
}

export function CalendarViewSelector({ activeView = "project", timeframe = "month" }: CalendarViewSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [currentView, setCurrentView] = useState<CalendarViewType>(
    (searchParams.get("view") as CalendarViewType) || activeView,
  )
  const [currentTimeframe, setCurrentTimeframe] = useState<TimeframeType>(
    (searchParams.get("timeframe") as TimeframeType) || timeframe,
  )
  const [currentDate, setCurrentDate] = useState<Date>(
    searchParams.get("date") ? new Date(searchParams.get("date") as string) : new Date(),
  )

  // URLパラメータが変更されたときにステートを更新
  useEffect(() => {
    const viewParam = searchParams.get("view") as CalendarViewType
    const timeframeParam = searchParams.get("timeframe") as TimeframeType
    const dateParam = searchParams.get("date")

    if (viewParam && viewParam !== currentView) {
      setCurrentView(viewParam)
    }

    if (timeframeParam && timeframeParam !== currentTimeframe) {
      setCurrentTimeframe(timeframeParam)
    }

    if (dateParam && new Date(dateParam).toString() !== "Invalid Date") {
      setCurrentDate(new Date(dateParam))
    }
  }, [searchParams, currentView, currentTimeframe])

  // URLパラメータを更新する関数
  const updateURLParams = (params: { view?: CalendarViewType; timeframe?: TimeframeType; date?: Date }) => {
    const urlParams = new URLSearchParams(searchParams.toString())

    if (params.view) {
      urlParams.set("view", params.view)
    }

    if (params.timeframe) {
      urlParams.set("timeframe", params.timeframe)
    }

    if (params.date) {
      urlParams.set("date", params.date.toISOString())
    }

    router.push(`${pathname}?${urlParams.toString()}`)
  }

  // ビューを変更
  const handleViewChange = (view: CalendarViewType) => {
    setCurrentView(view)
    updateURLParams({ view })
  }

  // タイムフレームを変更
  const handleTimeframeChange = (newTimeframe: TimeframeType) => {
    setCurrentTimeframe(newTimeframe)
    updateURLParams({ timeframe: newTimeframe })
  }

  // 前の期間に移動
  const goToPrevious = () => {
    let newDate = currentDate

    if (currentTimeframe === "day") {
      newDate = subDays(currentDate, 1)
    } else if (currentTimeframe === "week") {
      newDate = subWeeks(currentDate, 1)
    } else {
      newDate = subMonths(currentDate, 1)
    }

    setCurrentDate(newDate)
    updateURLParams({ date: newDate })
  }

  // 次の期間に移動
  const goToNext = () => {
    let newDate = currentDate

    if (currentTimeframe === "day") {
      newDate = addDays(currentDate, 1)
    } else if (currentTimeframe === "week") {
      newDate = addWeeks(currentDate, 1)
    } else {
      newDate = addMonths(currentDate, 1)
    }

    setCurrentDate(newDate)
    updateURLParams({ date: newDate })
  }

  // 今日に移動
  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    updateURLParams({ date: today })
  }

  // 表示する日付文字列を生成
  const getDateDisplay = () => {
    if (currentTimeframe === "day") {
      return format(currentDate, "yyyy年M月d日(E)", { locale: ja })
    } else if (currentTimeframe === "week") {
      // 週の開始日と終了日を計算
      const startOfWeek = new Date(currentDate)
      const dayOfWeek = startOfWeek.getDay()
      const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // 月曜日を週の開始日とする
      startOfWeek.setDate(diff)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(endOfWeek.getDate() + 6)

      return `${format(startOfWeek, "yyyy年M月d日", { locale: ja })} - ${format(endOfWeek, "M月d日", { locale: ja })}`
    } else {
      return format(currentDate, "yyyy年M月", { locale: ja })
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Button
              variant={currentView === "project" ? "default" : "outline"}
              size="sm"
              onClick={() => handleViewChange("project")}
            >
              <Calendar className="mr-1 h-4 w-4" />
              案件別
            </Button>
            <Button
              variant={currentView === "staff" ? "default" : "outline"}
              size="sm"
              onClick={() => handleViewChange("staff")}
            >
              <Users className="mr-1 h-4 w-4" />
              スタッフ別
            </Button>
            <Button
              variant={currentView === "tool" ? "default" : "outline"}
              size="sm"
              onClick={() => handleViewChange("tool")}
            >
              <Truck className="mr-1 h-4 w-4" />
              機材別
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={currentTimeframe === "day" ? "default" : "outline"}
              size="sm"
              onClick={() => handleTimeframeChange("day")}
            >
              日
            </Button>
            <Button
              variant={currentTimeframe === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => handleTimeframeChange("week")}
            >
              週
            </Button>
            <Button
              variant={currentTimeframe === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => handleTimeframeChange("month")}
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
