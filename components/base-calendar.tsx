"use client"

import { useState, useCallback, useMemo } from "react"
import { Calendar, momentLocalizer, type SlotInfo } from "react-big-calendar"
import moment from "moment"
import "moment/locale/ja"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CalendarEvent, CalendarProps, TimeframeType } from "@/types/calendar"
import { EventDialog } from "@/components/event-dialog"
import { Skeleton } from "@/components/ui/skeleton"

// 日本語ロケールを設定
moment.locale("ja")
const localizer = momentLocalizer(moment)

export function BaseCalendar({
  events = [],
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  onEventDrop,
  timeframe = "month",
  viewType = "project",
  initialDate,
  loading = false,
}: CalendarProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [viewMode, setViewMode] = useState<TimeframeType>(timeframe)
  const [currentDate, setCurrentDate] = useState(initialDate || new Date())

  // イベントをクリックしたときのハンドラ
  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsDialogOpen(true)
  }, [])

  // スロットを選択したときのハンドラ（新規イベント作成）
  const handleSelectSlot = useCallback(
    (slotInfo: SlotInfo) => {
      const { start, end } = slotInfo
      setSelectedEvent({
        id: "",
        title: "",
        start: new Date(start),
        end: new Date(end),
        event_type: viewType === "tool" ? "tool" : viewType === "staff" ? "staff" : "project",
      })
      setIsDialogOpen(true)
    },
    [viewType],
  )

  // イベント追加のハンドラ
  const handleEventAdd = useCallback(
    (event: CalendarEvent) => {
      if (onEventAdd) onEventAdd(event)
    },
    [onEventAdd],
  )

  // イベント更新のハンドラ
  const handleEventUpdate = useCallback(
    (updatedEvent: CalendarEvent) => {
      if (onEventUpdate) onEventUpdate(updatedEvent)
    },
    [onEventUpdate],
  )

  // イベント削除のハンドラ
  const handleEventDelete = useCallback(
    (eventId: string) => {
      if (onEventDelete) onEventDelete(eventId)
    },
    [onEventDelete],
  )

  // イベントのドラッグ＆ドロップハンドラ
  const handleEventDrop = useCallback(
    ({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
      if (onEventDrop) onEventDrop(event, start, end)
    },
    [onEventDrop],
  )

  // イベントのスタイルをカスタマイズ
  const eventStyleGetter = useCallback(
    (event: CalendarEvent) => {
      // イベントの色を設定
      const backgroundColor = event.color || getEventColor(event, viewType)

      return {
        style: {
          backgroundColor,
          borderRadius: "16px", // 丸いタグのような見た目
          opacity: 0.8,
          color: "white",
          border: "0px",
          display: "block",
          padding: "2px 5px",
          fontSize: "0.85em",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        },
      }
    },
    [viewType],
  )

  // イベントタイプに基づいて色を取得
  const getEventColor = (event: CalendarEvent, viewType: string): string => {
    // 基本色
    const colors = [
      "#3174ad", // 青
      "#ff8c00", // オレンジ
      "#008000", // 緑
      "#9932cc", // 紫
      "#ff4500", // 赤
    ]

    let index = 0

    if (viewType === "project" && event.project_id) {
      // プロジェクトIDに基づいて色を変更
      index = Number.parseInt(event.project_id, 10) % colors.length
    } else if (viewType === "staff" && event.staff_id) {
      // スタッフIDに基づいて色を変更
      index = Number.parseInt(event.staff_id, 10) % colors.length
    } else if (viewType === "tool" && event.resource_id) {
      // リソースIDに基づいて色を変更
      index = Number.parseInt(event.resource_id, 10) % colors.length
    }

    return colors[index]
  }

  // ビューのタイトルを取得
  const getViewTitle = useMemo(() => {
    if (viewType === "project") return "案件カレンダー"
    if (viewType === "staff") return "スタッフカレンダー"
    return "機材カレンダー"
  }, [viewType])

  // ローディング表示
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-6 w-[150px]" />
        </div>
        <Skeleton className="h-[700px] w-full" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={(value: TimeframeType) => setViewMode(value)}>
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

        <div className="text-lg font-medium">{getViewTitle}</div>
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
          views={{
            month: true,
            week: true,
            day: true,
          }}
          view={viewMode}
          onView={(view) => setViewMode(view as TimeframeType)}
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          eventPropGetter={eventStyleGetter}
          onEventDrop={handleEventDrop}
          draggableAccessor={() => true} // すべてのイベントをドラッグ可能に
          resizable
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

      <EventDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        event={selectedEvent}
        viewType={viewType}
        onEventAdd={handleEventAdd}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
      />
    </div>
  )
}
