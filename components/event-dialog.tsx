"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { CalendarEvent } from "@/types/calendar"
import { useCalendarData } from "@/hooks/use-calendar-data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: CalendarEvent | null
  viewType: "project" | "staff" | "tool"
  onEventAdd?: (event: CalendarEvent) => void
  onEventUpdate?: (event: CalendarEvent) => void
  onEventDelete?: (eventId: string) => void
}

export function EventDialog({
  open,
  onOpenChange,
  event,
  viewType,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
}: EventDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")
  const [projectId, setProjectId] = useState("")
  const [staffId, setStaffId] = useState("")
  const [resourceId, setResourceId] = useState("")
  const [isAllDay, setIsAllDay] = useState(false)

  const { projects, staff, resources, loading } = useCalendarData()

  // イベントデータが変更されたときにフォームを更新
  useEffect(() => {
    if (event) {
      setTitle(event.title || "")
      setDescription(event.description || "")

      // 日付と時間を設定
      const start = new Date(event.start)
      const end = new Date(event.end)

      setStartDate(format(start, "yyyy-MM-dd"))
      setStartTime(format(start, "HH:mm"))
      setEndDate(format(end, "yyyy-MM-dd"))
      setEndTime(format(end, "HH:mm"))

      setProjectId(event.project_id || "")
      setStaffId(event.staff_id || "")
      setResourceId(event.resource_id || "")
      setIsAllDay(event.allDay || false)
    }
  }, [event])

  // フォームをリセット
  const resetForm = () => {
    setTitle("")
    setDescription("")
    setStartDate("")
    setStartTime("")
    setEndDate("")
    setEndTime("")
    setProjectId("")
    setStaffId("")
    setResourceId("")
    setIsAllDay(false)
  }

  // 保存ボタンのハンドラ
  const handleSave = () => {
    if (!title || !startDate || (!isAllDay && !startTime) || !endDate || (!isAllDay && !endTime)) {
      alert("必須項目を入力してください")
      return
    }

    // 開始日時と終了日時を作成
    const start = new Date(`${startDate}T${isAllDay ? "00:00" : startTime}`)
    const end = new Date(`${endDate}T${isAllDay ? "23:59" : endTime}`)

    // 終了日時が開始日時より前の場合はエラー
    if (end < start) {
      alert("終了日時は開始日時より後にしてください")
      return
    }

    const updatedEvent: CalendarEvent = {
      id: event?.id || "",
      title,
      description,
      start,
      end,
      project_id: projectId || undefined,
      staff_id: staffId || undefined,
      resource_id: resourceId || undefined,
      event_type: viewType === "tool" ? "tool" : viewType === "staff" ? "staff" : "project",
      allDay: isAllDay,
    }

    if (event?.id) {
      // 既存イベントの更新
      if (onEventUpdate) onEventUpdate(updatedEvent)
    } else {
      // 新規イベントの追加
      if (onEventAdd) onEventAdd(updatedEvent)
    }

    onOpenChange(false)
    resetForm()
  }

  // 削除ボタンのハンドラ
  const handleDelete = () => {
    if (event?.id && onEventDelete) {
      if (confirm("このイベントを削除してもよろしいですか？")) {
        onEventDelete(event.id)
        onOpenChange(false)
        resetForm()
      }
    }
  }

  // キャンセルボタンのハンドラ
  const handleCancel = () => {
    onOpenChange(false)
    resetForm()
  }

  // ダイアログのタイトルを取得
  const getDialogTitle = () => {
    if (event?.id) {
      return "イベントを編集"
    }
    return "新規イベント"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              タイトル *
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
            <Label htmlFor="all-day" className="text-right">
              終日
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Checkbox
                id="all-day"
                checked={isAllDay}
                onCheckedChange={(checked) => setIsAllDay(checked as boolean)}
              />
              <label
                htmlFor="all-day"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                終日イベント
              </label>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start-date" className="text-right">
              開始日時 *
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
              {!isAllDay && (
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-24"
                  required
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end-date" className="text-right">
              終了日時 *
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
              {!isAllDay && (
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-24"
                  required
                />
              )}
            </div>
          </div>

          {/* プロジェクト選択（プロジェクトビューまたは全てのビュー） */}
          {(viewType === "project" || viewType === "staff") && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project" className="text-right">
                プロジェクト
              </Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="プロジェクトを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">選択なし</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* スタッフ選択（スタッフビューまたは全てのビュー） */}
          {(viewType === "staff" || viewType === "project") && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="staff" className="text-right">
                スタッフ
              </Label>
              <Select value={staffId} onValueChange={setStaffId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="スタッフを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">選択なし</SelectItem>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* リソース選択（ツールビューまたは全てのビュー） */}
          {viewType === "tool" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="resource" className="text-right">
                機材
              </Label>
              <Select value={resourceId} onValueChange={setResourceId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="機材を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">選択なし</SelectItem>
                  {resources.map((resource) => (
                    <SelectItem key={resource.id} value={resource.id}>
                      {resource.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              説明
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <div>
            {event?.id && (
              <Button variant="destructive" onClick={handleDelete}>
                削除
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              キャンセル
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
