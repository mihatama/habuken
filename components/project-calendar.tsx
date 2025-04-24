"use client"

import { useState, useEffect, useCallback } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "moment/locale/ja"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { StaffAssignmentDialog } from "@/components/staff-assignment-dialog"
import { getSupabaseClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

moment.locale("ja")
const localizer = momentLocalizer(moment)

interface ProjectCalendarProps {
  timeframe?: string
}

export function ProjectCalendar({ timeframe = "month" }: ProjectCalendarProps) {
  const [events, setEvents] = useState<any[]>([])
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [projects, setProjects] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const { toast } = useToast()

  // プロジェクトデータの取得
  const fetchProjects = useCallback(async () => {
    try {
      console.log("プロジェクトデータの取得を開始")
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error("Supabaseクライアントの初期化に失敗しました")
      }

      const { data, error } = await supabase.from("projects").select("*").order("name", { ascending: true })

      if (error) {
        throw error
      }

      console.log(`${data?.length || 0}件のプロジェクトデータを取得しました`)
      setProjects(data || [])
      return data
    } catch (error) {
      console.error("プロジェクトデータの取得に失敗:", error)
      toast({
        title: "エラー",
        description: "プロジェクトデータの取得に失敗しました",
        variant: "destructive",
      })
      return []
    }
  }, [toast])

  // スタッフデータの取得
  const fetchStaff = useCallback(async () => {
    try {
      console.log("スタッフデータの取得を開始")
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error("Supabaseクライアントの初期化に失敗しました")
      }

      const { data, error } = await supabase.from("staff").select("*").order("full_name", { ascending: true })

      if (error) {
        throw error
      }

      console.log(`${data?.length || 0}件のスタッフデータを取得しました`)
      setStaff(data || [])
      return data
    } catch (error) {
      console.error("スタッフデータの取得に失敗:", error)
      toast({
        title: "エラー",
        description: "スタッフデータの取得に失敗しました",
        variant: "destructive",
      })
      return []
    }
  }, [toast])

  // リソースデータの取得
  const fetchResources = useCallback(async () => {
    try {
      console.log("リソースデータの取得を開始")
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error("Supabaseクライアントの初期化に失敗しました")
      }

      const { data, error } = await supabase.from("resources").select("*").order("name", { ascending: true })

      if (error) {
        throw error
      }

      console.log(`${data?.length || 0}件のリソースデータを取得しました`)
      setResources(data || [])
      return data
    } catch (error) {
      console.error("リソースデータの取得に失敗:", error)
      toast({
        title: "エラー",
        description: "リソースデータの取得に失敗しました",
        variant: "destructive",
      })
      return []
    }
  }, [toast])

  // イベントデータの取得
  const fetchEvents = useCallback(async () => {
    try {
      console.log("イベントデータの取得を開始")
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error("Supabaseクライアントの初期化に失敗しました")
      }

      const { data, error } = await supabase
        .from("shifts")
        .select("*")
        .eq("event_type", "project")
        .order("start_time", { ascending: true })

      if (error) {
        throw error
      }

      // イベントデータの変換
      const formattedEvents =
        data?.map((event) => ({
          id: event.id,
          title: event.title,
          start: new Date(event.start_time),
          end: new Date(event.end_time),
          description: event.notes,
          project_id: event.project_id,
          staff_id: event.staff_id,
          resource_id: event.resource_id,
        })) || []

      console.log(`${formattedEvents.length}件のイベントデータを取得しました`)
      setEvents(formattedEvents)
      return formattedEvents
    } catch (error) {
      console.error("イベントデータの取得に失敗:", error)
      toast({
        title: "エラー",
        description: "イベントデータの取得に失敗しました",
        variant: "destructive",
      })
      return []
    }
  }, [toast])

  // 初期データの読み込み
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true)
      try {
        // 並列でデータを取得
        await Promise.all([fetchProjects(), fetchStaff(), fetchResources(), fetchEvents()])
      } catch (error) {
        console.error("初期データの読み込みに失敗:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [fetchProjects, fetchStaff, fetchResources, fetchEvents])

  // イベントの選択
  const handleSelectEvent = (event: any) => {
    console.log("イベントが選択されました:", event)
    setSelectedEvent(event)
    setIsDialogOpen(true)
  }

  // 新規イベントの作成
  const handleSelectSlot = (slotInfo: any) => {
    console.log("スロットが選択されました:", slotInfo)
    setSelectedEvent({
      start: slotInfo.start,
      end: slotInfo.end,
    })
    setIsDialogOpen(true)
  }

  // 新規ボタンのクリック
  const handleNewButtonClick = () => {
    console.log("案件カレンダー: 新規作成ボタンがクリックされました")

    // 現在の日付を基準に新しいイベントを作成
    const now = new Date()
    const start = new Date(now)
    start.setHours(9, 0, 0, 0)
    const end = new Date(now)
    end.setHours(17, 0, 0, 0)

    const newEvent = {
      start,
      end,
    }

    console.log("ダイアログを開きます", newEvent)
    setSelectedEvent(newEvent)
    setIsDialogOpen(true)
  }

  // イベントの追加
  const handleEventAdd = (event: any) => {
    setEvents((prev) => [...prev, event])
  }

  // イベントの更新
  const handleEventUpdate = (updatedEvent: any) => {
    setEvents((prev) => prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)))
  }

  // イベントの削除
  const handleEventDelete = (eventId: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== eventId))
  }

  // ダイアログの開閉状態の変更
  const handleDialogOpenChange = (open: boolean) => {
    console.log("ダイアログの開閉状態が変更されました:", open)
    setIsDialogOpen(open)
    if (!open) {
      setSelectedEvent(null)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">案件カレンダー</h2>
        <Button onClick={handleNewButtonClick} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          <span>新規</span>
        </Button>
      </div>

      <div className="flex-1">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          views={["month", "week", "day"]}
          defaultView={timeframe}
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
            work_week: "稼働日",
            yesterday: "昨日",
            tomorrow: "明日",
            noEventsInRange: "この期間にイベントはありません",
          }}
        />
      </div>

      <StaffAssignmentDialog
        open={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
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
