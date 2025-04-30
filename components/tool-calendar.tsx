"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getClientSupabase } from "@/lib/supabase-utils"
import { EnhancedCalendar, type CalendarEvent } from "@/components/enhanced-calendar"

export function ToolCalendar() {
  const { toast } = useToast()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchToolEvents()
  }, [toast])

  const fetchToolEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      // シングルトンパターンを使用
      const supabase = getClientSupabase()

      const { data, error } = await supabase
        .from("tool_reservations")
        .select("*")
        .order("start_date", { ascending: true })

      if (error) throw error

      // イベントデータをカレンダー形式に変換
      const formattedEvents = (data || []).map((event) => ({
        id: event.id,
        title: event.title || "備品予約",
        start: new Date(event.start_date),
        end: new Date(event.end_date),
        tool_id: event.tool_id,
        user_id: event.user_id,
        allDay: event.all_day,
        category: "tool",
      }))

      setEvents(formattedEvents)
    } catch (error) {
      console.error("備品予約の取得に失敗しました:", error)
      setError("備品の予約データの取得に失敗しました")
      toast({
        title: "エラー",
        description: "備品の予約データの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEventAdd = async (event: CalendarEvent) => {
    try {
      const supabase = getClientSupabase()

      const { data, error } = await supabase
        .from("tool_reservations")
        .insert({
          title: event.title,
          start_date: event.start.toISOString(),
          end_date: event.end.toISOString(),
          tool_id: event.tool_id || null,
          user_id: event.user_id || null,
          all_day: event.allDay || false,
        })
        .select()

      if (error) throw error

      // 新しいイベントを追加
      if (data && data[0]) {
        const newEvent = {
          ...event,
          id: data[0].id,
        }
        setEvents((prev) => [...prev, newEvent])
      }

      return data?.[0] || { id: Date.now() }
    } catch (error) {
      console.error("備品予約の追加に失敗しました:", error)
      toast({
        title: "エラー",
        description: "備品予約の追加に失敗しました",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleEventUpdate = async (event: CalendarEvent) => {
    try {
      const supabase = getClientSupabase()

      const { error } = await supabase
        .from("tool_reservations")
        .update({
          title: event.title,
          start_date: event.start.toISOString(),
          end_date: event.end.toISOString(),
          tool_id: event.tool_id || null,
          user_id: event.user_id || null,
          all_day: event.allDay || false,
        })
        .eq("id", event.id)

      if (error) throw error

      // 更新されたイベントを反映
      setEvents((prev) => prev.map((e) => (e.id === event.id ? event : e)))

      return event
    } catch (error) {
      console.error("備品予約の更新に失敗しました:", error)
      toast({
        title: "エラー",
        description: "備品予約の更新に失敗しました",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleEventDelete = async (eventId: string | number) => {
    try {
      const supabase = getClientSupabase()

      const { error } = await supabase.from("tool_reservations").delete().eq("id", eventId)

      if (error) throw error

      // 削除されたイベントを反映
      setEvents((prev) => prev.filter((e) => e.id !== eventId))

      return { success: true }
    } catch (error) {
      console.error("備品予約の削除に失敗しました:", error)
      toast({
        title: "エラー",
        description: "備品予約の削除に失敗しました",
        variant: "destructive",
      })
      throw error
    }
  }

  // 備品カテゴリ
  const toolCategories = [
    { value: "tool", label: "備品" },
    { value: "maintenance", label: "メンテナンス" },
    { value: "other", label: "その他" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>備品カレンダー</CardTitle>
      </CardHeader>
      <CardContent>
        <EnhancedCalendar
          events={events}
          onEventAdd={handleEventAdd}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
          isLoading={loading}
          error={error}
          categories={toolCategories}
          onRefresh={fetchToolEvents}
        />
      </CardContent>
    </Card>
  )
}
