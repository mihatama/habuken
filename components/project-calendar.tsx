"use client"

import { useState, useCallback } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "moment/locale/ja"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  allDay?: boolean
}

// プロジェクトカレンダーのprops型定義
interface ProjectCalendarProps {
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
    title: "現場A：基礎工事",
    start: new Date(2023, 2, 1, 9, 0),
    end: new Date(2023, 2, 5, 17, 0),
    projectId: 1,
  },
  {
    id: 2,
    title: "現場B：外壁工事",
    start: new Date(2023, 2, 8, 9, 0),
    end: new Date(2023, 2, 12, 17, 0),
    projectId: 2,
  },
  {
    id: 3,
    title: "現場C：内装工事",
    start: new Date(2023, 2, 15, 9, 0),
    end: new Date(2023, 2, 19, 17, 0),
    projectId: 3,
  },
  {
    id: 4,
    title: "現場A：屋根工事",
    start: new Date(2023, 2, 22, 9, 0),
    end: new Date(2023, 2, 26, 17, 0),
    projectId: 1,
  },
  {
    id: 5,
    title: "現場B：設備工事",
    start: new Date(2023, 2, 29, 9, 0),
    end: new Date(2023, 3, 2, 17, 0),
    projectId: 2,
  },
]

export function ProjectCalendar({
  events: initialEvents = sampleEvents,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  timeframe = "month",
}: ProjectCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">((timeframe as any) || "month")
  const [currentDate, setCurrentDate] = useState(new Date())

  // イベントをクリックしたときのハンドラ
  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsDialogOpen(true)
  }, [])

  // スロットを選択したときのハンドラ（新規イベント作成）
  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setSelectedEvent({ id: 0, title: "", start, end })
    setIsDialogOpen(true)
  }, [])

  // 新規作成ボタンをクリックしたときのハンドラ
  const handleNewEventClick = useCallback(() => {
    console.log("案件カレンダー: 新規作成ボタンがクリックされました")
    const now = new Date()
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
    setSelectedEvent({ id: 0, title: "", start: now, end: oneHourLater })
    console.log("ダイアログを開きます", { isDialogOpen: false, willBe: true })
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
    // プロジェクトIDに基づいて色を変更
    let backgroundColor = "#3174ad"

    if (event.projectId) {
      const projectIndex = event.projectId % 5
      const colors = ["#3174ad", "#ff8c00", "#008000", "#9932cc", "#ff4500"]
      backgroundColor = colors[projectIndex]
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

        <div className="text-lg font-medium">案件カレンダー</div>

        <Button variant="default" size="sm" onClick={handleNewEventClick}>
          新規作成
        </Button>
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

      {isDialogOpen && (
        <StaffAssignmentDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          eventData={selectedEvent}
          onEventAdd={handleEventAdd}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
        />
      )}
    </div>
  )
}
