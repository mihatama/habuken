"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { StaffAssignmentDialog } from "@/components/staff-assignment-dialog"
import { EnhancedCalendar, type CalendarEvent } from "@/components/enhanced-calendar"
import { useToast } from "@/hooks/use-toast"

// プロジェクトカレンダーのprops型定義
interface ProjectCalendarProps {
  events?: CalendarEvent[]
  onEventAdd?: (event: CalendarEvent) => void
  onEventUpdate?: (event: CalendarEvent) => void
  onEventDelete?: (eventId: number | string) => void
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
    category: "project",
  },
  {
    id: 2,
    title: "現場B：外壁工事",
    start: new Date(2023, 2, 8, 9, 0),
    end: new Date(2023, 2, 12, 17, 0),
    projectId: 2,
    category: "project",
  },
  {
    id: 3,
    title: "現場C：内装工事",
    start: new Date(2023, 2, 15, 9, 0),
    end: new Date(2023, 2, 19, 17, 0),
    projectId: 3,
    category: "project",
  },
  {
    id: 4,
    title: "現場A：屋根工事",
    start: new Date(2023, 2, 22, 9, 0),
    end: new Date(2023, 2, 26, 17, 0),
    projectId: 1,
    category: "project",
  },
  {
    id: 5,
    title: "現場B：設備工事",
    start: new Date(2023, 2, 29, 9, 0),
    end: new Date(2023, 3, 2, 17, 0),
    projectId: 2,
    category: "project",
  },
]

// プロジェクトカテゴリ
const projectCategories = [
  { value: "project", label: "案件" },
  { value: "meeting", label: "会議" },
  { value: "deadline", label: "締切" },
  { value: "other", label: "その他" },
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
  const { toast } = useToast()

  // 新規作成ボタンをクリックしたときのハンドラ
  const handleNewEventClick = useCallback(() => {
    const now = new Date()
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
    setSelectedEvent({
      id: 0,
      title: "",
      start: now,
      end: oneHourLater,
      category: "project",
    })
    setIsDialogOpen(true)
  }, [])

  // イベント追加のハンドラ
  const handleEventAdd = useCallback(
    async (event: CalendarEvent) => {
      try {
        // 新しいIDを生成（実際のアプリではサーバーから取得）
        const newEvent = {
          ...event,
          id: Math.max(0, ...events.map((e) => Number(e.id))) + 1,
        }

        setEvents((prev) => [...prev, newEvent])

        if (onEventAdd) onEventAdd(newEvent)

        toast({
          title: "イベント追加",
          description: "イベントが正常に追加されました",
        })

        return newEvent
      } catch (error) {
        console.error("イベント追加エラー:", error)
        toast({
          title: "エラー",
          description: "イベントの追加に失敗しました",
          variant: "destructive",
        })
        throw error
      }
    },
    [events, onEventAdd, toast],
  )

  // イベント更新のハンドラ
  const handleEventUpdate = useCallback(
    async (updatedEvent: CalendarEvent) => {
      try {
        setEvents((prev) => prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)))

        if (onEventUpdate) onEventUpdate(updatedEvent)

        toast({
          title: "イベント更新",
          description: "イベントが正常に更新されました",
        })

        return updatedEvent
      } catch (error) {
        console.error("イベント更新エラー:", error)
        toast({
          title: "エラー",
          description: "イベントの更新に失敗しました",
          variant: "destructive",
        })
        throw error
      }
    },
    [onEventUpdate, toast],
  )

  // イベント削除のハンドラ
  const handleEventDelete = useCallback(
    async (eventId: number | string) => {
      try {
        setEvents((prev) => prev.filter((event) => event.id !== eventId))

        if (onEventDelete) onEventDelete(eventId)

        toast({
          title: "イベント削除",
          description: "イベントが正常に削除されました",
        })

        return { success: true }
      } catch (error) {
        console.error("イベント削除エラー:", error)
        toast({
          title: "エラー",
          description: "イベントの削除に失敗しました",
          variant: "destructive",
        })
        throw error
      }
    },
    [onEventDelete, toast],
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-medium">案件カレンダー</div>
        <Button variant="default" size="sm" onClick={handleNewEventClick}>
          新規作成
        </Button>
      </div>

      <EnhancedCalendar
        events={events}
        onEventAdd={handleEventAdd}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
        categories={projectCategories}
      />

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
