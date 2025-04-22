"use client"

import { useState, useMemo, useCallback } from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// モックデータ
const events = [
  {
    id: 1,
    title: "案件A（1名）",
    date: new Date(2025, 3, 15),
    startTime: "09:00",
    endTime: "12:00",
    staff: ["石川", "エル", "A.スコット"],
    location: "東京都品川区上大崎2丁目-21 KOHSHIN HOUSE 1B号室",
    tools: ["プロジェクター"],
    color: "bg-blue-100 border-blue-300",
  },
  {
    id: 2,
    title: "案件B（16名）",
    date: new Date(2025, 3, 15),
    startTime: "10:00",
    endTime: "14:45",
    staff: ["A.スコット", "参宮池沙希", "石川", "エル", "大谷"],
    location: "東京都品川区上大崎2丁目-21 KOHSHIN HOUSE 1B号室",
    tools: ["AppleWatch"],
    color: "bg-red-100 border-red-300",
  },
  {
    id: 3,
    title: "案件C（2名）",
    date: new Date(2025, 3, 16),
    startTime: "09:00",
    endTime: "15:00",
    staff: ["エル", "大谷"],
    location: "東京都品川区上大崎2丁目-21 KOHSHIN HOUSE 1B号室",
    tools: ["プロジェクター"],
    color: "bg-green-100 border-green-300",
  },
]

// イベントの型定義
interface CalendarEvent {
  id: number
  title: string
  date: Date
  startTime: string
  endTime: string
  staff: string[]
  location: string
  tools: string[]
  color: string
}

// 日本語の曜日配列をメモ化
const DAYS_OF_WEEK = ["日", "月", "火", "水", "木", "金", "土"]

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  // 月の日数を取得する関数
  const getDaysInMonth = useCallback((year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }, [])

  // 月の最初の日の曜日を取得する関数
  const getFirstDayOfMonth = useCallback((year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }, [])

  // 前月へ移動
  const prevMonth = useCallback(() => {
    setCurrentMonth((prevDate) => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1))
  }, [])

  // 次月へ移動
  const nextMonth = useCallback(() => {
    setCurrentMonth((prevDate) => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1))
  }, [])

  // 今日へ移動
  const goToToday = useCallback(() => {
    const today = new Date()
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(today)
  }, [])

  // カレンダーのレンダリングをメモ化
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)
    const today = new Date()

    const days = []

    // 月の最初の日の前の空白セルを追加
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-muted bg-muted/20"></div>)
    }

    // 月の各日のセルを追加
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isToday = today.toDateString() === date.toDateString()
      const isSelected = selectedDate?.toDateString() === date.toDateString()

      // この日のイベントを検索
      const dayEvents = events.filter((event) => event.date.toDateString() === date.toDateString())

      days.push(
        <div
          key={day}
          className={cn(
            "h-24 border p-1 transition-colors hover:bg-muted/50 cursor-pointer",
            isToday && "bg-muted/30",
            isSelected && "bg-muted",
          )}
          onClick={() => setSelectedDate(date)}
        >
          <div className="flex justify-between">
            <span className={cn("text-sm font-medium", isToday && "text-primary")}>{day}</span>
          </div>
          <ScrollArea className="h-16 w-full">
            {dayEvents.map((event) => (
              <Dialog key={event.id}>
                <DialogTrigger asChild>
                  <div
                    className={cn("mt-1 rounded p-1 text-xs border", event.color)}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedEvent(event)
                    }}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    <div className="text-xs">{`${event.startTime} - ${event.endTime}`}</div>
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{event.title}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <h4 className="mb-2 font-medium">日時</h4>
                      <p>{`${event.date.toLocaleDateString()} ${event.startTime} - ${event.endTime}`}</p>
                    </div>
                    <div>
                      <h4 className="mb-2 font-medium">スタッフ</h4>
                      <div className="flex flex-wrap gap-1">
                        {event.staff.map((staff, index) => (
                          <Badge key={index} variant="outline">
                            {staff}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-2 font-medium">場所</h4>
                      <p>{event.location}</p>
                    </div>
                    <div>
                      <h4 className="mb-2 font-medium">ツール</h4>
                      <div className="flex flex-wrap gap-1">
                        {event.tools.map((tool, index) => (
                          <Badge key={index} variant="outline">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </ScrollArea>
        </div>,
      )
    }

    return days
  }, [currentMonth, selectedDate, getDaysInMonth, getFirstDayOfMonth])

  // 現在の月の表示をメモ化
  const currentMonthDisplay = useMemo(() => {
    return currentMonth.toLocaleDateString("ja-JP", { year: "numeric", month: "long" })
  }, [currentMonth])

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">{currentMonthDisplay}</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              今日
            </Button>
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              新規作成
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="text-center font-medium py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{calendarDays}</div>
      </CardContent>
    </Card>
  )
}
