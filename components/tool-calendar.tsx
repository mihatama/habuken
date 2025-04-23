"use client"

import { useState, useEffect, useCallback } from "react"
import { BaseCalendar } from "@/components/base-calendar"
import type { CalendarEvent } from "@/types/calendar"
import {
  getCalendarEvents,
  updateCalendarEvent,
  createCalendarEvent,
  deleteCalendarEvent,
} from "@/actions/calendar-events"
import { useToast } from "@/components/ui/use-toast"

interface ToolCalendarProps {
  timeframe?: "month" | "week" | "day"
  category?: "machinery" | "vehicle" | "equipment" | string
}

export function ToolCalendar({ timeframe = "month", category }: ToolCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // イベントを取得
  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      // カテゴリーに基づいてフィルターを設定
      const filters: any = { eventType: "tool" }

      if (category) {
        // カテゴリーに基づいてリソースタイプをフィルタリング
        // 注: 実際のデータベース構造に合わせて調整が必要
        filters.resourceType = category
      }

      const result = await getCalendarEvents(filters)
      if (result.success && result.data) {
        // サーバーから取得したデータをCalendarEvent型に変換
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
          allDay: event.all_day,
          // 関連データ
          project: event.projects,
          staff: event.staff,
          resource: event.resources,
        }))
        setEvents(formattedEvents)
      } else {
        toast({
          title: "エラー",
          description: "イベントの取得に失敗しました",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("イベント取得エラー:", error)
      toast({
        title: "エラー",
        description: "イベントの取得中にエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast, category])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // イベント追加
  const handleEventAdd = async (event: CalendarEvent) => {
    try {
      const result = await createCalendarEvent({
        title: event.title,
        start_time: event.start,
        end_time: event.end,
        notes: event.description,
        project_id: event.project_id,
        staff_id: event.staff_id,
        resource_id: event.resource_id,
        event_type: "tool",
      })

      if (result.success) {
        toast({
          title: "成功",
          description: "イベントが追加されました",
        })
        fetchEvents()
      } else {
        toast({
          title: "エラー",
          description: result.error || "イベントの追加に失敗しました",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("イベント追加エラー:", error)
      toast({
        title: "エラー",
        description: "イベントの追加中にエラーが発生しました",
        variant: "destructive",
      })
    }
  }

  // イベント更新
  const handleEventUpdate = async (event: CalendarEvent) => {
    try {
      const result = await updateCalendarEvent(event.id, {
        title: event.title,
        start_time: event.start,
        end_time: event.end,
        notes: event.description,
        project_id: event.project_id,
        staff_id: event.staff_id,
        resource_id: event.resource_id,
        event_type: "tool",
      })

      if (result.success) {
        toast({
          title: "成功",
          description: "イベントが更新されました",
        })
        fetchEvents()
      } else {
        toast({
          title: "エラー",
          description: result.error || "イベントの更新に失敗しました",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("イベント更新エラー:", error)
      toast({
        title: "エラー",
        description: "イベントの更新中にエラーが発生しました",
        variant: "destructive",
      })
    }
  }

  // イベント削除
  const handleEventDelete = async (eventId: string) => {
    try {
      const result = await deleteCalendarEvent(eventId)

      if (result.success) {
        toast({
          title: "成功",
          description: "イベントが削除されました",
        })
        fetchEvents()
      } else {
        toast({
          title: "エラー",
          description: result.error || "イベントの削除に失敗しました",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("イベント削除エラー:", error)
      toast({
        title: "エラー",
        description: "イベントの削除中にエラーが発生しました",
        variant: "destructive",
      })
    }
  }

  // イベントのドラッグ＆ドロップ
  const handleEventDrop = async (event: CalendarEvent, start: Date, end: Date) => {
    try {
      const result = await updateCalendarEvent(event.id, {
        start_time: start,
        end_time: end,
      })

      if (result.success) {
        toast({
          title: "成功",
          description: "イベントが移動されました",
        })
        fetchEvents()
      } else {
        toast({
          title: "エラー",
          description: result.error || "イベントの移動に失敗しました",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("イベント移動エラー:", error)
      toast({
        title: "エラー",
        description: "イベントの移動中にエラーが発生しました",
        variant: "destructive",
      })
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
    <BaseCalendar
      events={events}
      onEventAdd={handleEventAdd}
      onEventUpdate={handleEventUpdate}
      onEventDelete={handleEventDelete}
      onEventDrop={handleEventDrop}
      timeframe={timeframe}
      viewType="tool"
      loading={loading}
    />
  )
}
