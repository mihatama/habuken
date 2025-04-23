"use client"

import { useState, useCallback } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "moment/locale/ja"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { StaffAssignmentDialog } from "@/components/staff-assignment-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

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
  staffId?: number
}

// スタッフカレンダーのprops型定義
interface StaffCalendarProps {
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
    title: "A店舗担当",
    start: new Date(2023, 2, 1, 9, 0),
    end: new Date(2023, 2, 1, 17, 0),
    staffId: 1,
    projectId: 1,
    staffIds: ["1"],
    toolIds: ["1"],
  },
  {
    id: 2,
    title: "B店舗担当",
    start: new Date(2023, 2, 3, 9, 0),
    end: new Date(2023, 2, 3, 17, 0),
    staffId: 1,
    projectId: 2,
    staffIds: ["1"],
    toolIds: ["2"],
  },
  {
    id: 3,
    title: "C店舗担当",
    start: new Date(2023, 2, 5, 9, 0),
    end: new Date(2023, 2, 5, 17, 0),
    staffId: 2,
    projectId: 3,
    staffIds: ["2"],
    toolIds: ["3"],
  },
  {
    id: 4,
    title: "D店舗担当",
    start: new Date(2023, 2, 8, 9, 0),
    end: new Date(2023, 2, 8, 17, 0),
    staffId: 3,
    projectId: 1,
    staffIds: ["3"],
    toolIds: ["4"],
  },
  {
    id: 5,
    title: "E店舗担当",
    start: new Date(2023, 2, 10, 9, 0),
    end: new Date(2023, 2, 10, 17, 0),
    staffId: 2,
    projectId: 2,
    staffIds: ["2"],
    toolIds: ["5"],
  },
]

export function StaffCalendar({
  events: initialEvents = sampleEvents,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  timeframe = "month",
}: StaffCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null)

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
    // スタッフIDに基づいて色を変更
    let backgroundColor = "#3174ad"

    if (event.staffId) {
      const staffIndex = event.staffId % 5
      const colors = ["#3174ad", "#ff8c00", "#008000", "#9932cc", "#ff4500"]
      backgroundColor = colors[staffIndex]
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
        <Button onClick={handleNewEventClick} size="sm">
          <Plus className="h-4 w-4 mr-2" />
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
    </div>
  )
}
