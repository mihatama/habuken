"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { getClientSupabase } from "@/lib/supabase-utils"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  Construction,
  FileText,
  RefreshCw,
  Truck,
  Users,
  Wrench,
} from "lucide-react"
import { KpiCard } from "./components/kpi-card"
import { ResourceUtilizationChart } from "./components/resource-utilization-chart"
import { CostOptimizationPanel } from "./components/cost-optimization-panel"
import { ProjectProgressPanel } from "./components/project-progress-panel"
import { StaffAllocationChart } from "./components/staff-allocation-chart"
import { CalendarPanel } from "./components/calendar-panel"
import { RecentActivitiesPanel } from "./components/recent-activities-panel"
import { formatCurrency } from "@/utils/format-utils"

export function DashboardClient() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    activeProjects: 0,
    totalProjects: 0,
    activeStaff: 0,
    totalStaff: 0,
    resourcesInUse: 0,
    totalResources: 0,
    pendingLeaveRequests: 0,
    monthlyReports: 0,
    resourceUtilization: [],
    projectProgress: [],
    staffAllocation: [],
    recentActivities: [],
    costSavings: 0,
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const supabase = getClientSupabase()

      // 案件データの取得
      const { data: dealsData, error: dealsError } = await supabase.from("deals").select("*")

      if (dealsError) throw dealsError

      const activeProjects =
        dealsData?.filter((deal) => deal.status === "進行中" || deal.status === "準備中").length || 0

      // スタッフデータの取得
      const { data: staffData, error: staffError } = await supabase.from("staff").select("*")

      if (staffError) throw staffError

      const activeStaff = staffData?.filter((staff) => staff.status === "active").length || 0

      // リソースデータの取得（重機、車両、工具）
      const { data: heavyMachineryData, error: heavyMachineryError } = await supabase
        .from("heavy_machinery")
        .select("*")

      if (heavyMachineryError) throw heavyMachineryError

      const { data: vehiclesData, error: vehiclesError } = await supabase.from("vehicles").select("*")

      if (vehiclesError) throw vehiclesError

      const { data: toolsData, error: toolsError } = await supabase.from("resources").select("*").eq("type", "工具")

      if (toolsError) throw toolsError

      const totalResources = (heavyMachineryData?.length || 0) + (vehiclesData?.length || 0) + (toolsData?.length || 0)

      // 休暇申請データの取得
      const { data: leaveRequestsData, error: leaveRequestsError } = await supabase
        .from("leave_requests")
        .select("*")
        .eq("status", "pending")

      if (leaveRequestsError) throw leaveRequestsError

      // 日報データの取得
      const currentDate = new Date()
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString()
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString()

      const { data: reportsData, error: reportsError } = await supabase
        .from("daily_reports")
        .select("*")
        .gte("report_date", firstDayOfMonth)
        .lte("report_date", lastDayOfMonth)

      if (reportsError) throw reportsError

      // リソース稼働率データの作成
      const resourceUtilization = [
        { name: "重機", 稼働中: 0, 利用可能: heavyMachineryData?.length || 0 },
        { name: "車両", 稼働中: 0, 利用可能: vehiclesData?.length || 0 },
        { name: "工具", 稼働中: 0, 利用可能: toolsData?.length || 0 },
      ]

      // 現在使用中のリソースを計算
      const currentDate2 = new Date().toISOString()

      // 重機予約の確認
      try {
        const { data: machineryReservations, error: machineryReservationsError } = await supabase
          .from("machinery_reservations")
          .select("*")
          .lte("start_date", currentDate2)
          .gte("end_date", currentDate2)

        if (!machineryReservationsError) {
          resourceUtilization[0].稼働中 = machineryReservations?.length || 0
        }
      } catch (error) {
        console.error("重機予約データの取得に失敗しました:", error)
      }

      // 車両予約の確認
      try {
        const { data: vehicleReservations, error: vehicleReservationsError } = await supabase
          .from("vehicle_reservations")
          .select("*")
          .lte("start_date", currentDate2)
          .gte("end_date", currentDate2)

        if (!vehicleReservationsError) {
          resourceUtilization[1].稼働中 = vehicleReservations?.length || 0
        }
      } catch (error) {
        console.error("車両予約データの取得に失敗しました:", error)
      }

      // 工具予約の確認
      try {
        const { data: toolReservations, error: toolReservationsError } = await supabase
          .from("tool_reservations")
          .select("*")
          .lte("start_date", currentDate2)
          .gte("end_date", currentDate2)

        if (!toolReservationsError) {
          resourceUtilization[2].稼働中 = toolReservations?.length || 0
        }
      } catch (error) {
        console.error("工具予約データの取得に失敗しました:", error)
      }

      const resourcesInUse =
        resourceUtilization[0].稼働中 + resourceUtilization[1].稼働中 + resourceUtilization[2].稼働中

      // 案件進捗データの作成
      const projectProgress =
        dealsData?.map((deal) => ({
          id: deal.id,
          name: deal.name,
          startDate: deal.start_date,
          endDate: deal.end_date,
          status: deal.status,
          progress: calculateProgress(deal.start_date, deal.end_date),
        })) || []

      // スタッフ稼働内訳データの作成
      const staffAllocation = [
        { name: "案件アサイン", value: 0 },
        { name: "休暇中", value: 0 },
        { name: "未アサイン", value: 0 },
      ]

      // 案件にアサインされているスタッフを確認
      const { data: dealStaffData, error: dealStaffError } = await supabase.from("deal_staff").select("staff_id")

      if (!dealStaffError) {
        const assignedStaffIds = new Set(dealStaffData?.map((item) => item.staff_id))
        staffAllocation[0].value = assignedStaffIds.size

        // 休暇中のスタッフを確認
        const { data: onLeaveData, error: onLeaveError } = await supabase
          .from("leave_requests")
          .select("staff_id")
          .eq("status", "approved")
          .lte("start_date", currentDate2)
          .gte("end_date", currentDate2)

        if (!onLeaveError) {
          const onLeaveStaffIds = new Set(onLeaveData?.map((item) => item.staff_id))
          staffAllocation[1].value = onLeaveStaffIds.size
        }

        // 未アサインのスタッフ数を計算
        staffAllocation[2].value = (staffData?.length || 0) - staffAllocation[0].value - staffAllocation[1].value
      }

      // 最近のアクティビティデータの作成
      const recentActivities = []

      // 最近の日報
      if (reportsData && reportsData.length > 0) {
        const recentReports = reportsData
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3)

        recentReports.forEach((report) => {
          recentActivities.push({
            id: report.id,
            type: "report",
            title: `日報: ${report.custom_project_name || "案件名なし"}`,
            date: report.report_date,
            description: report.work_description.substring(0, 50) + (report.work_description.length > 50 ? "..." : ""),
          })
        })
      }

      // 最近の休暇申請
      if (leaveRequestsData && leaveRequestsData.length > 0) {
        const recentLeaveRequests = leaveRequestsData
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3)

        recentLeaveRequests.forEach((request) => {
          recentActivities.push({
            id: request.id,
            type: "leave",
            title: `休暇申請: ${request.staff_id}`,
            date: request.start_date,
            description: `${request.start_date} から ${request.end_date} まで`,
          })
        })
      }

      // コスト最適化の計算（仮の値）
      const costSavings = 150000

      // ダッシュボードデータの更新
      setDashboardData({
        activeProjects,
        totalProjects: dealsData?.length || 0,
        activeStaff,
        totalStaff: staffData?.length || 0,
        resourcesInUse,
        totalResources,
        pendingLeaveRequests: leaveRequestsData?.length || 0,
        monthlyReports: reportsData?.length || 0,
        resourceUtilization,
        projectProgress,
        staffAllocation,
        recentActivities,
        costSavings,
      })

      toast({
        title: "データを更新しました",
        description: "ダッシュボードのデータが最新の情報に更新されました",
      })
    } catch (error) {
      console.error("ダッシュボードデータの取得に失敗しました:", error)
      toast({
        title: "エラー",
        description: "データの取得に失敗しました。再度お試しください。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 進捗率の計算
  const calculateProgress = (startDate: string, endDate: string | null) => {
    if (!startDate) return 0
    if (!endDate) return 50 // 終了日が設定されていない場合は50%とする

    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()
    const current = new Date().getTime()

    if (current <= start) return 0
    if (current >= end) return 100

    return Math.round(((current - start) / (end - start)) * 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">概要</h2>
        <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          更新
        </Button>
      </div>

      {/* KPI概要セクション */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="進行中の案件"
          value={dashboardData.activeProjects}
          total={dashboardData.totalProjects}
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          description="全案件に対する進行中の案件"
          trend={0}
        />
        <KpiCard
          title="稼働中のスタッフ"
          value={dashboardData.activeStaff}
          total={dashboardData.totalStaff}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="全スタッフに対する稼働中のスタッフ"
          trend={5}
        />
        <KpiCard
          title="使用中のリソース"
          value={dashboardData.resourcesInUse}
          total={dashboardData.totalResources}
          icon={<Construction className="h-4 w-4 text-muted-foreground" />}
          description="全リソースに対する使用中のリソース"
          trend={-2}
        />
        <KpiCard
          title="今月の日報"
          value={dashboardData.monthlyReports}
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          description="今月提出された日報の数"
          trend={10}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="resources">リソース</TabsTrigger>
          <TabsTrigger value="projects">案件</TabsTrigger>
          <TabsTrigger value="staff">スタッフ</TabsTrigger>
          <TabsTrigger value="calendar">カレンダー</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>リソース稼働状況</CardTitle>
                <CardDescription>重機、車両、工具の現在の稼働状況</CardDescription>
              </CardHeader>
              <CardContent>
                <ResourceUtilizationChart data={dashboardData.resourceUtilization} />
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>スタッフ稼働内訳</CardTitle>
                <CardDescription>スタッフの稼働状況の内訳</CardDescription>
              </CardHeader>
              <CardContent>
                <StaffAllocationChart data={dashboardData.staffAllocation} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>案件進捗状況</CardTitle>
                <CardDescription>進行中の案件の進捗状況</CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectProgressPanel projects={dashboardData.projectProgress} />
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>最近のアクティビティ</CardTitle>
                <CardDescription>最近の日報や申請</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivitiesPanel activities={dashboardData.recentActivities} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>コスト最適化</CardTitle>
              <CardDescription>リソース利用の最適化によるコスト削減の可能性</CardDescription>
            </CardHeader>
            <CardContent>
              <CostOptimizationPanel costSavings={dashboardData.costSavings} />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>承認待ち休暇申請</CardTitle>
                  <CardDescription>承認待ちの休暇申請の数</CardDescription>
                </div>
                {dashboardData.pendingLeaveRequests > 0 && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.pendingLeaveRequests}件</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.pendingLeaveRequests > 0
                    ? "承認待ちの休暇申請があります。確認してください。"
                    : "承認待ちの休暇申請はありません。"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>コスト削減効果</CardTitle>
                  <CardDescription>リソース最適化による削減効果</CardDescription>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <BarChart3 className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(dashboardData.costSavings)}</div>
                <p className="text-xs text-muted-foreground">リソースの最適な割り当てによる月間削減効果</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>リソース稼働状況</CardTitle>
              <CardDescription>重機、車両、工具の現在の稼働状況</CardDescription>
            </CardHeader>
            <CardContent>
              <ResourceUtilizationChart data={dashboardData.resourceUtilization} />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>重機稼働状況</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      {dashboardData.resourceUtilization[0]?.稼働中 || 0} /{" "}
                      {dashboardData.resourceUtilization[0]?.利用可能 || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">稼働中の重機 / 全重機</p>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center">
                    <Construction className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>車両稼働状況</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      {dashboardData.resourceUtilization[1]?.稼働中 || 0} /{" "}
                      {dashboardData.resourceUtilization[1]?.利用可能 || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">稼働中の車両 / 全車両</p>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center">
                    <Truck className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>工具稼働状況</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      {dashboardData.resourceUtilization[2]?.稼働中 || 0} /{" "}
                      {dashboardData.resourceUtilization[2]?.利用可能 || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">稼働中の工具 / 全工具</p>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center">
                    <Wrench className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>コスト最適化</CardTitle>
              <CardDescription>リソース利用の最適化によるコスト削減の可能性</CardDescription>
            </CardHeader>
            <CardContent>
              <CostOptimizationPanel costSavings={dashboardData.costSavings} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>案件進捗状況</CardTitle>
              <CardDescription>進行中の案件の進捗状況</CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectProgressPanel projects={dashboardData.projectProgress} />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>案件ステータス内訳</CardTitle>
                <CardDescription>案件のステータス別内訳</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "進行中", value: dashboardData.activeProjects },
                        { name: "完了", value: dashboardData.totalProjects - dashboardData.activeProjects },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill="#4f46e5" />
                      <Cell fill="#22c55e" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>期限が近い案件</CardTitle>
                <CardDescription>期限が近い案件のリスト</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.projectProgress
                  .filter((project) => project.endDate && new Date(project.endDate) > new Date())
                  .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
                  .slice(0, 3)
                  .map((project) => (
                    <div key={project.id} className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground">
                          期限: {new Date(project.endDate).toLocaleDateString("ja-JP")}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {Math.ceil(
                            (new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                          )}
                          日
                        </span>
                      </div>
                    </div>
                  ))}
                {dashboardData.projectProgress.filter(
                  (project) => project.endDate && new Date(project.endDate) > new Date(),
                ).length === 0 && (
                  <div className="text-center text-muted-foreground py-4">期限が近い案件はありません</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>スタッフ稼働内訳</CardTitle>
                <CardDescription>スタッフの稼働状況の内訳</CardDescription>
              </CardHeader>
              <CardContent>
                <StaffAllocationChart data={dashboardData.staffAllocation} />
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>承認待ち休暇申請</CardTitle>
                  <CardDescription>承認待ちの休暇申請の数</CardDescription>
                </div>
                {dashboardData.pendingLeaveRequests > 0 && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.pendingLeaveRequests}件</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.pendingLeaveRequests > 0
                    ? "承認待ちの休暇申請があります。確認してください。"
                    : "承認待ちの休暇申請はありません。"}
                </p>
                {dashboardData.pendingLeaveRequests > 0 && (
                  <Button variant="outline" className="mt-4 w-full" size="sm">
                    休暇申請を確認
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <CalendarPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
