"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarView } from "@/components/calendar-view"
import { useToast } from "@/hooks/use-toast"
import { getClientSupabase } from "@/lib/supabase-utils"

export function StaffCalendar() {
  const { toast } = useToast()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStaffEvents = async () => {
      try {
        setLoading(true)
        // シングルトンパターンを使用
        const supabase = getClientSupabase()

        const { data, error } = await supabase.from("staff_events").select("*").order("start_date", { ascending: true })

        if (error) throw error

        // イベントデータをカレンダー形式に変換
        const formattedEvents = (data || []).map((event) => ({
          id: event.id,
          title: event.title,
          start: new Date(event.start_date),
          end: new Date(event.end_date),
          staff_id: event.staff_id,
          type: event.event_type,
          allDay: event.all_day,
        }))

        setEvents(formattedEvents)
      } catch (error) {
        console.error("スタッフイベントの取得に失敗しました:", error)
        toast({
          title: "エラー",
          description: "スタッフのスケジュールデータの取得に失敗しました",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStaffEvents()
  }, [toast])

  return (
    <Card>
      <CardHeader>
        <CardTitle>スタッフカレンダー</CardTitle>
      </CardHeader>
      <CardContent>
        <CalendarView events={events} loading={loading} />
      </CardContent>
    </Card>
  )
}
