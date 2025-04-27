"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProjectCalendar } from "@/components/project-calendar"
import { StaffCalendar } from "@/components/staff-calendar"
import { ToolCalendar } from "@/components/tool-calendar"
import { ShiftManagement } from "@/components/shift-management"
import { getCalendarEvents } from "@/actions/calendar-events"
import { useCalendarData } from "@/hooks/use-calendar-data"

export function CalendarView() {
  const [activeTab, setActiveTab] = useState("project")
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { projects, staff, resources, loading: resourcesLoading } = useCalendarData()

  // カレンダーイベントを取得
  useEffect(() => {
    const fetchEvents = async () => {
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
        })

        if (result.success && result.data) {
          // イベントデータを変換
          const formattedEvents = result.data.map((event: any) => ({
            id: event.id,
            title: event.title,
            start: new Date(event.start_time),
            end: new Date(event.end_time),
            description: event.notes,
            projectId: event.project_id ? event.project_id : undefined,
            staffId: event.staff_id,
            toolId: event.resource_id,
            allDay: false, // APIからallDayフラグを取得する場合は変更
            // 関連データを追加
            projectData: event.projects,
            staffData: event.staff,
            resourceData: event.resources,
          }))
          setEvents(formattedEvents)
        }
      } catch (error) {
        console.error("カレンダーイベント取得エラー:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // イベント追加のハンドラ
  const handleEventAdd = async (event: any) => {
    try {
      // ここでAPIを呼び出してイベントを追加
      console.log("イベント追加:", event)
      // 成功したら、イベントリストを更新
      setEvents((prev) => [...prev, { ...event, id: Date.now() }]) // 仮のIDを設定
    } catch (error) {
      console.error("イベント追加エラー:", error)
    }
  }

  // イベント更新のハンドラ
  const handleEventUpdate = async (event: any) => {
    try {
      // ここでAPIを呼び出してイベントを更新
      console.log("イベント更新:", event)
      // 成功したら、イベントリストを更新
      setEvents((prev) => prev.map((e) => (e.id === event.id ? event : e)))
    } catch (error) {
      console.error("イベント更新エラー:", error)
    }
  }

  // イベント削除のハンドラ
  const handleEventDelete = async (eventId: number) => {
    try {
      // ここでAPIを呼び出してイベントを削除
      console.log("イベント削除:", eventId)
      // 成功したら、イベントリストを更新
      setEvents((prev) => prev.filter((e) => e.id !== eventId))
    } catch (error) {
      console.error("イベント削除エラー:", error)
    }
  }

  return (
    <Card className="col-span-3">
      <CardHeader className="pb-3">
        <CardTitle>カレンダー</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="project" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="project">案件</TabsTrigger>
            <TabsTrigger value="staff">スタッフ</TabsTrigger>
            <TabsTrigger value="tool">機材</TabsTrigger>
            <TabsTrigger value="shift">シフト</TabsTrigger>
          </TabsList>
          <TabsContent value="project" className="pt-4">
            <ProjectCalendar
              events={events.filter((event) => event.projectId)}
              onEventAdd={handleEventAdd}
              onEventUpdate={handleEventUpdate}
              onEventDelete={handleEventDelete}
            />
          </TabsContent>
          <TabsContent value="staff" className="pt-4">
            <StaffCalendar
              events={events.filter((event) => event.staffId)}
              onEventAdd={handleEventAdd}
              onEventUpdate={handleEventUpdate}
              onEventDelete={handleEventDelete}
            />
          </TabsContent>
          <TabsContent value="tool" className="pt-4">
            <ToolCalendar
              events={events.filter((event) => event.toolId)}
              onEventAdd={handleEventAdd}
              onEventUpdate={handleEventUpdate}
              onEventDelete={handleEventDelete}
            />
          </TabsContent>
          <TabsContent value="shift" className="pt-4">
            <ShiftManagement />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
