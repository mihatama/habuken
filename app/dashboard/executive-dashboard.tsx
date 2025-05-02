"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { getClientSupabase } from "@/lib/supabase-utils"
import {
  BarChart3,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Construction,
  DollarSign,
  FileText,
  Loader2,
  Package,
  PieChart,
  RefreshCw,
  Truck,
  Users,
} from "lucide-react"
import { ProjectCalendar } from "@/components/project-calendar"
import { StaffCalendar } from "@/components/staff-calendar"
import { HeavyMachineryCalendar } from "@/components/heavy-machinery-calendar"
import { VehicleCalendar } from "@/components/vehicle-calendar"
import { ToolCalendar } from "@/components/tool-calendar"

export default function Dashboard() {
  const { toast } = useToast()
  const supabase = getClientSupabase()

  const [activeTab, setActiveTab] = useState("overview")
  const [activeCalendarTab, setActiveCalendarTab] = useState("projects")
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    projects: {
      total: 0,
      inProgress: 0,
      completed: 0,
      planned: 0,
    },
    staff: {
      total: 0,
      active: 0,
      onLeave: 0,
    },
    resources: {
      heavyMachinery: 0,
      vehicles: 0,
      tools: 0,
    },
    reports: {
      daily: 0,
      safety: 0,
      pending: 0,
    },
    costs: {
      totalSavings: 0,
      machineryOptimization: {
        amount: 0,
        percentage: 0,
      },
      vehicleOptimization: {
        amount: 0,
        percentage: 0,
      },
    },
    leaveRequests: {
      pending: 0,
      approved: 0,
      rejected: 0,
    },
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      // 案件データの取得
      const { data: projectsData, error: projectsError } = await supabase.from("deals").select("id, status")

      if (projectsError) throw projectsError

      // スタッフデータの取得
      const { data: staffData, error: staffError } = await supabase.from("staff").select("id, status")

      if (staffError) throw staffError

      // 重機データの取得
      const { data: machineryData, error: machineryError } = await supabase.from("heavy_machinery").select("id")

      if (machineryError) throw machineryError

      // 車両データの取得
      const { data: vehiclesData, error: vehiclesError } = await supabase.from("vehicles").select("id")

      if (vehiclesError) throw vehiclesError

      // 工具データの取得
      const { data: toolsData, error: toolsError } = await supabase.from("tools").select("id")

      if (toolsError) throw toolsError

      // 日報データの取得
      const { data: reportsData, error: reportsError } = await supabase.from("daily_reports").select("id")

      if (reportsError) throw reportsError

      // 安全パトロールデータの取得
      const { data: safetyData, error: safetyError } = await supabase.from("safety_inspections").select("id")

      // 安全パトロールテーブルが存在しない場合はエラーを無視
      const safetyCount = safetyError ? 0 : safetyData?.length || 0

      // 休暇申請データの取得
      const { data: leaveRequestsData, error: leaveRequestsError } = await supabase
        .from("leave_requests")
        .select("id, status")

      // 休暇申請テーブルが存在しない場合はエラーを無視
      const leaveRequests = leaveRequestsError ? [] : leaveRequestsData || []

      // プロジェクトのステータスをカウント
      const projectsTotal = projectsData?.length || 0
      const projectsInProgress = projectsData?.filter((p) => p.status === "in_progress").length || 0
      const projectsCompleted = projectsData?.filter((p) => p.status === "completed").length || 0
      const projectsPlanned = projectsData?.filter((p) => p.status === "planned").length || 0

      // スタッフのステータスをカウント
      const staffTotal = staffData?.length || 0
      const staffActive = staffData?.filter((s) => s.status === "active").length || 0
      const staffOnLeave = staffData?.filter((s) => s.status === "on_leave").length || 0

      // 休暇申請のステータスをカウント
      const leaveRequestsPending = leaveRequests.filter((lr) => lr.status === "pending").length
      const leaveRequestsApproved = leaveRequests.filter((lr) => lr.status === "approved").length
      const leaveRequestsRejected = leaveRequests.filter((lr) => lr.status === "rejected").length

      // コスト最適化のデータ（サンプル）
      const totalSavings = 2045143
      const machineryOptimizationAmount = 1411275
      const machineryOptimizationPercentage = 47.2
      const vehicleOptimizationAmount = 633868
      const vehicleOptimizationPercentage = 44.7

      // ダッシュボードデータの更新
      setDashboardData({
        projects: {
          total: projectsTotal,
          inProgress: projectsInProgress,
          completed: projectsCompleted,
          planned: projectsPlanned,
        },
        staff: {
          total: staffTotal,
          active: staffActive,
          onLeave: staffOnLeave,
        },
        resources: {
          heavyMachinery: machineryData?.length || 0,
          vehicles: vehiclesData?.length || 0,
          tools: toolsData?.length || 0,
        },
        reports: {
          daily: reportsData?.length || 0,
          safety: safetyCount,
          pending: 0, // 保留中のレポート数（サンプル）
        },
        costs: {
          totalSavings,
          machineryOptimization: {
            amount: machineryOptimizationAmount,
            percentage: machineryOptimizationPercentage,
          },
          vehicleOptimization: {
            amount: vehicleOptimizationAmount,
            percentage: vehicleOptimizationPercentage,
          },
        },
        leaveRequests: {
          pending: leaveRequestsPending,
          approved: leaveRequestsApproved,
          rejected: leaveRequestsRejected,
        },
      })

      toast({
        title: "データ更新完了",
        description: "ダッシュボードのデータが更新されました",
      })
    } catch (error) {
      console.error("ダッシュボードデータの取得エラー:", error)
      toast({
        title: "エラー",
        description: "データの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 金額のフォーマット
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(amount)
  }

  // パーセンテージのフォーマット
  const formatPercentage = (percentage) => {
    return `${percentage.toFixed(1)}%`
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <Button onClick={fetchDashboardData} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          更新
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="overview" className="flex items-center">
            <PieChart className="mr-2 h-4 w-4" />
            <span>概要</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center">
            <Building2 className="mr-2 h-4 w-4" />
            <span>案件</span>
          </TabsTrigger>
          <TabsTrigger value="calendars" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            <span>カレンダー</span>
          </TabsTrigger>
        </TabsList>

        {/* 概要タブ */}
        <TabsContent value="overview" className="space-y-6">
          {/* 主要指標 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">総案件数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.projects.total}</div>
                <p className="text-xs text-muted-foreground">
                  進行中: {dashboardData.projects.inProgress} / 完了: {dashboardData.projects.completed}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">スタッフ数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.staff.total}</div>
                <p className="text-xs text-muted-foreground">
                  稼働中: {dashboardData.staff.active} / 休暇中: {dashboardData.staff.onLeave}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">リソース数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.resources.heavyMachinery +
                    dashboardData.resources.vehicles +
                    dashboardData.resources.tools}
                </div>
                <p className="text-xs text-muted-foreground">
                  重機: {dashboardData.resources.heavyMachinery} / 車両: {dashboardData.resources.vehicles} / 工具:{" "}
                  {dashboardData.resources.tools}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">レポート数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.reports.daily + dashboardData.reports.safety}</div>
                <p className="text-xs text-muted-foreground">
                  日報: {dashboardData.reports.daily} / 安全: {dashboardData.reports.safety}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* コスト最適化 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-1 md:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-green-500" />
                  総節約額
                </CardTitle>
                <CardDescription>最適なレンタル計画による節約</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(dashboardData.costs.totalSavings)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Construction className="mr-2 h-5 w-5 text-amber-500" />
                  重機コスト最適化
                </CardTitle>
                <CardDescription>最適化による節約</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(dashboardData.costs.machineryOptimization.amount)}
                  <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {formatPercentage(dashboardData.costs.machineryOptimization.percentage)}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="mr-2 h-5 w-5 text-blue-500" />
                  車両コスト最適化
                </CardTitle>
                <CardDescription>最適化による節約</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(dashboardData.costs.vehicleOptimization.amount)}
                  <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {formatPercentage(dashboardData.costs.vehicleOptimization.percentage)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 休暇申請状況 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                休暇申請状況
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center">
                  <div className="text-amber-500 text-2xl font-bold">{dashboardData.leaveRequests.pending}</div>
                  <div className="text-sm text-muted-foreground">承認待ち</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-green-500 text-2xl font-bold">{dashboardData.leaveRequests.approved}</div>
                  <div className="text-sm text-muted-foreground">承認済み</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-red-500 text-2xl font-bold">{dashboardData.leaveRequests.rejected}</div>
                  <div className="text-sm text-muted-foreground">却下</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="outline" size="sm" className="w-full">
                休暇申請管理へ
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* 案件タブ */}
        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5" />
                  総案件数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{dashboardData.projects.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-blue-600">
                  <Clock className="mr-2 h-5 w-5" />
                  進行中
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-600">{dashboardData.projects.inProgress}</div>
                <div className="text-sm text-muted-foreground">
                  全体の {((dashboardData.projects.inProgress / dashboardData.projects.total) * 100 || 0).toFixed(1)}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-amber-600">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  計画中
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-amber-600">{dashboardData.projects.planned}</div>
                <div className="text-sm text-muted-foreground">
                  全体の {((dashboardData.projects.planned / dashboardData.projects.total) * 100 || 0).toFixed(1)}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-600">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  完了
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600">{dashboardData.projects.completed}</div>
                <div className="text-sm text-muted-foreground">
                  全体の {((dashboardData.projects.completed / dashboardData.projects.total) * 100 || 0).toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 案件リスト（サンプル） */}
          <Card>
            <CardHeader>
              <CardTitle>最近の案件</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">案件データを読み込み中...</p>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="outline" size="sm" className="w-full">
                すべての案件を表示
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* リソースタブ */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Construction className="mr-2 h-5 w-5" />
                  重機
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{dashboardData.resources.heavyMachinery}</div>
                <div className="text-sm text-muted-foreground">登録済み重機</div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="outline" size="sm" className="w-full">
                  重機管理へ
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="mr-2 h-5 w-5" />
                  車両
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{dashboardData.resources.vehicles}</div>
                <div className="text-sm text-muted-foreground">登録済み車両</div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="outline" size="sm" className="w-full">
                  車両管理へ
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  工具・備品
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{dashboardData.resources.tools}</div>
                <div className="text-sm text-muted-foreground">登録済み工具・備品</div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="outline" size="sm" className="w-full">
                  工具・備品管理へ
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* スタッフ情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                スタッフ状況
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center">
                  <div className="text-2xl font-bold">{dashboardData.staff.total}</div>
                  <div className="text-sm text-muted-foreground">総スタッフ数</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-green-500 text-2xl font-bold">{dashboardData.staff.active}</div>
                  <div className="text-sm text-muted-foreground">稼働中</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-amber-500 text-2xl font-bold">{dashboardData.staff.onLeave}</div>
                  <div className="text-sm text-muted-foreground">休暇中</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="outline" size="sm" className="w-full">
                スタッフ管理へ
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* コスト分析タブ */}
        <TabsContent value="costs" className="space-y-6">
          {/* コスト最適化サマリー */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5 text-green-500" />
                コスト最適化サマリー
              </CardTitle>
              <CardDescription>最適なリソース計画による節約額</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">
                {formatCurrency(dashboardData.costs.totalSavings)}
              </div>
              <div className="text-sm text-muted-foreground mt-2">最適なレンタル計画による節約</div>
            </CardContent>
          </Card>

          {/* 詳細コスト分析 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Construction className="mr-2 h-5 w-5 text-amber-500" />
                  重機コスト最適化
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(dashboardData.costs.machineryOptimization.amount)}
                </div>
                <div className="flex items-center mt-2">
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                    {formatPercentage(dashboardData.costs.machineryOptimization.percentage)} 最適化
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-4">
                  最適なレンタル計画と稼働スケジュールによる節約額
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="mr-2 h-5 w-5 text-blue-500" />
                  車両コスト最適化
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(dashboardData.costs.vehicleOptimization.amount)}
                </div>
                <div className="flex items-center mt-2">
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                    {formatPercentage(dashboardData.costs.vehicleOptimization.percentage)} 最適化
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-4">効率的な車両運用とルート最適化による節約額</div>
              </CardContent>
            </Card>
          </div>

          {/* コスト分析レポート */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                コスト分析レポート
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">詳細なコスト分析レポートを表示します。</p>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="outline" size="sm" className="w-full">
                詳細レポートを表示
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* カレンダータブ */}
        <TabsContent value="calendars" className="space-y-6">
          {/* カレンダーのサブタブ */}
          <Tabs value={activeCalendarTab} onValueChange={setActiveCalendarTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-6">
              <TabsTrigger value="projects" className="flex items-center">
                <Building2 className="mr-2 h-4 w-4" />
                <span>案件</span>
              </TabsTrigger>
              <TabsTrigger value="staff" className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                <span>スタッフ休暇</span>
              </TabsTrigger>
              <TabsTrigger value="machinery" className="flex items-center">
                <Construction className="mr-2 h-4 w-4" />
                <span>重機</span>
              </TabsTrigger>
              <TabsTrigger value="vehicles" className="flex items-center">
                <Truck className="mr-2 h-4 w-4" />
                <span>車両</span>
              </TabsTrigger>
              <TabsTrigger value="tools" className="flex items-center">
                <Package className="mr-2 h-4 w-4" />
                <span>備品</span>
              </TabsTrigger>
            </TabsList>

            {/* 案件カレンダー */}
            <TabsContent value="projects" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <ProjectCalendar />
                </CardContent>
              </Card>
            </TabsContent>

            {/* スタッフ休暇カレンダー */}
            <TabsContent value="staff" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <StaffCalendar />
                </CardContent>
              </Card>
            </TabsContent>

            {/* 重機カレンダー */}
            <TabsContent value="machinery" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <HeavyMachineryCalendar />
                </CardContent>
              </Card>
            </TabsContent>

            {/* 車両カレンダー */}
            <TabsContent value="vehicles" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <VehicleCalendar />
                </CardContent>
              </Card>
            </TabsContent>

            {/* 備品カレンダー */}
            <TabsContent value="tools" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <ToolCalendar />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}
