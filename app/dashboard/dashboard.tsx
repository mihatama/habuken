"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RefreshCw, Calendar, Users, Truck, Car, BoxIcon } from "lucide-react"
import { StaffCalendar } from "@/components/staff-calendar"
import { HeavyMachineryCalendar } from "@/components/heavy-machinery-calendar"
import { ToolCalendar } from "@/components/tool-calendar"
import { useProjects } from "@/hooks/use-projects"
import { DealResourceCalendar } from "@/components/deal-resource-calendar"

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
                  <BoxIcon className="h-4 w-4 mr-2" />
                  工具カレンダー
                </TabsTrigger>
              </TabsList>
              <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="sr-only">更新</span>
              </Button>
            </div>

            <TabsContent value="projects" className="mt-6">
              <div className="grid grid-cols-1 gap-6">
                <DealResourceCalendar />
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
