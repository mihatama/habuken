"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RefreshCw } from "lucide-react"
import { ProjectCalendar } from "@/components/project-calendar"
import { StaffCalendar } from "@/components/staff-calendar"
import { HeavyMachineryCalendar } from "@/components/heavy-machinery-calendar"
import { ToolCalendar } from "@/components/tool-calendar"

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

// メインのダッシュボードコンポーネント
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("projects")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    // 実際のデータ更新処理をここに追加
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  return (
    <DashboardLayout title="ダッシュボード" description="各種カレンダーと予約状況を一目で確認できます">
      <div className="flex justify-between items-center mb-6">
        <div className="w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="projects">案件カレンダー</TabsTrigger>
                <TabsTrigger value="staff">スタッフ休暇カレンダー</TabsTrigger>
                <TabsTrigger value="machinery">重機カレンダー</TabsTrigger>
                <TabsTrigger value="vehicles">車両カレンダー</TabsTrigger>
                <TabsTrigger value="tools">備品カレンダー</TabsTrigger>
              </TabsList>
              <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="sr-only">更新</span>
              </Button>
            </div>

            <TabsContent value="projects" className="mt-6">
              <ProjectCalendar />
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
