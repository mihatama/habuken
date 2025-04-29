"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarView } from "@/components/calendar-view"
import { useToast } from "@/hooks/use-toast"
import { getClientSupabase } from "@/lib/supabase-utils"

export function ToolCalendar() {
  const { toast } = useToast()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchToolEvents = async () => {
      try {
        setLoading(true)
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
        }))

        setEvents(formattedEvents)
      } catch (error) {
        console.error("備品予約の取得に失敗しました:", error)
        toast({
          title: "エラー",
          description: "備品の予約データの取得に失敗しました",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchToolEvents()
  }, [toast])

  return (
    <Card>
      <CardHeader>
        <CardTitle>備品カレンダー</CardTitle>
      </CardHeader>
      <CardContent>
        <CalendarView events={events} loading={loading} />
      </CardContent>
    </Card>
  )
}
