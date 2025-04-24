"use client"

import { useState, useCallback, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "moment/locale/ja"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Button } from "@/components/ui/button"
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
  category?: "machinery" | "vehicle" | "equipment" | string
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

// カテゴリーに基づいたサンプルイベントを生成
const generateCategoryEvents = (category: string): CalendarEvent[] => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  let categoryId = 0
  let categoryTitle = ""

  if (category === "machinery") {
    categoryId = 1
    categoryTitle = "重機"
  } else if (category === "vehicle") {
    categoryId = 2
    categoryTitle = "車両"
  } else if (category === "equipment") {
    categoryId = 3
    categoryTitle = "備品"
  }

  return [
    {
      id: 100 + categoryId,
      title: `${categoryTitle}A使用`,
      start: new Date(year, month, 5, 9, 0),
      end: new Date(year, month, 7, 17, 0),
      toolId: 10 + categoryId,
      projectId: 1,
      staffIds: ["1", "2"],
      toolIds: [`${10 + categoryId}`],
    },
    {
      id: 200 + categoryId,
      title: `${categoryTitle}B使用`,
      start: new Date(year, month, 12, 9, 0),
      end: new Date(year, month, 14, 17, 0),
      toolId: 20 + categoryId,
      projectId: 2,
      staffIds: ["3"],
      toolIds: [`${20 + categoryId}`],
    },
    {
      id: 300 + categoryId,
      title: `${categoryTitle}C使用`,
      start: new Date(year, month, 19, 9, 0),
      end: new Date(year, month, 21, 17, 0),
      toolId: 30 + categoryId,
      projectId: 3,
      staffIds: ["1", "4"],
      toolIds: [`${30 + categoryId}`],
    },
  ]
}

export function ToolCalendar({
  events: initialEvents,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  timeframe = "month",
  category,
}: ToolCalendarProps) {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category") || "all"

  // カテゴリーに基づいてイベントを初期化
  const [events, setEvents] = useState<CalendarEvent[]>(
    initialEvents || (category ? generateCategoryEvents(category) : sampleEvents),
  )

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTool, setSelectedTool] = useState<any | null>(null)
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">((timeframe as any) || "month")
  const [filterTool, setFilterTool] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null)
  const [filteredTools, setFilteredTools] = useState(sampleTools)

  // カテゴリーに基づいてツールをフィルタリング
  useEffect(() => {
    if (category) {
      let categoryFilter = "all"

      if (category === "machinery") {
        categoryFilter = "重機"
      } else if (category === "vehicle") {
        categoryFilter = "車両"
      } else if (category === "equipment") {
        categoryFilter = "工具"
      }

      const filteredByCategory = sampleTools.filter((tool) => {
        if (categoryFilter === "all") return true
        return tool.category === categoryFilter
      })

      // ツールをフィルタリング
      const filtered =
        filterTool === "all"
          ? filteredByCategory
          : filteredByCategory.filter((tool) => tool.id.toString() === filterTool)

      setFilteredTools(filtered)
    }
  }, [category, filterTool])

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
      // 新しいIDを生成（実際のアプリではサーバーから取得）
      const newEvent = {
        ...event,
        id: Math.max(0, ...events.map((e) => e.id)) + 1,
      }
      setEvents((prev) => [...prev, newEvent])
      if (onEventAdd) onEventAdd(newEvent)
    },
    [events, onEventAdd],
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

  // カテゴリー名を取得
  const getCategoryName = () => {
    if (category === "machinery") return "重機"
    if (category === "vehicle") return "車両"
    if (category === "equipment") return "備品"
    return "機材"
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={(value: "month" | "week" | "day") => setViewMode(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="表示切替" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">月表示</SelectItem>
              <SelectItem value="week">週表示</SelectItem>
              <SelectItem value="day">日表示</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            今日
          </Button>
        </div>

        <div className="text-lg font-medium">{getCategoryName()}カレンダー</div>
      </div>

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
          view={viewMode}
          onView={(view) => setViewMode(view as "month" | "week" | "day")}
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
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
    </div>
  )
}
