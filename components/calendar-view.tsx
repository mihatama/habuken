"use client"

import { useState, useEffect } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "moment/locale/ja"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@supabase/supabase-js"
import { getCalendarEvents } from "@/actions/calendar-events"

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
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
)

export function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
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

  // カレンダーイベントの取得
  useEffect(() => {
    async function fetchEvents() {
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
      } catch (error) {
        console.error("イベント取得エラー:", error)
        toast({
          title: "エラー",
          description: "カレンダーイベントの取得に失敗しました",
          variant: "destructive",
        })
      }
    }

    async function fetchProjects() {
      try {
        const { data, error } = await supabase.from("projects").select("id, name")

        if (error) throw error
        setProjects(data || [])
      } catch (error) {
        console.error("プロジェクト取得エラー:", error)
      }
    }

    async function fetchStaff() {
      try {
        const { data, error } = await supabase.from("staff").select("id, full_name")

        if (error) throw error
        setStaff(data || [])
      } catch (error) {
        console.error("スタッフ取得エラー:", error)
      }
    }

    fetchEvents()
    fetchProjects()
    fetchStaff()
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

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>カレンダー</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>イベント追加</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新しいイベント</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">タイトル</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="イベントタイトル"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start">開始日時</Label>
                  <Input
                    id="start"
                    type="datetime-local"
                    value={newEvent.start}
                    onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end">終了日時</Label>
                  <Input
                    id="end"
                    type="datetime-local"
                    value={newEvent.end}
                    onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">イベントタイプ</Label>
                <Select value={newEvent.type} onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="イベントタイプを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project">案件</SelectItem>
                    <SelectItem value="staff">スタッフ</SelectItem>
                    <SelectItem value="tool">機材</SelectItem>
                    <SelectItem value="general">一般</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project">プロジェクト</Label>
                <Select
                  value={newEvent.project_id}
                  onValueChange={(value) => setNewEvent({ ...newEvent, project_id: value })}
                >
                  <SelectTrigger id="project">
                    <SelectValue placeholder="プロジェクトを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">なし</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="staff">担当者</Label>
                <Select
                  value={newEvent.staff_id}
                  onValueChange={(value) => setNewEvent({ ...newEvent, staff_id: value })}
                >
                  <SelectTrigger id="staff">
                    <SelectValue placeholder="担当者を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">なし</SelectItem>
                    {staff.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">詳細</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="イベントの詳細"
                />
              </div>
              <Button onClick={handleAddEvent}>追加</Button>
            </div>
          </DialogContent>
        </Dialog>
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
