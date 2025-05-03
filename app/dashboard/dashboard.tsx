"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RefreshCw, Calendar, Users, Truck, Car, PenToolIcon as Tool } from "lucide-react"
import { ProjectList } from "@/components/project-list"
import { StaffCalendar } from "@/components/staff-calendar"
import { HeavyMachineryCalendar } from "@/components/heavy-machinery-calendar"
import { ToolCalendar } from "@/components/tool-calendar"
import { useProjects } from "@/hooks/use-projects"
import { useToast } from "@/hooks/use-toast"
import type { Project } from "@/types/models/project"
import type { CalendarEvent } from "@/actions/calendar-events"

// 車両カレンダーコンポーネント（既存のコンポーネントがない場合）
function DefaultVehicleCalendar() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>車両カレンダー</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <p>車両の予約状況を表示します。</p>
        </div>
      </CardContent>
    </Card>
  )
}

// 案件をカレンダーイベントに変換する関数
function projectsToCalendarEvents(projects: Project[]): CalendarEvent[] {
  return projects.map((project) => {
    const startDate = new Date(project.start_date)
    const endDate = project.end_date ? new Date(project.end_date) : new Date(startDate)

    // 終了日が設定されていない場合は開始日の1週間後を終了日とする
    if (!project.end_date) {
      endDate.setDate(startDate.getDate() + 7)
    }

    return {
      id: project.id,
      title: project.name,
      start_time: startDate,
      end_time: endDate,
      notes: project.description || undefined,
      project_id: project.id,
      event_type: "project",
    }
  })
}

// 実際の案件データを使用するProjectCalendarコンポーネント
function RealProjectCalendar() {
  const { data: projects = [], isLoading, refetch } = useProjects()
  const { toast } = useToast()
  const [events, setEvents] = useState<CalendarEvent[]>([])

  useEffect(() => {
    if (projects && projects.length > 0) {
      try {
        const calendarEvents = projectsToCalendarEvents(projects)
        setEvents(calendarEvents)
      } catch (error) {
        console.error("案件データの変換エラー:", error)
        toast({
          title: "エラー",
          description: "案件データの変換中にエラーが発生しました",
          variant: "destructive",
        })
      }
    }
  }, [projects, toast])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>案件カレンダー</CardTitle>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          更新
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="h-[600px]">
            {/* EnhancedCalendarコンポーネントを使用 */}
            <iframe src="/master/project" className="w-full h-full border-none" title="案件カレンダー" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// メインのダッシュボードコンポーネント
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("projects")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { refetch: refetchProjects } = useProjects()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetchProjects()
    } catch (error) {
      console.error("データ更新エラー:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <DashboardLayout title="ダッシュボード" description="各種カレンダーと予約状況を一目で確認できます">
      <div className="flex justify-between items-center mb-6">
        <div className="w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="projects" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  案件カレンダー
                </TabsTrigger>
                <TabsTrigger value="staff" className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  スタッフ休暇カレンダー
                </TabsTrigger>
                <TabsTrigger value="machinery" className="flex items-center">
                  <Truck className="h-4 w-4 mr-2" />
                  重機カレンダー
                </TabsTrigger>
                <TabsTrigger value="vehicles" className="flex items-center">
                  <Car className="h-4 w-4 mr-2" />
                  車両カレンダー
                </TabsTrigger>
                <TabsTrigger value="tools" className="flex items-center">
                  <Tool className="h-4 w-4 mr-2" />
                  備品カレンダー
                </TabsTrigger>
              </TabsList>
              <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="sr-only">更新</span>
              </Button>
            </div>

            <TabsContent value="projects" className="mt-6">
              <div className="grid grid-cols-1 gap-6">
                <RealProjectCalendar />
                <ProjectList />
              </div>
            </TabsContent>

            <TabsContent value="staff" className="mt-6">
              <StaffCalendar />
            </TabsContent>

            <TabsContent value="machinery" className="mt-6">
              <HeavyMachineryCalendar />
            </TabsContent>

            <TabsContent value="vehicles" className="mt-6">
              <DefaultVehicleCalendar />
            </TabsContent>

            <TabsContent value="tools" className="mt-6">
              <ToolCalendar />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  )
}
