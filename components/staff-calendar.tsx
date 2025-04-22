"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus, Wrench, Briefcase, Users, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { sampleProjects, sampleStaff, sampleTools } from "@/data/sample-data"

export function StaffCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null)
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month")
  const [filterStaff, setFilterStaff] = useState<string>("all")

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  // スタッフをフィルタリング
  const filteredStaff =
    filterStaff === "all" ? sampleStaff : sampleStaff.filter((staff) => staff.id.toString() === filterStaff)

  // スタッフに紐づくプロジェクトを取得（改善版）
  const getStaffProjects = (staffId: number) => {
    const staff = sampleStaff.find((s) => s.id === staffId)
    if (!staff) return []

    return sampleProjects.filter((project) => staff.assignedProjects.includes(project.id))
  }

  // スタッフに紐づく重機を取得（改善版）
  const getStaffTools = (staffId: number) => {
    const staff = sampleStaff.find((s) => s.id === staffId)
    if (!staff || !staff.assignedTools) return []

    return sampleTools.filter((tool) => staff.assignedTools.includes(tool.id))
  }

  // スタッフの休暇を取得
  const getStaffVacations = (staffId: number) => {
    const staff = sampleStaff.find((s) => s.id === staffId)
    return staff ? staff.vacations : []
  }

  const renderCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)

    const days = []

    // 月の最初の日の前の空白セルを追加
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-muted bg-muted/20"></div>)
    }

    // 月の各日のセルを追加
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isToday = new Date().toDateString() === date.toDateString()
      const isSelected = selectedDate?.toDateString() === date.toDateString()

      // この日のスタッフの予定を検索
      const dayStaffEvents: any[] = []

      filteredStaff.forEach((staff) => {
        // 休暇の確認
        const vacations = getStaffVacations(staff.id)
        const hasVacation = vacations.some((v) => v.date.toDateString() === date.toDateString())

        if (hasVacation) {
          dayStaffEvents.push({
            type: "vacation",
            staff,
            date,
          })
        }

        // プロジェクトの確認
        const projects = getStaffProjects(staff.id)
        projects.forEach((project) => {
          const projectStart = new Date(project.startDate)
          const projectEnd = new Date(project.endDate)
          if (date >= projectStart && date <= projectEnd) {
            dayStaffEvents.push({
              type: "project",
              staff,
              project,
              date,
            })
          }
        })
      })

      days.push(
        <div
          key={day}
          className={cn(
            "h-24 border p-1 transition-colors hover:bg-muted/50 cursor-pointer",
            isToday && "bg-muted/30",
            isSelected && "bg-muted",
          )}
          onClick={() => setSelectedDate(date)}
        >
          <div className="flex justify-between">
            <span className={cn("text-sm font-medium", isToday && "text-primary")}>{day}</span>
          </div>
          <ScrollArea className="h-16 w-full">
            {dayStaffEvents.map((event, index) => {
              if (event.type === "vacation") {
                return (
                  <div
                    key={`vacation-${event.staff.id}-${index}`}
                    className="mt-1 rounded p-1 text-xs border bg-green-100 border-green-300"
                  >
                    <div className="font-medium truncate">{event.staff.name}</div>
                    <div className="text-xs">年次有給休暇</div>
                  </div>
                )
              } else if (event.type === "project") {
                return (
                  <Dialog key={`project-${event.staff.id}-${event.project.id}-${index}`}>
                    <DialogTrigger asChild>
                      <div
                        className="mt-1 rounded p-1 text-xs border bg-blue-100 border-blue-300"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedStaff(event.staff)
                        }}
                      >
                        <div className="font-medium truncate">{event.staff.name}</div>
                        <div className="text-xs truncate">{event.project.name}</div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          {event.staff.name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">役職</h4>
                            <p className="font-medium">{event.staff.position}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">担当エリア</h4>
                            <p className="font-medium">{event.staff.area || "未設定"}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">連絡先</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{event.staff.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{event.staff.phone}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">スキル・資格</h4>
                          <div className="flex flex-wrap gap-1">
                            {event.staff.skills.map((skill: string, index: number) => (
                              <Badge key={index} variant="outline">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-2">現在の案件</h4>
                          <div className="space-y-3">
                            <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">{event.project.name}</span>
                                <Badge>{event.project.status}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{event.project.client}</p>
                              <div className="text-sm">
                                {event.project.startDate.toLocaleDateString()} 〜{" "}
                                {event.project.endDate.toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">担当案件一覧</h4>
                          <div className="grid gap-2">
                            {getStaffProjects(event.staff.id).map((project) => (
                              <div key={project.id} className="flex items-center justify-between p-2 border rounded-md">
                                <div className="flex items-center gap-2">
                                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                                  <span>{project.name}</span>
                                </div>
                                <Badge variant="outline">{project.status}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">使用重機・車両</h4>
                          <div className="grid gap-2">
                            {getStaffTools(event.staff.id).map((tool) => (
                              <div key={tool.id} className="flex items-center justify-between p-2 border rounded-md">
                                <div className="flex items-center gap-2">
                                  <Wrench className="h-4 w-4 text-muted-foreground" />
                                  <span>{tool.name}</span>
                                </div>
                                <Badge variant="outline">{tool.category}</Badge>
                              </div>
                            ))}
                            {getStaffTools(event.staff.id).length === 0 && (
                              <p className="text-sm text-muted-foreground">担当する重機・車両はありません</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )
              }
              return null
            })}
          </ScrollArea>
        </div>,
      )
    }

    return days
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
    setSelectedDate(new Date())
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">
              {currentMonth.toLocaleDateString("ja-JP", { year: "numeric", month: "long" })}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={filterStaff} onValueChange={setFilterStaff}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="スタッフを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのスタッフ</SelectItem>
                {sampleStaff.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id.toString()}>
                    {staff.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={viewMode} onValueChange={(value: "month" | "week" | "day") => setViewMode(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="表示形式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">月表示</SelectItem>
                <SelectItem value="week">週表示</SelectItem>
                <SelectItem value="day">日表示</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={goToToday}>
              今日
            </Button>
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              新規作成
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
            <div key={day} className="text-center font-medium py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
      </CardContent>
    </Card>
  )
}
