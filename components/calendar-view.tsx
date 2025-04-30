"use client"

import { useState, useEffect } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "moment/locale/ja"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@supabase/supabase-js"
import { getCalendarEvents } from "@/actions/calendar-events"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw, Briefcase } from "lucide-react"
import { useRouter } from "next/navigation"

// 日本語ローカライザーの設定
moment.locale("ja")
const localizer = momentLocalizer(moment)

// イベントの型定義
interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource?: any
  type?: string
  description?: string
  project_id?: string
  staff_id?: string
  [key: string]: any
}

// プロジェクトの型定義
interface Project {
  id: string
  name: string
  [key: string]: any
}

// スタッフの型定義
interface Staff {
  id: string
  full_name: string
  [key: string]: any
}

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
  const [projects, setProjects] = useState<Project[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    end: "",
    type: "meeting", // デフォルト値
    description: "",
    project_id: "",
    staff_id: "",
  })
  const { toast } = useToast()
  const router = useRouter()

  // カレンダーイベントの取得
  const fetchData = async () => {
    setIsLoading(true)
    setError(null)

    try {
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

      // 日付文字列をDateオブジェクトに変換
      const formattedEvents = result.data.map((event: any) => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        description: event.notes,
        type: event.event_type,
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

  // 日付選択ハンドラー
  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start)
    const formattedDate = moment(start).format("YYYY-MM-DD")
    setNewEvent({
      ...newEvent,
      start: `${formattedDate}T09:00`,
      end: `${formattedDate}T10:00`,
    })
    setIsDialogOpen(true)
  }

  // イベント追加ハンドラー
  const handleAddEvent = async () => {
    try {
      // 入力検証
      if (!newEvent.title || !newEvent.start || !newEvent.end) {
        toast({
          title: "入力エラー",
          description: "タイトルと日時は必須です",
          variant: "destructive",
        })
        return
      }

      const supabase = getSupabaseClient()

      // Supabaseに保存するデータ形式に変換
      const eventData = {
        title: newEvent.title,
        start_time: newEvent.start,
        end_time: newEvent.end,
        event_type: newEvent.type,
        notes: newEvent.description,
        project_id: newEvent.project_id === "none" ? null : newEvent.project_id,
        staff_id: newEvent.staff_id === "none" ? null : newEvent.staff_id,
      }

      const { data, error } = await supabase.from("shifts").insert(eventData).select()

      if (error) throw error

      // 新しいイベントを追加
      if (data && data[0]) {
        const addedEvent = {
          ...data[0],
          start: new Date(data[0].start_time),
          end: new Date(data[0].end_time),
          type: data[0].event_type,
          description: data[0].notes,
        }
        setEvents([...events, addedEvent])
      }

      // フォームをリセット
      setNewEvent({
        title: "",
        start: "",
        end: "",
        type: "meeting",
        description: "",
        project_id: "",
        staff_id: "",
      })
      setIsDialogOpen(false)

      toast({
        title: "成功",
        description: "イベントが追加されました",
      })
    } catch (error) {
      console.error("イベント追加エラー:", error)
      toast({
        title: "エラー",
        description: "イベントの追加に失敗しました",
        variant: "destructive",
      })
    }
  }

  // 案件登録ページへ遷移
  const navigateToDealRegistration = () => {
    router.push("/deals/register")
  }

  // イベントの種類に応じたスタイルを取得
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = "#3174ad" // デフォルト色

    switch (event.type) {
      case "project":
        backgroundColor = "#3174ad" // 青
        break
      case "staff":
        backgroundColor = "#e53e3e" // 赤
        break
      case "tool":
        backgroundColor = "#38a169" // 緑
        break
      case "general":
        backgroundColor = "#805ad5" // 紫
        break
      default:
        backgroundColor = "#718096" // グレー
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

  // イベントの種類の日本語表示
  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "project":
        return "案件"
      case "staff":
        return "スタッフ"
      case "tool":
        return "機材"
      case "general":
        return "一般"
      default:
        return type
    }
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>カレンダー</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>エラーが発生しました</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={fetchData} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            再読み込み
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>カレンダー</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[600px]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p>読み込み中...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

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
        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            selectable
            onSelectSlot={handleSelectSlot}
            eventPropGetter={eventStyleGetter}
            views={["month", "week", "day"]}
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
              noEventsInRange: "表示できるイベントはありません",
            }}
            formats={{
              monthHeaderFormat: "YYYY年M月",
              dayHeaderFormat: "YYYY年M月D日(ddd)",
              dayRangeHeaderFormat: ({ start, end }) =>
                `${moment(start).format("YYYY年M月D日")} - ${moment(end).format("D日")}`,
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
