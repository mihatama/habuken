"use client"

import { CalendarView } from "@/components/calendar-view"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"
import { callClientRpc } from "@/lib/supabase-rpc"

// 型定義
interface Project {
  id: string
  name: string
  created_at: string
  [key: string]: any
}

interface Staff {
  id: string
  full_name: string
  [key: string]: any
}

interface Tool {
  id: string
  name: string
  type: string
  [key: string]: any
}

interface DashboardSummary {
  projects: {
    total: number
    active: number
    completed: number
    recent: Project[]
  }
  staff: {
    total: number
    available: number
    recent: Staff[]
  }
  resources: {
    heavy_machinery: number
    vehicles: number
    tools: number
  }
  daily_reports: number
}

export function DashboardClientPage() {
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true)
      setError(null)

      try {
        console.log("ダッシュボードデータ取得開始 (RPC使用)")
        const startTime = performance.now()

        // RPCを使用してダッシュボードサマリーを取得
        const summaryData = await callClientRpc<DashboardSummary>("get_dashboard_summary")

        const endTime = performance.now()
        console.log(`ダッシュボードデータ取得完了: ${Math.round(endTime - startTime)}ms`)

        setDashboardData(summaryData)
      } catch (error) {
        console.error("ダッシュボードデータ取得エラー:", error)
        setError("データの読み込み中にエラーが発生しました。再度お試しください。")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-primary text-white rounded-md">
            再読み込み
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <Card>
          <CardContent className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      ) : (
        <>
          <CalendarView />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <h2 className="text-xl font-bold mb-3">最近のプロジェクト</h2>
                {dashboardData?.projects.recent && dashboardData.projects.recent.length > 0 ? (
                  <ul className="space-y-2">
                    {dashboardData.projects.recent.map((project) => (
                      <li key={project.id} className="p-2 hover:bg-muted rounded">
                        {project.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">プロジェクトがありません</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h2 className="text-xl font-bold mb-3">スタッフ</h2>
                {dashboardData?.staff.recent && dashboardData.staff.recent.length > 0 ? (
                  <ul className="space-y-2">
                    {dashboardData.staff.recent.map((person) => (
                      <li key={person.id} className="p-2 hover:bg-muted rounded">
                        {person.full_name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">スタッフがいません</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h2 className="text-xl font-bold mb-3">リソース概要</h2>
                {dashboardData?.resources ? (
                  <ul className="space-y-2">
                    <li className="p-2 hover:bg-muted rounded">重機: {dashboardData.resources.heavy_machinery}台</li>
                    <li className="p-2 hover:bg-muted rounded">車両: {dashboardData.resources.vehicles}台</li>
                    <li className="p-2 hover:bg-muted rounded">工具: {dashboardData.resources.tools}点</li>
                    <li className="p-2 hover:bg-muted rounded">過去30日の日報: {dashboardData.daily_reports}件</li>
                  </ul>
                ) : (
                  <p className="text-muted-foreground">データがありません</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
