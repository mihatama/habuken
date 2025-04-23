"use client"

import { useState, useEffect, useCallback } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "moment/locale/ja"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { StaffAssignmentDialog } from "@/components/staff-assignment-dialog"
import { useCalendarData } from "@/hooks/use-calendar-data"
import { getCalendarEvents } from "@/actions/calendar-events"
import { useToast } from "@/hooks/use-toast"

// 日本語ロケールを設定
moment.locale("ja")
const localizer = momentLocalizer(moment)

// カレンダーイベントの型定義
interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  description?: string
  project_id?: string
  staff_id?: string
  resource_id?: string
  event_type?: "project" | "staff" | "tool" | "general"
  allDay?: boolean
}

// プロジェクトカレンダーのprops型定義
interface ProjectCalendarProps {
  initialEvents?: CalendarEvent[]
  onEventAdd?: (event: CalendarEvent) => void
  onEventUpdate?: (event: CalendarEvent) => void
  onEventDelete?: (eventId: string) => void
  timeframe?: string
  projectId?: string
}

export function ProjectCalendar({
  initialEvents = [],
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  timeframe = "month",
  projectId,
}: ProjectCalendarProps) {
  const { toast } = useToast()
  const { projects, staff, resources, loading: dataLoading } = useCalendarData()
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null)
  const [loading, setLoading] = useState(false)

  // イベントデータを取得
  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true)
        const filters: any = {}

        // 過去3ヶ月から先3ヶ月までのイベントを取得
        const startDate = new Date()
        startDate.setMonth(startDate.getMonth() - 3)
        filters.startDate = startDate.toISOString()

        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 3)
        filters.endDate = endDate.toISOString()

        // プロジェクトIDが指定されている場合はフィルタリング
        if (projectId) {
          filters.projectId = projectId
        }

        // プロジェクト関連のイベントのみ取得
        filters.eventType = "project"

        const result = await getCalendarEvents(filters)

        if (result.success) {
          // Supabaseから取得したデータをカレンダー用に変換
          const formattedEvents = result.data.map((event: any) => ({
            id: event.id,
            title: event.title,
            start: new Date(event.start_time),
            end: new Date(event.end_time),
            description: event.notes,
            project_id: event.project_id,
            staff_id: event.staff_id,
            resource_id: event.resource_id,
            event_type: event.event_type,
          }))

          setEvents(formattedEvents)
        } else {
          toast({
            title: "エラー",
            description: result.error || "イベントの取得に失敗しました",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("イベント取得エラー:", error)
        toast({
          title: "エラー",
          description: error instanceof Error ? error.message : "不明なエラーが発生しました",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [projectId, toast])

  // イベントをクリックしたときのハンドラ
  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsDialogOpen(true)
  }, [])

  // スロットを選択したときのハンドラ（新規イベント作成）
  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlot({ start, end })
    setSelectedEvent({ id: "", title: "", start, end })
    setIsDialogOpen(true)
  }, [])

  // 新規作成ボタンをクリックしたときのハンドラ
  const handleNewEventClick = useCallback(() => {
    const now = new Date()
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
    setSelectedEvent({ id: "", title: "", start: now, end: oneHourLater })
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
    (eventId: string) => {
      setEvents((prev) => prev.filter((event) => event.id !== eventId))
      if (onEventDelete) onEventDelete(eventId)
    },
    [onEventDelete],
  )

  // イベントのスタイルをカスタマイズ
  const eventStyleGetter = (event: CalendarEvent) => {
    // プロジェクトIDに基づいて色を変更
    let backgroundColor = "#3174ad"

    if (event.project_id) {
      const projectIndex = Number.parseInt(event.project_id) % 5
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
        <Button onClick={handleNewEventClick} size="sm" disabled={loading || dataLoading}>
          {loading || dataLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          新規作成
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-[700px]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p className="text-muted-foreground">カレンダーデータを読み込み中...</p>
          </div>
        </div>
      ) : (
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
      )}

      <StaffAssignmentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        eventData={selectedEvent}
        onEventAdd={handleEventAdd}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
        projects={projects}
        staff={staff}
        resources={resources}
      />
    </div>
  )
}
