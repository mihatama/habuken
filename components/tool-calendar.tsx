"use client"

import { useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "moment/locale/ja"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { ChevronLeft, ChevronRight, Plus, Users, Briefcase, Wrench, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { sampleProjects, sampleStaff, sampleTools } from "@/data/sample-data"
import { StaffAssignmentDialog } from "@/components/staff-assignment-dialog"

// 日本語ロケールを設定
moment.locale("ja")
const localizer = momentLocalizer(moment)

// カレンダーイベントの型定義
interface CalendarEvent {
  id: number
  title: string
  start: Date
  end: Date
  description?: string
  projectId?: number
  staffIds?: string[]
  toolIds?: string[]
  allDay?: boolean
  toolId?: number
}

// ツールカレンダーのprops型定義
interface ToolCalendarProps {
  events?: CalendarEvent[]
  onEventAdd?: (event: CalendarEvent) => void
  onEventUpdate?: (event: CalendarEvent) => void
  onEventDelete?: (eventId: number) => void
  timeframe?: string
}

// サンプルイベント
const sampleEvents: CalendarEvent[] = [
  {
    id: 1,
    title: "洗浄機A使用",
    start: new Date(2023, 2, 1, 9, 0),
    end: new Date(2023, 2, 3, 17, 0),
    toolId: 1,
    projectId: 1,
    staffIds: ["1", "2"],
    toolIds: ["1"],
  },
  {
    id: 2,
    title: "洗浄機B使用",
    start: new Date(2023, 2, 5, 9, 0),
    end: new Date(2023, 2, 7, 17, 0),
    toolId: 2,
    projectId: 2,
    staffIds: ["3"],
    toolIds: ["2"],
  },
  {
    id: 3,
    title: "1号車使用",
    start: new Date(2023, 2, 10, 9, 0),
    end: new Date(2023, 2, 12, 17, 0),
    toolId: 3,
    projectId: 3,
    staffIds: ["1", "4"],
    toolIds: ["3"],
  },
  {
    id: 4,
    title: "2号車使用",
    start: new Date(2023, 2, 15, 9, 0),
    end: new Date(2023, 2, 17, 17, 0),
    toolId: 4,
    projectId: 1,
    staffIds: ["2", "3"],
    toolIds: ["4"],
  },
  {
    id: 5,
    title: "会議室A予約",
    start: new Date(2023, 2, 20, 13, 0),
    end: new Date(2023, 2, 20, 15, 0),
    toolId: 5,
    projectId: 2,
    staffIds: ["1", "2", "3"],
    toolIds: ["5"],
  },
]

export function ToolCalendar({
  events: initialEvents = sampleEvents,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  timeframe = "month",
}: ToolCalendarProps) {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category") || "all"

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTool, setSelectedTool] = useState<any | null>(null)
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("week") // デフォルトを週表示に変更
  const [filterTool, setFilterTool] = useState<string>("all")
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null)

  // カテゴリーに基づいてツールをフィルタリング
  const filteredByCategory = sampleTools.filter((tool) => {
    if (categoryParam === "all") return true
    if (categoryParam === "tool") return tool.category === "工具"
    if (categoryParam === "machinery") return tool.category === "重機"
    if (categoryParam === "vehicle") return tool.category === "車両"
    return true
  })

  // ツールをフィルタリング
  const filteredTools =
    filterTool === "all" ? filteredByCategory : filteredByCategory.filter((tool) => tool.id.toString() === filterTool)

  // ツールに紐づくプロジェクトを取得
  const getToolProjects = (toolId: number) => {
    const tool = sampleTools.find((t) => t.id === toolId)
    if (!tool) return []

    return sampleProjects.filter((project) => tool.assignedProjects.includes(project.id))
  }

  // ツールに紐づくスタッフを取得
  const getToolStaff = (toolId: number) => {
    const tool = sampleTools.find((t) => t.id === toolId)
    if (!tool) return []

    return sampleStaff.filter((staff) => tool.assignedStaff.includes(staff.id))
  }

  // 週の開始日を取得
  const getWeekStartDate = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
  }

  // 日付の配列を取得（月表示用）
  const getDatesInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()

    const dates = []

    // 月の最初の日の前の空白セルを追加
    for (let i = 0; i < firstDayOfMonth; i++) {
      const prevMonthDate = new Date(year, month, 0 - i)
      dates.unshift(prevMonthDate)
    }

    // 月の各日のセルを追加
    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(new Date(year, month, day))
    }

    // 最後の週を埋める
    const lastDate = new Date(year, month, daysInMonth)
    const lastDay = lastDate.getDay()
    if (lastDay < 6) {
      for (let i = 1; i <= 6 - lastDay; i++) {
        dates.push(new Date(year, month + 1, i))
      }
    }

    return dates
  }

  // 日付の配列を取得（週表示用）
  const getDatesInWeek = () => {
    const weekStart = getWeekStartDate(currentDate)
    const dates = []

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      dates.push(date)
    }

    return dates
  }

  // 日付の配列を取得（日表示用）
  const getHoursInDay = () => {
    const hours = []

    for (let i = 0; i < 24; i++) {
      hours.push(i)
    }

    return hours
  }

  // イベントが日をまたぐかどうかを判定
  const isMultiDayEvent = (event: any) => {
    const startDate = new Date(event.project.startDate)
    const endDate = new Date(event.project.endDate)

    // 開始日と終了日が異なる場合は複数日にまたがるイベント
    return startDate.toDateString() !== endDate.toDateString()
  }

  // 日付が範囲内かどうかを判定
  const isDateInRange = (date: Date, startDate: Date, endDate: Date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)

    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)

    const end = new Date(endDate)
    end.setHours(0, 0, 0, 0)

    return d >= start && d <= end
  }

  // イベントの位置を判定（開始、中間、終了）
  const getEventPosition = (date: Date, event: any) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)

    const startDate = new Date(event.project.startDate)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(event.project.endDate)
    endDate.setHours(0, 0, 0, 0)

    if (d.getTime() === startDate.getTime()) return "start"
    if (d.getTime() === endDate.getTime()) return "end"
    return "middle"
  }

  // イベントをクリックしたときのハンドラ
  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsDialogOpen(true)
  }, [])

  // スロットを選択したときのハンドラ（新規イベント作成）
  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlot({ start, end })
    setSelectedEvent({ id: 0, title: "", start, end })
    setIsDialogOpen(true)
  }, [])

  // 新規作成ボタンをクリックしたときのハンドラ
  const handleNewEventClick = useCallback(() => {
    const now = new Date()
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
    setSelectedEvent({ id: 0, title: "", start: now, end: oneHourLater })
    setIsDialogOpen(true)
  }, [])

  // イベント追加のハンドラ
  const handleEventAdd = useCallback(
    (event: CalendarEvent) => {
      setEvents((prev) => [...prev, event])
      if (onEventAdd) onEventAdd(event)
    },
    [onEventAdd],
  )

  // イベント更新のハンドラ
  const handleEventUpdate = useCallback(
    (updatedEvent: CalendarEvent) => {
      setEvents((prev) => prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)))
      if (onEventUpdate) onEventUpdate(updatedEvent)
    },
    [onEventUpdate],
  )

  // イベント削除のハンドラ
  const handleEventDelete = useCallback(
    (eventId: number) => {
      setEvents((prev) => prev.filter((event) => event.id !== eventId))
      if (onEventDelete) onEventDelete(eventId)
    },
    [onEventDelete],
  )

  // イベントのスタイルをカスタマイズ
  const eventStyleGetter = (event: CalendarEvent) => {
    // ツールIDに基づいて色を変更
    let backgroundColor = "#3174ad"

    if (event.toolId) {
      const toolIndex = event.toolId % 5
      const colors = ["#3174ad", "#ff8c00", "#008000", "#9932cc", "#ff4500"]
      backgroundColor = colors[toolIndex]
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
      },
    }
  }

  // 月表示のカレンダーをレンダリング
  const renderMonthCalendar = () => {
    const dates = getDatesInMonth()

    // 全てのイベントを収集
    const allEvents: any[] = []

    dates.forEach((date, dateIndex) => {
      const isCurrentMonth = date.getMonth() === currentDate.getMonth()
      if (!isCurrentMonth) return // 現在の月のイベントのみを表示

      filteredTools.forEach((tool) => {
        // プロジェクトの確認
        const projects = getToolProjects(tool.id)
        projects.forEach((project) => {
          const projectStart = new Date(project.startDate)
          const projectEnd = new Date(project.endDate)
          if (isDateInRange(date, projectStart, projectEnd)) {
            const eventPosition = isMultiDayEvent({ project }) ? getEventPosition(date, { project }) : "single"

            allEvents.push({
              type: "project",
              tool,
              project,
              date,
              dateIndex,
              eventPosition,
            })
          }
        })
      })
    })

    // イベントをツールとプロジェクトでグループ化
    const groupedEvents: Record<string, any[]> = {}

    allEvents.forEach((event) => {
      const key = `${event.tool.id}-${event.project.id}`
      if (!groupedEvents[key]) {
        groupedEvents[key] = []
      }
      groupedEvents[key].push(event)
    })

    return (
      <div className="relative">
        <div className="grid grid-cols-7 gap-1">
          {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
            <div key={day} className="text-center font-medium py-2">
              {day}
            </div>
          ))}
        </div>

        {/* イベントレイヤー - 枠線の上に表示 */}
        <div className="absolute top-[40px] left-0 right-0 z-10">
          {Object.values(groupedEvents).map((events, groupIndex) => {
            // 同じツールとプロジェクトのイベントをグループ化
            if (events.length <= 1) return null

            // 連続した日付かどうかを確認
            const sortedEvents = [...events].sort((a, b) => a.dateIndex - b.dateIndex)
            const isConsecutive = sortedEvents.every((event, i) => {
              if (i === 0) return true
              return event.dateIndex === sortedEvents[i - 1].dateIndex + 1
            })

            if (!isConsecutive) return null

            const firstEvent = sortedEvents[0]
            const lastEvent = sortedEvents[sortedEvents.length - 1]

            // 週をまたぐイベントは表示しない（複雑になるため）
            const firstWeek = Math.floor(firstEvent.dateIndex / 7)
            const lastWeek = Math.floor(lastEvent.dateIndex / 7)
            if (firstWeek !== lastWeek) return null

            const weekStartIndex = firstWeek * 7
            const relativeStartIndex = firstEvent.dateIndex - weekStartIndex
            const width = lastEvent.dateIndex - firstEvent.dateIndex + 1

            return (
              <div
                key={`group-${groupIndex}`}
                className="absolute flex items-center"
                style={{
                  top: `${firstWeek * 24 + (groupIndex % 3) * 20}px`,
                  left: `${relativeStartIndex * (100 / 7)}%`,
                  width: `${width * (100 / 7)}%`,
                  height: "18px",
                }}
              >
                <div className="w-full h-full rounded-md bg-orange-100 border border-orange-300 p-1 text-xs overflow-hidden">
                  <div className="font-medium truncate">{firstEvent.tool.name}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 日付グリッド */}
        <div className="grid grid-cols-7 gap-1">
          {dates.map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentDate.getMonth()
            const isToday = new Date().toDateString() === date.toDateString()
            const isSelected = selectedDate?.toDateString() === date.toDateString()

            // この日のツールの予定を検索
            const dayToolEvents = allEvents.filter((event) => event.date.toDateString() === date.toDateString())

            // グループ化されたイベントを除外（すでに上のレイヤーで表示されているため）
            const individualEvents = dayToolEvents.filter((event) => {
              const key = `${event.tool.id}-${event.project.id}`
              const group = groupedEvents[key]

              if (group.length <= 1) return true

              // 連続した日付かどうかを確認
              const sortedEvents = [...group].sort((a, b) => a.dateIndex - b.dateIndex)
              const isConsecutive = sortedEvents.every((evt, i) => {
                if (i === 0) return true
                return evt.dateIndex === sortedEvents[i - 1].dateIndex + 1
              })

              if (!isConsecutive) return true

              // 週をまたぐイベントは個別表示する
              const firstEvent = sortedEvents[0]
              const lastEvent = sortedEvents[sortedEvents.length - 1]
              const firstWeek = Math.floor(firstEvent.dateIndex / 7)
              const lastWeek = Math.floor(lastEvent.dateIndex / 7)

              if (firstWeek !== lastWeek) return true

              return false
            })

            return (
              <div
                key={index}
                className={cn(
                  "h-24 border p-1 transition-colors hover:bg-muted/50 cursor-pointer",
                  !isCurrentMonth && "bg-muted/10 text-muted-foreground",
                  isToday && "bg-muted/30",
                  isSelected && "bg-muted",
                )}
                onClick={() => setSelectedDate(date)}
              >
                <div className="flex justify-between">
                  <span className={cn("text-sm font-medium", isToday && "text-primary")}>{date.getDate()}</span>
                </div>
                <ScrollArea className="h-16 w-full">
                  {individualEvents.map((event, eventIndex) => (
                    <Dialog key={`project-${event.tool.id}-${event.project.id}-${eventIndex}`}>
                      <DialogTrigger asChild>
                        <div
                          className="mt-1 p-1 text-xs border rounded-md bg-orange-100 border-orange-300 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedTool(event.tool)
                          }}
                        >
                          <div className="font-medium truncate">{event.tool.name}</div>
                          <div className="text-xs truncate">{event.project.name}</div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle className="text-xl flex items-center gap-2">
                            <Wrench className="h-5 w-5" />
                            {event.tool.name}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">カテゴリー</h4>
                              <p className="font-medium">{event.tool.category}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">状態</h4>
                              <Badge
                                className={cn(
                                  event.tool.status === "利用可能" && "bg-green-500",
                                  event.tool.status === "利用中" && "bg-blue-500",
                                  event.tool.status === "メンテナンス中" && "bg-yellow-500",
                                )}
                              >
                                {event.tool.status}
                              </Badge>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">保管場所</h4>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{event.tool.location}</span>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">最終メンテナンス</h4>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {event.tool.lastMaintenance
                                  ? event.tool.lastMaintenance.toLocaleDateString()
                                  : "記録なし"}
                              </span>
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <h4 className="font-medium mb-2">現在の案件</h4>
                            <div className="space-y-3">
                              <div className="p-3 bg-orange-50 rounded-md border border-orange-200">
                                <div className="flex justify-between mb-1">
                                  <span className="font-medium">{event.project.name}</span>
                                  <Badge>{event.project.status}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{event.project.client}</p>
                                <div className="text-sm">
                                  {event.project.startDate.toLocaleDateString()} 〜{" "}
                                  {event.project.endDate.toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">担当スタッフ</h4>
                            <div className="grid gap-2">
                              {getToolStaff(event.tool.id).map((staff) => (
                                <div key={staff.id} className="flex items-center justify-between p-2 border rounded-md">
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span>{staff.name}</span>
                                  </div>
                                  <Badge variant="outline">{staff.position}</Badge>
                                </div>
                              ))}
                              {getToolStaff(event.tool.id).length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                  担当スタッフはまだ割り当てられていません
                                </p>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">使用案件一覧</h4>
                            <div className="grid gap-2">
                              {getToolProjects(event.tool.id).map((project) => (
                                <div
                                  key={project.id}
                                  className="flex items-center justify-between p-2 border rounded-md"
                                >
                                  <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    <span>{project.name}</span>
                                  </div>
                                  <Badge variant="outline">{project.status}</Badge>
                                </div>
                              ))}
                              {getToolProjects(event.tool.id).length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                  使用する案件はまだ割り当てられていません
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </ScrollArea>
              </div>
            )
          })}
        </div>

        {/* グループ化されたイベントのダイアログトリガー（透明） */}
        <div className="absolute top-[40px] left-0 right-0 z-20 pointer-events-none">
          {Object.values(groupedEvents).map((events, groupIndex) => {
            if (events.length <= 1) return null

            // 連続した日付かどうかを確認
            const sortedEvents = [...events].sort((a, b) => a.dateIndex - b.dateIndex)
            const isConsecutive = sortedEvents.every((event, i) => {
              if (i === 0) return true
              return event.dateIndex === sortedEvents[i - 1].dateIndex + 1
            })

            if (!isConsecutive) return null

            const firstEvent = sortedEvents[0]
            const lastEvent = sortedEvents[sortedEvents.length - 1]

            // 週をまたぐイベントは表示しない（複雑になるため）
            const firstWeek = Math.floor(firstEvent.dateIndex / 7)
            const lastWeek = Math.floor(lastEvent.dateIndex / 7)
            if (firstWeek !== lastWeek) return null

            const weekStartIndex = firstWeek * 7
            const relativeStartIndex = firstEvent.dateIndex - weekStartIndex
            const width = lastEvent.dateIndex - firstEvent.dateIndex + 1

            return (
              <Dialog key={`dialog-${groupIndex}`}>
                <DialogTrigger asChild>
                  <div
                    className="absolute flex items-center pointer-events-auto cursor-pointer"
                    style={{
                      top: `${firstWeek * 24 + (groupIndex % 3) * 20}px`,
                      left: `${relativeStartIndex * (100 / 7)}%`,
                      width: `${width * (100 / 7)}%`,
                      height: "18px",
                    }}
                    onClick={() => setSelectedTool(firstEvent.tool)}
                  >
                    <div className="w-full h-full opacity-0"></div>
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      {firstEvent.tool.name}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">カテゴリー</h4>
                        <p className="font-medium">{firstEvent.tool.category}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">状態</h4>
                        <Badge
                          className={cn(
                            firstEvent.tool.status === "利用可能" && "bg-green-500",
                            firstEvent.tool.status === "利用中" && "bg-blue-500",
                            firstEvent.tool.status === "メンテナンス中" && "bg-yellow-500",
                          )}
                        >
                          {firstEvent.tool.status}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">保管場所</h4>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{firstEvent.tool.location}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">最終メンテナンス</h4>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {firstEvent.tool.lastMaintenance
                            ? firstEvent.tool.lastMaintenance.toLocaleDateString()
                            : "記録なし"}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">現在の案件</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-orange-50 rounded-md border border-orange-200">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{firstEvent.project.name}</span>
                            <Badge>{firstEvent.project.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{firstEvent.project.client}</p>
                          <div className="text-sm">
                            {firstEvent.project.startDate.toLocaleDateString()} 〜{" "}
                            {firstEvent.project.endDate.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">担当スタッフ</h4>
                      <div className="grid gap-2">
                        {getToolStaff(firstEvent.tool.id).map((staff) => (
                          <div key={staff.id} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{staff.name}</span>
                            </div>
                            <Badge variant="outline">{staff.position}</Badge>
                          </div>
                        ))}
                        {getToolStaff(firstEvent.tool.id).length === 0 && (
                          <p className="text-sm text-muted-foreground">担当スタッフはまだ割り当てられていません</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">使用案件一覧</h4>
                      <div className="grid gap-2">
                        {getToolProjects(firstEvent.tool.id).map((project) => (
                          <div key={project.id} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-muted-foreground" />
                              <span>{project.name}</span>
                            </div>
                            <Badge variant="outline">{project.status}</Badge>
                          </div>
                        ))}
                        {getToolProjects(firstEvent.tool.id).length === 0 && (
                          <p className="text-sm text-muted-foreground">使用する案件はまだ割り当てられていません</p>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )
          })}
        </div>
      </div>
    )
  }

  // 週表示のカレンダーをレンダリング
  const renderWeekCalendar = () => {
    const dates = getDatesInWeek()

    // 全てのイベントを収集
    const allEvents: any[] = []

    dates.forEach((date, dateIndex) => {
      filteredTools.forEach((tool) => {
        // プロジェクトの確認
        const projects = getToolProjects(tool.id)
        projects.forEach((project) => {
          const projectStart = new Date(project.startDate)
          const projectEnd = new Date(project.endDate)
          if (isDateInRange(date, projectStart, projectEnd)) {
            const eventPosition = isMultiDayEvent({ project }) ? getEventPosition(date, { project }) : "single"

            allEvents.push({
              type: "project",
              tool,
              project,
              date,
              dateIndex,
              eventPosition,
            })
          }
        })
      })
    })

    // イベントをツールとプロジェクトでグループ化
    const groupedEvents: Record<string, any[]> = {}

    allEvents.forEach((event) => {
      const key = `${event.tool.id}-${event.project.id}`
      if (!groupedEvents[key]) {
        groupedEvents[key] = []
      }
      groupedEvents[key].push(event)
    })

    return (
      <div className="flex flex-col">
        <div className="grid grid-cols-7 gap-1">
          {dates.map((date, index) => {
            const isToday = new Date().toDateString() === date.toDateString()
            const dayName = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()]

            return (
              <div key={index} className={cn("text-center font-medium py-2", isToday && "bg-muted/30 rounded-t-md")}>
                <div>{dayName}</div>
                <div className={cn("text-sm", isToday && "text-primary font-bold")}>{date.getDate()}</div>
              </div>
            )
          })}
        </div>

        <div className="relative">
          {/* イベントレイヤー - 枠線の上に表示 */}
          <div className="absolute top-0 left-0 right-0 z-10">
            {Object.values(groupedEvents).map((events, groupIndex) => {
              // 同じツールとプロジェクトのイベントをグループ化
              const firstEvent = events[0]
              const lastEvent = events[events.length - 1]
              const startIndex = firstEvent.dateIndex
              const endIndex = lastEvent.dateIndex

              // 連続したイベントのみ特別な表示をする
              const isConnected = endIndex - startIndex === events.length - 1

              if (isConnected && events.length > 1) {
                return (
                  <div
                    key={`group-${groupIndex}`}
                    className="absolute flex items-center"
                    style={{
                      top: `${(groupIndex % 5) * 30 + 10}px`,
                      left: `${startIndex * (100 / 7)}%`,
                      width: `${(endIndex - startIndex + 1) * (100 / 7)}%`,
                      height: "28px",
                    }}
                  >
                    <div className="w-full h-full rounded-md bg-orange-100 border border-orange-300 p-1 text-xs overflow-hidden">
                      <div className="font-medium truncate">{firstEvent.tool.name}</div>
                      <div className="text-xs truncate">{firstEvent.project.name}</div>
                    </div>
                  </div>
                )
              }

              return null
            })}
          </div>

          {/* 日付グリッド */}
          <div className="grid grid-cols-7 gap-1 mt-1">
            {dates.map((date, dateIndex) => {
              const isToday = new Date().toDateString() === date.toDateString()
              const isSelected = selectedDate?.toDateString() === date.toDateString()

              // この日のツールの予定を検索（個別表示用）
              const dayToolEvents = allEvents.filter((event) => event.dateIndex === dateIndex)

              // グループ化されたイベントを除外（すでに上のレイヤーで表示されているため）
              const individualEvents = dayToolEvents.filter((event) => {
                const key = `${event.tool.id}-${event.project.id}`
                const group = groupedEvents[key]

                if (group.length <= 1) return true

                const startIndex = group[0].dateIndex
                const endIndex = group[group.length - 1].dateIndex
                const isConnected = endIndex - startIndex === group.length - 1

                return !isConnected
              })

              return (
                <div
                  key={dateIndex}
                  className={cn(
                    "min-h-[300px] border p-1 transition-colors hover:bg-muted/50 cursor-pointer",
                    isToday && "bg-muted/30",
                    isSelected && "bg-muted",
                  )}
                  onClick={() => setSelectedDate(date)}
                >
                  <ScrollArea className="h-full w-full">
                    {/* 個別イベントの表示（連続していないもの） */}
                    {individualEvents.map((event, eventIndex) => (
                      <Dialog key={`project-${event.tool.id}-${event.project.id}-${eventIndex}`}>
                        <DialogTrigger asChild>
                          <div
                            className={cn(
                              "my-1 p-2 text-xs border rounded-md bg-orange-100 border-orange-300 relative z-5",
                            )}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedTool(event.tool)
                            }}
                          >
                            <div className="font-medium">{event.tool.name}</div>
                            <div className="text-xs">{event.project.name}</div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle className="text-xl flex items-center gap-2">
                              <Wrench className="h-5 w-5" />
                              {event.tool.name}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-1">カテゴリー</h4>
                                <p className="font-medium">{event.tool.category}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-1">状態</h4>
                                <Badge
                                  className={cn(
                                    event.tool.status === "利用可能" && "bg-green-500",
                                    event.tool.status === "利用中" && "bg-blue-500",
                                    event.tool.status === "メンテナンス中" && "bg-yellow-500",
                                  )}
                                >
                                  {event.tool.status}
                                </Badge>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">保管場所</h4>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{event.tool.location}</span>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">最終メンテナンス</h4>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {event.tool.lastMaintenance
                                    ? event.tool.lastMaintenance.toLocaleDateString()
                                    : "記録なし"}
                                </span>
                              </div>
                            </div>

                            <div className="border-t pt-4">
                              <h4 className="font-medium mb-2">現在の案件</h4>
                              <div className="space-y-3">
                                <div className="p-3 bg-orange-50 rounded-md border border-orange-200">
                                  <div className="flex justify-between mb-1">
                                    <span className="font-medium">{event.project.name}</span>
                                    <Badge>{event.project.status}</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{event.project.client}</p>
                                  <div className="text-sm">
                                    {event.project.startDate.toLocaleDateString()} 〜{" "}
                                    {event.project.endDate.toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">担当スタッフ</h4>
                              <div className="grid gap-2">
                                {getToolStaff(event.tool.id).map((staff) => (
                                  <div
                                    key={staff.id}
                                    className="flex items-center justify-between p-2 border rounded-md"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-muted-foreground" />
                                      <span>{staff.name}</span>
                                    </div>
                                    <Badge variant="outline">{staff.position}</Badge>
                                  </div>
                                ))}
                                {getToolStaff(event.tool.id).length === 0 && (
                                  <p className="text-sm text-muted-foreground">
                                    担当スタッフはまだ割り当てられていません
                                  </p>
                                )}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">使用案件一覧</h4>
                              <div className="grid gap-2">
                                {getToolProjects(event.tool.id).map((project) => (
                                  <div
                                    key={project.id}
                                    className="flex items-center justify-between p-2 border rounded-md"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                                      <span>{project.name}</span>
                                    </div>
                                    <Badge variant="outline">{project.status}</Badge>
                                  </div>
                                ))}
                                {getToolProjects(event.tool.id).length === 0 && (
                                  <p className="text-sm text-muted-foreground">
                                    使用する案件はまだ割り当てられていません
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ))}
                  </ScrollArea>
                </div>
              )
            })}
          </div>

          {/* グループ化されたイベントのダイアログトリガー（透明） */}
          <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
            {Object.values(groupedEvents).map((events, groupIndex) => {
              const firstEvent = events[0]
              const lastEvent = events[events.length - 1]
              const startIndex = firstEvent.dateIndex
              const endIndex = lastEvent.dateIndex

              // 連続したイベントのみ特別な表示をする
              const isConnected = endIndex - startIndex === events.length - 1

              if (isConnected && events.length > 1) {
                return (
                  <Dialog key={`dialog-${groupIndex}`}>
                    <DialogTrigger asChild>
                      <div
                        className="absolute flex items-center pointer-events-auto cursor-pointer"
                        style={{
                          top: `${(groupIndex % 5) * 30 + 10}px`,
                          left: `${startIndex * (100 / 7)}%`,
                          width: `${(endIndex - startIndex + 1) * (100 / 7)}%`,
                          height: "28px",
                        }}
                        onClick={() => setSelectedTool(firstEvent.tool)}
                      >
                        <div className="w-full h-full opacity-0"></div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">
                          <Wrench className="h-5 w-5" />
                          {firstEvent.tool.name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">カテゴリー</h4>
                            <p className="font-medium">{firstEvent.tool.category}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">状態</h4>
                            <Badge
                              className={cn(
                                firstEvent.tool.status === "利用可能" && "bg-green-500",
                                firstEvent.tool.status === "利用中" && "bg-blue-500",
                                firstEvent.tool.status === "メンテナンス中" && "bg-yellow-500",
                              )}
                            >
                              {firstEvent.tool.status}
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">保管場所</h4>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{firstEvent.tool.location}</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">最終メンテナンス</h4>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {firstEvent.tool.lastMaintenance
                                ? firstEvent.tool.lastMaintenance.toLocaleDateString()
                                : "記録なし"}
                            </span>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-2">現在の案件</h4>
                          <div className="space-y-3">
                            <div className="p-3 bg-orange-50 rounded-md border border-orange-200">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">{firstEvent.project.name}</span>
                                <Badge>{firstEvent.project.status}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{firstEvent.project.client}</p>
                              <div className="text-sm">
                                {firstEvent.project.startDate.toLocaleDateString()} 〜{" "}
                                {firstEvent.project.endDate.toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">担当スタッフ</h4>
                          <div className="grid gap-2">
                            {getToolStaff(firstEvent.tool.id).map((staff) => (
                              <div key={staff.id} className="flex items-center justify-between p-2 border rounded-md">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span>{staff.name}</span>
                                </div>
                                <Badge variant="outline">{staff.position}</Badge>
                              </div>
                            ))}
                            {getToolStaff(firstEvent.tool.id).length === 0 && (
                              <p className="text-sm text-muted-foreground">担当スタッフはまだ割り当てられていません</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">使用案件一覧</h4>
                          <div className="grid gap-2">
                            {getToolProjects(firstEvent.tool.id).map((project) => (
                              <div key={project.id} className="flex items-center justify-between p-2 border rounded-md">
                                <div className="flex items-center gap-2">
                                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                                  <span>{project.name}</span>
                                </div>
                                <Badge variant="outline">{project.status}</Badge>
                              </div>
                            ))}
                            {getToolProjects(firstEvent.tool.id).length === 0 && (
                              <p className="text-sm text-muted-foreground">使用する案件はまだ割り当てられていません</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )
              }

              return null
            })}
          </div>
        </div>
      </div>
    )
  }

  // 日表示のカレンダーをレンダリング
  const renderDayCalendar = () => {
    const hours = getHoursInDay()

    // 選択された日のツールの予定を検索
    const dayToolEvents: any[] = []

    if (selectedDate) {
      filteredTools.forEach((tool) => {
        // プロジェクトの確認
        const projects = getToolProjects(tool.id)
        projects.forEach((project) => {
          const projectStart = new Date(project.startDate)
          const projectEnd = new Date(project.endDate)
          if (isDateInRange(selectedDate, projectStart, projectEnd)) {
            dayToolEvents.push({
              type: "project",
              tool,
              project,
              date: selectedDate,
            })
          }
        })
      })
    }

    return (
      <div className="flex flex-col">
        <div className="text-center font-medium py-2">
          {selectedDate
            ? selectedDate.toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })
            : currentDate.toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
        </div>

        <div className="border rounded-md mt-2">
          {hours.map((hour) => (
            <div key={hour} className="flex border-b last:border-b-0">
              <div className="w-16 p-2 border-r text-center">{hour}:00</div>
              <div className="flex-1 min-h-[60px] p-1">
                {dayToolEvents.map((event, eventIndex) => (
                  <Dialog key={`project-${event.tool.id}-${event.project.id}-${eventIndex}`}>
                    <DialogTrigger asChild>
                      <div
                        className="my-1 p-2 text-xs border rounded-md bg-orange-100 border-orange-300 cursor-pointer"
                        onClick={() => setSelectedTool(event.tool)}
                      >
                        <div className="font-medium">{event.tool.name}</div>
                        <div className="text-xs">{event.project.name}</div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">
                          <Wrench className="h-5 w-5" />
                          {event.tool.name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">カテゴリー</h4>
                            <p className="font-medium">{event.tool.category}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">状態</h4>
                            <Badge
                              className={cn(
                                event.tool.status === "利用可能" && "bg-green-500",
                                event.tool.status === "利用中" && "bg-blue-500",
                                event.tool.status === "メンテナンス中" && "bg-yellow-500",
                              )}
                            >
                              {event.tool.status}
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">保管場所</h4>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{event.tool.location}</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">最終メンテナンス</h4>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {event.tool.lastMaintenance
                                ? event.tool.lastMaintenance.toLocaleDateString()
                                : "記録なし"}
                            </span>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-2">現在の案件</h4>
                          <div className="space-y-3">
                            <div className="p-3 bg-orange-50 rounded-md border border-orange-200">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">{event.project.name}</span>
                                <Badge>{event.project.status}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{event.project.client}</p>
                              <div className="text-sm">
                                {event.project.startDate.toLocaleDateString()} 〜{" "}
                                {event.project.endDate.toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">担当スタッフ</h4>
                          <div className="grid gap-2">
                            {getToolStaff(event.tool.id).map((staff) => (
                              <div key={staff.id} className="flex items-center justify-between p-2 border rounded-md">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span>{staff.name}</span>
                                </div>
                                <Badge variant="outline">{staff.position}</Badge>
                              </div>
                            ))}
                            {getToolStaff(event.tool.id).length === 0 && (
                              <p className="text-sm text-muted-foreground">担当スタッフはまだ割り当てられていません</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">使用案件一覧</h4>
                          <div className="grid gap-2">
                            {getToolProjects(event.tool.id).map((project) => (
                              <div key={project.id} className="flex items-center justify-between p-2 border rounded-md">
                                <div className="flex items-center gap-2">
                                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                                  <span>{project.name}</span>
                                </div>
                                <Badge variant="outline">{project.status}</Badge>
                              </div>
                            ))}
                            {getToolProjects(event.tool.id).length === 0 && (
                              <p className="text-sm text-muted-foreground">使用する案件はまだ割り当てられていません</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const prevPeriod = () => {
    const newDate = new Date(currentDate)
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setDate(newDate.getDate() - 1)
    }
    setCurrentDate(newDate)
  }

  const nextPeriod = () => {
    const newDate = new Date(currentDate)
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + 1)
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  // カテゴリーに基づいてタイトルを取得
  const getCardTitle = () => {
    if (categoryParam === "tool") return "工具カレンダー"
    if (categoryParam === "machinery") return "重機カレンダー"
    if (categoryParam === "vehicle") return "車両カレンダー"
    return "機材カレンダー"
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center justify-end mb-6 gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={filterTool} onValueChange={setFilterTool}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="ツールを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのツール</SelectItem>
                {filteredByCategory.map((tool) => (
                  <SelectItem key={tool.id} value={tool.id.toString()}>
                    {tool.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={viewMode} onValueChange={(value: "month" | "week" | "day") => setViewMode(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="表示形式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">月表示</SelectItem>
                <SelectItem value="week">週表示</SelectItem>
                <SelectItem value="day">日表示</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={goToToday}>
              今日
            </Button>
            <Button variant="outline" size="icon" onClick={prevPeriod}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextPeriod}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handleNewEventClick}>
              <Plus className="h-4 w-4 mr-2" />
              新規作成
            </Button>
          </div>
        </div>

        {/*{viewMode === "month" && renderMonthCalendar()}
        {viewMode === "week" && renderWeekCalendar()}
        {viewMode === "day" && renderDayCalendar()}*/}
        <div style={{ height: 700 }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            onSelectEvent={handleEventClick}
            onSelectSlot={handleSelectSlot}
            selectable
            views={["month", "week", "day"]}
            defaultView={timeframe as any}
            eventPropGetter={eventStyleGetter}
            messages={{
              today: "今日",
              previous: "前へ",
              next: "次へ",
              month: "月",
              week: "週",
              day: "日",
              agenda: "予定リスト",
              date: "日付",
              time: "時間",
              event: "イベント",
              allDay: "終日",
              showMore: (total) => `他 ${total} 件`,
            }}
          />
        </div>

        <StaffAssignmentDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          eventData={selectedEvent}
          onEventAdd={handleEventAdd}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
        />
      </CardContent>
    </Card>
  )
}
