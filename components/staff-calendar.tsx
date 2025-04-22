"use client"

import { useState, useCallback } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "moment/locale/ja"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Card, CardContent } from "@/components/ui/card"
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
  resourceId?: number
  allDay?: boolean
  staffId?: number
}

// スタッフカレンダーのprops型定義
interface StaffCalendarProps {
  events?: CalendarEvent[]
  onEventAdd?: (event: CalendarEvent) => void
  onEventUpdate?: (event: CalendarEvent) => void
  onEventDelete?: (eventId: number) => void
}

// サンプルイベント
const sampleEvents: CalendarEvent[] = [
  {
    id: 1,
    title: "A店舗担当",
    start: new Date(2023, 2, 1, 9, 0),
    end: new Date(2023, 2, 1, 17, 0),
    staffId: 1,
  },
  {
    id: 2,
    title: "B店舗担当",
    start: new Date(2023, 2, 3, 9, 0),
    end: new Date(2023, 2, 3, 17, 0),
    staffId: 1,
  },
  {
    id: 3,
    title: "C店舗担当",
    start: new Date(2023, 2, 5, 9, 0),
    end: new Date(2023, 2, 5, 17, 0),
    staffId: 2,
  },
  {
    id: 4,
    title: "D店舗担当",
    start: new Date(2023, 2, 8, 9, 0),
    end: new Date(2023, 2, 8, 17, 0),
    staffId: 3,
  },
  {
    id: 5,
    title: "E店舗担当",
    start: new Date(2023, 2, 10, 9, 0),
    end: new Date(2023, 2, 10, 17, 0),
    staffId: 2,
  },
]

export function StaffCalendar({ events = sampleEvents, onEventAdd, onEventUpdate, onEventDelete }: StaffCalendarProps) {
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
    setSelectedEvent(null)
    setIsDialogOpen(true)
  }, [])

  return (
    <Card>
      <CardContent className="p-6">
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
            defaultView="month"
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

        <StaffAssignmentDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} eventData={selectedEvent} />
      </CardContent>
    </Card>
  )
}
