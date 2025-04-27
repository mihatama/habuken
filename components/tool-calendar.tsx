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

// 日本語ローカライザーの設定
moment.locale("ja")
const localizer = momentLocalizer(moment)

// イベントの型定義
interface ToolEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource_id: string
  resource_name?: string
  project_id?: string
  project_name?: string
  staff_id?: string
  staff_name?: string
  status: string
  notes?: string
  [key: string]: any
}

// ツールの型定義
interface Tool {
  id: string
  name: string
  type: string
  status: string
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

export function ToolCalendar() {
  const [events, setEvents] = useState<ToolEvent[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    end: "",
    resource_id: "",
    project_id: "",
    staff_id: "",
    status: "scheduled", // デフォルト値
    notes: "",
  })
  const { toast } = useToast()

  // データの取得
  useEffect(() => {
    async function fetchData() {
      try {
        // ツール予約イベントの取得
        const { data: eventData, error: eventError } = await supabase
          .from("tool_reservations")
          .select(
            `
            id,
            title,
            start_time,
            end_time,
            resource_id,
            resources:resource_id(name),
            project_id,
            projects:project_id(name),
            staff_id,
            staff:staff_id(full_name),
            status,
            notes
          `,
          )
          .order("start_time", { ascending: true })

        if (eventError) throw eventError

        // 日付文字列をDateオブジェクトに変換
        const formattedEvents = (eventData || []).map((event) => ({
          ...event,
          start: new Date(event.start_time),
          end: new Date(event.end_time),
          resource_name: event.resources?.name,
          project_name: event.projects?.name,
          staff_name: event.staff?.full_name,
        }))

        setEvents(formattedEvents)

        // ツールの取得
        const { data: toolData, error: toolError } = await supabase
          .from("resources")
          .select("*")
          .eq("type", "工具")
          .eq("status", "利用可能")

        if (toolError) throw toolError
        setTools(toolData || [])

        // プロジェクトの取得
        const { data: projectData, error: projectError } = await supabase.from("projects").select("id, name")

        if (projectError) throw projectError
        setProjects(projectData || [])

        // スタッフの取得
        const { data: staffData, error: staffError } = await supabase.from("staff").select("id, full_name")

        if (staffError) throw staffError
        setStaff(staffData || [])
      } catch (error) {
        console.error("データ取得エラー:", error)
        toast({
          title: "エラー",
          description: "データの取得に失敗しました",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [toast])

  // 日付選択ハンドラー
  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start)
    const formattedDate = moment(start).format("YYYY-MM-DD")
    setNewEvent({
      ...newEvent,
      start: `${formattedDate}T09:00`,
      end: `${formattedDate}T17:00`,
    })
    setIsDialogOpen(true)
  }

  // イベント追加ハンドラー
  const handleAddEvent = async () => {
    try {
      // 入力検証
      if (!newEvent.title || !newEvent.start || !newEvent.end || !newEvent.resource_id) {
        toast({
          title: "入力エラー",
          description: "タイトル、日時、工具は必須です",
          variant: "destructive",
        })
        return
      }

      // 選択された工具の情報を取得
      const selectedTool = tools.find((tool) => tool.id === newEvent.resource_id)

      // Supabaseに保存するデータ形式に変換
      const eventData = {
        title: newEvent.title,
        start_time: newEvent.start,
        end_time: newEvent.end,
        resource_id: newEvent.resource_id,
        project_id: newEvent.project_id || null,
        staff_id: newEvent.staff_id || null,
        status: newEvent.status,
        notes: newEvent.notes,
      }

      const { data, error } = await supabase.from("tool_reservations").insert(eventData).select()

      if (error) throw error

      // 工具の状態を「利用中」に更新
      await supabase.from("resources").update({ status: "利用中" }).eq("id", newEvent.resource_id)

      // 新しいイベントを追加
      if (data && data[0]) {
        const addedEvent = {
          ...data[0],
          start: new Date(data[0].start_time),
          end: new Date(data[0].end_time),
          resource_name: selectedTool?.name,
          project_name: projects.find((p) => p.id === data[0].project_id)?.name,
          staff_name: staff.find((s) => s.id === data[0].staff_id)?.full_name,
        }
        setEvents([...events, addedEvent])

        // ツールリストを更新
        setTools(
          tools.map((tool) => {
            if (tool.id === newEvent.resource_id) {
              return { ...tool, status: "利用中" }
            }
            return tool
          }),
        )
      }

      // フォームをリセット
      setNewEvent({
        title: "",
        start: "",
        end: "",
        resource_id: "",
        project_id: "",
        staff_id: "",
        status: "scheduled",
        notes: "",
      })
      setIsDialogOpen(false)

      toast({
        title: "成功",
        description: "工具予約が追加されました",
      })
    } catch (error) {
      console.error("予約追加エラー:", error)
      toast({
        title: "エラー",
        description: "予約の追加に失敗しました",
        variant: "destructive",
      })
    }
  }

  // イベントの状態に応じたスタイルを取得
  const eventStyleGetter = (event: ToolEvent) => {
    let backgroundColor = "#3174ad" // デフォルト色

    switch (event.status) {
      case "scheduled":
        backgroundColor = "#3174ad" // 青
        break
      case "in_use":
        backgroundColor = "#38a169" // 緑
        break
      case "completed":
        backgroundColor = "#718096" // グレー
        break
      case "cancelled":
        backgroundColor = "#e53e3e" // 赤
        break
      default:
        backgroundColor = "#3174ad" // デフォルト青
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

  // イベントの状態の日本語表示
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "scheduled":
        return "予約済"
      case "in_use":
        return "使用中"
      case "completed":
        return "完了"
      case "cancelled":
        return "キャンセル"
      default:
        return status
    }
  }

  // イベントのタイトル表示をカスタマイズ
  const eventTitleAccessor = (event: ToolEvent) => {
    return `${event.title} (${event.resource_name || "不明な工具"})`
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>工具予約カレンダー</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>予約追加</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新しい工具予約</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">タイトル</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="予約タイトル"
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
                <Label htmlFor="tool">工具</Label>
                <Select
                  value={newEvent.resource_id}
                  onValueChange={(value) => setNewEvent({ ...newEvent, resource_id: value })}
                >
                  <SelectTrigger id="tool">
                    <SelectValue placeholder="工具を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {tools.map((tool) => (
                      <SelectItem key={tool.id} value={tool.id}>
                        {tool.name}
                      </SelectItem>
                    ))}
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
                <Label htmlFor="status">ステータス</Label>
                <Select value={newEvent.status} onValueChange={(value) => setNewEvent({ ...newEvent, status: value })}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="ステータスを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">予約済</SelectItem>
                    <SelectItem value="in_use">使用中</SelectItem>
                    <SelectItem value="completed">完了</SelectItem>
                    <SelectItem value="cancelled">キャンセル</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">備考</Label>
                <Textarea
                  id="notes"
                  value={newEvent.notes}
                  onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                  placeholder="備考や特記事項"
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
            titleAccessor={eventTitleAccessor}
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
