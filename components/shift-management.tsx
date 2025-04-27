"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "moment/locale/ja"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { fetchDataFromTable } from "@/lib/supabase/supabaseClient"
import { getCalendarEvents } from "@/actions/calendar-events"

// 日本語ロケールを設定
moment.locale("ja")
const localizer = momentLocalizer(moment)

// シフトの型定義
interface Shift {
  id: number
  title: string
  start: Date
  end: Date
  staffId: string
  staffName: string
  projectId?: string
  projectName?: string
}

export function ShiftManagement() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [viewMode, setViewMode] = useState<"month" | "week" | "day" | "agenda">("week")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  // シフトデータを取得
  useEffect(() => {
    const fetchShifts = async () => {
      setLoading(true)
      try {
        // 現在の月の最初と最後の日を計算
        const now = new Date()
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        // イベントを取得
        const result = await getCalendarEvents({
          startDate: firstDay.toISOString(),
          endDate: lastDay.toISOString(),
          eventType: "staff",
        })

        if (result.success && result.data) {
          // スタッフデータを取得
          const staffResult = await fetchDataFromTable("staff", {})
          const staffMap = new Map()

          if (staffResult.data) {
            staffResult.data.forEach((staff: any) => {
              staffMap.set(staff.id, staff.full_name)
            })
          }

          // プロジェクトデータを取得
          const projectsResult = await fetchDataFromTable("projects", {})
          const projectsMap = new Map()

          if (projectsResult.data) {
            projectsResult.data.forEach((project: any) => {
              projectsMap.set(project.id, project.name)
            })
          }

          // イベントデータを変換
          const formattedShifts = result.data
            .filter((event: any) => event.staff_id) // スタッフIDがあるイベントのみ
            .map((event: any) => {
              const staffName = event.staff ? event.staff.full_name : staffMap.get(event.staff_id) || "不明"
              const projectName = event.projects ? event.projects.name : projectsMap.get(event.project_id) || "不明"

              return {
                id: event.id,
                title: `${staffName}: ${projectName}`,
                start: new Date(event.start_time),
                end: new Date(event.end_time),
                staffId: event.staff_id,
                staffName: staffName,
                projectId: event.project_id,
                projectName: projectName,
              }
            })

          setShifts(formattedShifts)
        }
      } catch (error) {
        console.error("シフトデータ取得エラー:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchShifts()
  }, [])

  // イベントのスタイルをカスタマイズ
  const eventStyleGetter = (event: Shift) => {
    // スタッフIDに基づいて色を変更
    let backgroundColor = "#3174ad"

    if (event.staffId) {
      const staffIndex = Number.parseInt(event.staffId) % 5
      const colors = ["#3174ad", "#ff8c00", "#008000", "#9932cc", "#ff4500"]
      backgroundColor = colors[staffIndex]
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>シフト管理</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
              <TabsList>
                <TabsTrigger value="month">月表示</TabsTrigger>
                <TabsTrigger value="week">週表示</TabsTrigger>
                <TabsTrigger value="day">日表示</TabsTrigger>
                <TabsTrigger value="agenda">リスト</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              今日
            </Button>
          </div>

          <Button variant="default" size="sm">
            シフト追加
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-[700px]">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : (
          <div style={{ height: 700 }}>
            <Calendar
              localizer={localizer}
              events={shifts}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              views={["month", "week", "day", "agenda"]}
              view={viewMode}
              onView={(view) => setViewMode(view as any)}
              date={currentDate}
              onNavigate={(date) => setCurrentDate(date)}
              eventPropGetter={eventStyleGetter}
              messages={{
                today: "今日",
                previous: "前へ",
                next: "次へ",
                month: "月",
                week: "週",
                day: "日",
                agenda: "リスト",
                date: "日付",
                time: "時間",
                event: "イベント",
                allDay: "終日",
                showMore: (total) => `他 ${total} 件`,
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
