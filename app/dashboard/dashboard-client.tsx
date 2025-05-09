"use client"

import { useState, useEffect } from "react"
import { KpiCard } from "./components/kpi-card"
import { ProjectProgressPanel } from "./components/project-progress-panel"
import { RecentActivitiesPanel } from "./components/recent-activities-panel"
import { CalendarPanel } from "./components/calendar-panel"
import { WeatherForecastPanel } from "./components/weather-forecast-panel"
import { StaffAllocationChart } from "./components/staff-allocation-chart"
import { getClientSupabase } from "@/lib/supabase-utils"
import { Users, Truck, Car, PenToolIcon as Tool, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function DashboardClient() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      setLoading(true)
      const supabase = getClientSupabase()

      // スタッフ数を取得
      const { data: staffCount, error: staffError } = await supabase.from("staff").select("count", { count: "exact" })

      // 重機数を取得
      const { data: machineryCount, error: machineryError } = await supabase
        .from("heavy_machinery")
        .select("count", { count: "exact" })

      // 車両数を取得
      const { data: vehiclesCount, error: vehiclesError } = await supabase
        .from("vehicles")
        .select("count", { count: "exact" })

      // 備品数を取得
      const { data: toolsCount, error: toolsError } = await supabase
        .from("resources")
        .select("count", { count: "exact" })
        .eq("type", "工具")

      // 案件数を取得 - deals テーブルから
      const { data: dealsCount, error: dealsError } = await supabase.from("deals").select("count", { count: "exact" })

      // 案件データを取得（最新の5件）- deals テーブルから
      const { data: dealsData, error: dealsDataError } = await supabase
        .from("deals")
        .select("id, name, start_date, end_date, status")
        .order("start_date", { ascending: false })
        .limit(5)

      if (dealsDataError) {
        console.error("案件データの取得エラー:", dealsDataError)
      }

      // 最近のアクティビティを取得
      const { data: reportsData, error: reportsError } = await supabase
        .from("daily_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

      // 休暇申請を取得
      const { data: leaveRequestsData, error: leaveRequestsError } = await supabase
        .from("leave_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

      // ダッシュボードデータを構築
      const data = {
        kpis: {
          staffCount: staffCount?.[0]?.count || 0,
          machineryCount: machineryCount?.[0]?.count || 0,
          vehiclesCount: vehiclesCount?.[0]?.count || 0,
          toolsCount: toolsCount?.[0]?.count || 0,
          dealsCount: dealsCount?.[0]?.count || 0,
        },
        deals: dealsData || [],
        activities: [
          ...(reportsData
            ? reportsData.map((report) => ({
                id: report.id,
                type: "report" as const,
                title: `日報: ${report.custom_project_name || "案件名なし"}`,
                date: report.created_at,
                description: report.work_description || "作業内容なし",
              }))
            : []),
          ...(leaveRequestsData
            ? leaveRequestsData.map((leave) => ({
                id: leave.id,
                type: "leave" as const,
                title: `休暇申請: ${leave.staff_name || "名前なし"}`,
                date: leave.created_at,
                description: `${leave.start_date} 〜 ${leave.end_date}: ${leave.reason || "理由なし"}`,
              }))
            : []),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      }

      setDashboardData(data)
    } catch (err: any) {
      console.error("ダッシュボードデータの取得エラー:", err)
      setError("データの取得中にエラーが発生しました。")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container p-space-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container p-space-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mb-4" />
            <h3 className="text-heading-md font-semibold mb-2">データ取得エラー</h3>
            <p className="text-body text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container p-space-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <KpiCard
          title="スタッフ"
          value={dashboardData.kpis.staffCount}
          icon={<Users />}
          description="登録済みスタッフ数"
          trend={5}
        />
        <KpiCard
          title="重機"
          value={dashboardData.kpis.machineryCount}
          icon={<Truck />}
          description="登録済み重機数"
          trend={2}
        />
        <KpiCard
          title="車両"
          value={dashboardData.kpis.vehiclesCount}
          icon={<Car />}
          description="登録済み車両数"
          trend={-1}
        />
        <KpiCard
          title="備品"
          value={dashboardData.kpis.toolsCount}
          icon={<Tool />}
          description="登録済み備品数"
          trend={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ProjectProgressPanel deals={dashboardData.deals} />
        <RecentActivitiesPanel activities={dashboardData.activities} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StaffAllocationChart />
        <WeatherForecastPanel />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <CalendarPanel />
      </div>
    </div>
  )
}
