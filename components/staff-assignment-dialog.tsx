"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { fetchDataFromTable } from "@/lib/supabase/supabaseClient"

// イベントの型定義
interface CalendarEvent {
  id: number
  title: string
  start: Date
  end: Date
  description?: string
  projectId?: number
  staffIds?: string[]
  toolIds?: string[]
  allDay?: boolean
}

// ダイアログのprops型定義
interface StaffAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventData: CalendarEvent | null
  onEventAdd?: (event: CalendarEvent) => void
  onEventUpdate?: (event: CalendarEvent) => void
  onEventDelete?: (eventId: number) => void
}

export function StaffAssignmentDialog({
  open,
  onOpenChange,
  eventData,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
}: StaffAssignmentDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState<string>("")
  const [startTime, setStartTime] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [endTime, setEndTime] = useState<string>("")
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [selectedStaff, setSelectedStaff] = useState<string[]>([])
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [isAllDay, setIsAllDay] = useState(false)

  // データベースから取得したデータを保持する状態
  const [projects, setProjects] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [tools, setTools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // データの取得
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // プロジェクトデータの取得
        const projectsResult = await fetchDataFromTable("projects", {
          order: { column: "name", ascending: true },
        })
        if (projectsResult.data) {
          setProjects(projectsResult.data)
        }

        // スタッフデータの取得
        const staffResult = await fetchDataFromTable("staff", {
          order: { column: "full_name", ascending: true },
        })
        if (staffResult.data) {
          setStaff(staffResult.data)
        }

        // ツールデータの取得
        const toolsResult = await fetchDataFromTable("tools", {
          order: { column: "name", ascending: true },
        })
        if (toolsResult.data) {
          setTools(toolsResult.data)
        }
      } catch (error) {
        console.error("データ取得エラー:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // イベントデータが変更されたときにフォームを更新
  useEffect(() => {
    if (eventData) {
      setTitle(eventData.title || "")
      setDescription(eventData.description || "")

      // 日付と時間を設定
      const start = eventData.start
      const end = eventData.end

      setStartDate(formatDateForInput(start))
      setStartTime(formatTimeForInput(start))
      setEndDate(formatDateForInput(end))
      setEndTime(formatTimeForInput(end))

      // プロジェクト、スタッフ、ツールを設定
      setSelectedProject(eventData.projectId?.toString() || "")
      setSelectedStaff(eventData.staffIds || [])
      setSelectedTools(eventData.toolIds || [])
      setIsAllDay(eventData.allDay || false)
    }
  }, [eventData])

  // 日付をinput用にフォーマット (YYYY-MM-DD)
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // 時間をinput用にフォーマット (HH:MM)
  const formatTimeForInput = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${hours}:${minutes}`
  }

  // 保存ボタンをクリックしたときのハンドラ
  const handleSave = () => {
    if (!title || !startDate || !endDate) {
      alert("タイトル、開始日、終了日は必須です")
      return
    }

    // 開始日時と終了日時を作成
    const start = new Date(`${startDate}T${startTime || "00:00"}`)
    const end = new Date(`${endDate}T${endTime || "23:59"}`)

    // 終了日が開始日より前の場合はエラー
    if (end < start) {
      alert("終了日時は開始日時より後にしてください")
      return
    }

    // イベントデータを作成
    const updatedEvent: CalendarEvent = {
      id: eventData?.id || 0,
      title,
      start,
      end,
      description,
      projectId: selectedProject ? Number(selectedProject) : undefined,
      staffIds: selectedStaff.length > 0 ? selectedStaff : undefined,
      toolIds: selectedTools.length > 0 ? selectedTools : undefined,
      allDay: isAllDay,
    }

    // 新規作成または更新
    if (eventData?.id === 0 || !eventData?.id) {
      if (onEventAdd) onEventAdd(updatedEvent)
    } else {
      if (onEventUpdate) onEventUpdate(updatedEvent)
    }

    // ダイアログを閉じる
    onOpenChange(false)
  }

  // 削除ボタンをクリックしたときのハンドラ
  const handleDelete = () => {
    if (eventData?.id && eventData.id > 0) {
      if (window.confirm("このイベントを削除してもよろしいですか？")) {
        if (onEventDelete) onEventDelete(eventData.id)
        onOpenChange(false)
      }
    }
  }

  // スタッフの選択状態を切り替えるハンドラ
  const toggleStaffSelection = (staffId: string) => {
    setSelectedStaff((prev) => {
      if (prev.includes(staffId)) {
        return prev.filter((id) => id !== staffId)
      } else {
        return [...prev, staffId]
      }
    })
  }

  // ツールの選択状態を切り替えるハンドラ
  const toggleToolSelection = (toolId: string) => {
    setSelectedTools((prev) => {
      if (prev.includes(toolId)) {
        return prev.filter((id) => id !== toolId)
      } else {
        return [...prev, toolId]
      }
    })
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{eventData?.id && eventData.id > 0 ? "イベントを編集" : "新規イベント"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              タイトル
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              説明
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project" className="text-right">
              プロジェクト
            </Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="プロジェクトを選択" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">スタッフ</Label>
            <div className="col-span-3 grid grid-cols-2 gap-2">
              {staff.map((staffMember) => (
                <div key={staffMember.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`staff-${staffMember.id}`}
                    checked={selectedStaff.includes(staffMember.id)}
                    onCheckedChange={() => toggleStaffSelection(staffMember.id)}
                  />
                  <Label htmlFor={`staff-${staffMember.id}`}>{staffMember.full_name}</Label>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">機材</Label>
            <div className="col-span-3 grid grid-cols-2 gap-2">
              {tools.map((tool) => (
                <div key={tool.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tool-${tool.id}`}
                    checked={selectedTools.includes(tool.id.toString())}
                    onCheckedChange={() => toggleToolSelection(tool.id.toString())}
                  />
                  <Label htmlFor={`tool-${tool.id}`}>{tool.name}</Label>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start-date" className="text-right">
              開始日
            </Label>
            <div className="col-span-3 flex gap-2">
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1"
                required
              />
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-32"
                disabled={isAllDay}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end-date" className="text-right">
              終了日
            </Label>
            <div className="col-span-3 flex gap-2">
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1"
                required
              />
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-32"
                disabled={isAllDay}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div></div>
            <div className="col-span-3 flex items-center space-x-2">
              <Checkbox id="all-day" checked={isAllDay} onCheckedChange={(checked) => setIsAllDay(!!checked)} />
              <Label htmlFor="all-day">終日</Label>
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <div>
            {eventData?.id && eventData.id > 0 && (
              <Button variant="destructive" onClick={handleDelete}>
                削除
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
