"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus, Users, Wrench, Briefcase, CalendarIcon, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { sampleProjects, sampleStaff, sampleTools } from "@/data/sample-data"

export function ProjectCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month")
  const [filterProject, setFilterProject] = useState<string>("all")

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  // プロジェクトをフィルタリング
  const filteredProjects =
    filterProject === "all"
      ? sampleProjects
      : sampleProjects.filter((project) => project.id.toString() === filterProject)

  // プロジェクトに紐づくスタッフを取得（改善版）
  const getProjectStaff = (projectId: number) => {
    const project = sampleProjects.find((p) => p.id === projectId)
    if (!project) return []

    return sampleStaff.filter((staff) => project.assignedStaff.includes(staff.id))
  }

  // プロジェクトに紐づく重機を取得（改善版）
  const getProjectTools = (projectId: number) => {
    const project = sampleProjects.find((p) => p.id === projectId)
    if (!project) return []

    return sampleTools.filter((tool) => project.assignedTools.includes(tool.id))
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

      // この日のプロジェクトを検索
      const dayProjects = filteredProjects.filter((project) => {
        const projectStart = new Date(project.startDate)
        const projectEnd = new Date(project.endDate)
        return date >= projectStart && date <= projectEnd
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
            {dayProjects.map((project) => (
              <Dialog key={project.id}>
                <DialogTrigger asChild>
                  <div
                    className={cn(
                      "mt-1 rounded p-1 text-xs border bg-blue-100 border-blue-300",
                      project.status === "進行中" && "bg-green-100 border-green-300",
                      project.status === "計画中" && "bg-yellow-100 border-yellow-300",
                      project.status === "未着手" && "bg-gray-100 border-gray-300",
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedProject(project)
                    }}
                  >
                    <div className="font-medium truncate">{project.name}</div>
                    <div className="text-xs truncate">{project.client}</div>
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      {project.name}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">ステータス</h4>
                        <Badge
                          className={cn(
                            project.status === "進行中" && "bg-green-500",
                            project.status === "計画中" && "bg-blue-500",
                            project.status === "未着手" && "bg-gray-500",
                            project.status === "完了" && "bg-purple-500",
                          )}
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">クライアント</h4>
                        <p className="font-medium">{project.client}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">期間</h4>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {project.startDate.toLocaleDateString()} 〜 {project.endDate.toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">場所</h4>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{project.location}</span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">プロジェクト詳細</h4>
                      <p className="text-sm">{project.description}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">担当スタッフ</h4>
                      <div className="grid gap-2">
                        {getProjectStaff(project.id).map((staff) => (
                          <div key={staff.id} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{staff.name}</span>
                            </div>
                            <Badge variant="outline">{staff.position}</Badge>
                          </div>
                        ))}
                        {getProjectStaff(project.id).length === 0 && (
                          <p className="text-sm text-muted-foreground">担当スタッフはまだ割り当てられていません</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">使用重機・車両</h4>
                      <div className="grid gap-2">
                        {getProjectTools(project.id).map((tool) => (
                          <div key={tool.id} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex items-center gap-2">
                              <Wrench className="h-4 w-4 text-muted-foreground" />
                              <span>{tool.name}</span>
                            </div>
                            <Badge variant="outline">{tool.status}</Badge>
                          </div>
                        ))}
                        {getProjectTools(project.id).length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            使用する重機・車両はまだ割り当てられていません
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
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
            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="案件を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての案件</SelectItem>
                {sampleProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
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
