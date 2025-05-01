"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@supabase/supabase-js"
import { getCalendarEvents } from "@/actions/calendar-events"
import { Briefcase } from "lucide-react"
import { useRouter } from "next/navigation"
import { EnhancedCalendar, type CalendarEvent } from "@/components/enhanced-calendar"

// Supabaseクライアントの作成
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase環境変数が設定されていません")
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

export function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // カレンダーイベントの取得
  const fetchData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Fetching calendar events from Supabase...")
      // getCalendarEvents関数を使用してイベントを取得
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      const result = await getCalendarEvents({
        startDate: firstDay.toISOString(),
        endDate: lastDay.toISOString(),
      })

      if (!result.success) {
        throw new Error(result.error || "イベントの取得に失敗しました")
      }

      console.log(`Successfully fetched ${result.data?.length || 0} calendar events from database`)

      // 日付文字列をDateオブジェクトに変換
      const formattedEvents = result.data.map((event: any) => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        description: event.notes,
        category: event.event_type,
        project_id: event.project_id,
        staff_id: event.staff_id,
        resource_id: event.resource_id,
      }))

      setEvents(formattedEvents)

      // プロジェクトとスタッフのデータを取得
      await fetchProjectsAndStaff()
    } catch (error) {
      console.error("イベント取得エラー:", error)
      setError(error instanceof Error ? error.message : "イベントの取得に失敗しました")
      toast({
        title: "エラー",
        description: "カレンダーイベントの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProjectsAndStaff = async () => {
    try {
      const supabase = getSupabaseClient()

      // プロジェクトデータを取得
      const { data: projectsData, error: projectsError } = await supabase.from("projects").select("id, name")
      if (projectsError) throw new Error(`プロジェクトデータ取得エラー: ${projectsError.message}`)
      setProjects(projectsData || [])

      // スタッフデータを取得
      const { data: staffData, error: staffError } = await supabase.from("staff").select("id, full_name")
      if (staffError) throw new Error(`スタッフデータ取得エラー: ${staffError.message}`)
      setStaff(staffData || [])
    } catch (error) {
      console.error("データ取得エラー:", error)
      toast({
        title: "エラー",
        description: "プロジェクトとスタッフのデータ取得に失敗しました",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchData()
  }, [toast])

  // イベント追加のハンドラ
  const handleEventAdd = async (event: CalendarEvent) => {
    try {
      const supabase = getSupabaseClient()

      // Supabaseに保存するデータ形式に変換
      const eventData = {
        title: event.title,
        start_time: event.start.toISOString(),
        end_time: event.end.toISOString(),
        event_type: event.category || "general",
        notes: event.description || null,
        project_id: event.project_id === "none" ? null : event.project_id,
        staff_id: event.staff_id === "none" ? null : event.staff_id,
      }

      const { data, error } = await supabase.from("shifts").insert(eventData).select()

      if (error) throw error

      // 新しいイベントを追加
      if (data && data[0]) {
        const addedEvent = {
          ...event,
          id: data[0].id,
        }
        setEvents((prev) => [...prev, addedEvent])
        return addedEvent
      }

      return { id: Date.now() }
    } catch (error) {
      console.error("イベント追加エラー:", error)
      toast({
        title: "エラー",
        description: "イベントの追加に失敗しました",
        variant: "destructive",
      })
      throw error
    }
  }

  // イベント更新のハンドラ
  const handleEventUpdate = async (event: CalendarEvent) => {
    try {
      const supabase = getSupabaseClient()

      const { error } = await supabase
        .from("shifts")
        .update({
          title: event.title,
          start_time: event.start.toISOString(),
          end_time: event.end.toISOString(),
          event_type: event.category || "general",
          notes: event.description || null,
          project_id: event.project_id === "none" ? null : event.project_id,
          staff_id: event.staff_id === "none" ? null : event.staff_id,
        })
        .eq("id", event.id)

      if (error) throw error

      // 更新されたイベントを反映
      setEvents((prev) => prev.map((e) => (e.id === event.id ? event : e)))

      return event
    } catch (error) {
      console.error("イベント更新エラー:", error)
      toast({
        title: "エラー",
        description: "イベントの更新に失敗しました",
        variant: "destructive",
      })
      throw error
    }
  }

  // イベント削除のハンドラ
  const handleEventDelete = async (eventId: string | number) => {
    try {
      const supabase = getSupabaseClient()

      const { error } = await supabase.from("shifts").delete().eq("id", eventId)

      if (error) throw error

      // 削除されたイベントを反映
      setEvents((prev) => prev.filter((e) => e.id !== eventId))

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
  }

  // 案件登録ページへ遷移
  const navigateToDealRegistration = () => {
    router.push("/deals/register")
  }

  // メインカレンダーのカテゴリ
  const mainCategories = [
    { value: "project", label: "案件" },
    { value: "staff", label: "スタッフ" },
    { value: "tool", label: "備品" },
    { value: "vehicle", label: "車両" },
    { value: "meeting", label: "会議" },
    { value: "holiday", label: "休日" },
    { value: "general", label: "一般" },
  ]

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>カレンダー</CardTitle>
        <Button onClick={navigateToDealRegistration} className="flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          案件登録
        </Button>
      </CardHeader>
      <CardContent>
        <EnhancedCalendar
          events={events}
          onEventAdd={handleEventAdd}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
          isLoading={isLoading}
          error={error}
          categories={mainCategories}
          onRefresh={fetchData}
        />
      </CardContent>
    </Card>
  )
}
