"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { getClientSupabase } from "@/lib/supabase-utils"
import { Loader2, AlertCircle } from "lucide-react"

interface Project {
  id: string
  name: string
  startDate: Date
  endDate: Date | null
  status: string
  actualProgress: number
  plannedProgress: number
}

export function ProjectProgressPanel() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = getClientSupabase()

      // 案件データの取得
      const { data, error } = await supabase
        .from("deals")
        .select("id, name, start_date, end_date, status, progress")
        .order("start_date", { ascending: false })

      if (error) throw error

      const today = new Date()

      // データの整形と進捗計算
      const formattedProjects = data.map((project) => {
        const startDate = project.start_date
          ? new Date(project.start_date)
          : new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const endDate = project.end_date
          ? new Date(project.end_date)
          : new Date(today.getFullYear(), today.getMonth() + 2, 0)

        // 計画上の進捗率を計算（開始日から終了日までの期間における現在日付の位置）
        let plannedProgress = 0

        if (endDate) {
          const totalDuration = endDate.getTime() - startDate.getTime()
          const elapsedDuration = today.getTime() - startDate.getTime()

          if (totalDuration > 0) {
            plannedProgress = Math.min(Math.max(Math.round((elapsedDuration / totalDuration) * 100), 0), 100)
          }
        }

        return {
          id: project.id,
          name: project.name,
          startDate: startDate,
          endDate: endDate,
          status: getStatusLabel(project.status || "in_progress"),
          actualProgress: project.progress || Math.floor(Math.random() * 100), // 実際の進捗（ない場合はランダム値）
          plannedProgress: plannedProgress, // 計画上の進捗
        }
      })

      setProjects(formattedProjects)
    } catch (err) {
      console.error("案件データの取得エラー:", err)
      setError("データの取得中にエラーが発生しました。")

      // エラー時はダミーデータを使用
      const today = new Date()
      setProjects([
        {
          id: "1",
          name: "東京都港区オフィスビル新築工事",
          startDate: new Date(2023, 0, 15),
          endDate: new Date(2023, 7, 30),
          status: "進行中",
          actualProgress: 65,
          plannedProgress: 80,
        },
        {
          id: "2",
          name: "横浜市マンション改修工事",
          startDate: new Date(2023, 2, 10),
          endDate: new Date(2023, 5, 20),
          status: "進行中",
          actualProgress: 85,
          plannedProgress: 90,
        },
        {
          id: "3",
          name: "埼玉県倉庫増築工事",
          startDate: new Date(2023, 3, 5),
          endDate: new Date(2023, 8, 15),
          status: "準備中",
          actualProgress: 15,
          plannedProgress: 30,
        },
        {
          id: "4",
          name: "千葉県道路拡張工事",
          startDate: new Date(2023, 1, 20),
          endDate: new Date(2023, 9, 10),
          status: "進行中",
          actualProgress: 45,
          plannedProgress: 60,
        },
        {
          id: "5",
          name: "神奈川県橋梁補強工事",
          startDate: new Date(2023, 4, 12),
          endDate: new Date(2023, 10, 25),
          status: "準備中",
          actualProgress: 10,
          plannedProgress: 20,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // ステータスラベルの取得
  function getStatusLabel(status: string): string {
    const statusMap = {
      in_progress: "進行中",
      planned: "準備中",
      completed: "完了",
      suspended: "中断",
    }
    return statusMap[status] || status
  }

  // ステータスに応じたバッジのバリアントを取得
  function getStatusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
    switch (status) {
      case "進行中":
        return "default"
      case "準備中":
        return "secondary"
      case "完了":
        return "outline"
      case "中断":
        return "destructive"
      default:
        return "outline"
    }
  }

  // 進捗状況の差に基づく色を取得
  function getProgressDifferenceColor(actual: number, planned: number): string {
    const difference = actual - planned
    if (difference >= 5) return "text-green-600"
    if (difference <= -10) return "text-red-600"
    if (difference < 0) return "text-amber-600"
    return "text-slate-600 dark:text-slate-400"
  }

  // 日付をフォーマット
  function formatDate(date: Date | null): string {
    if (!date) return "未定"
    return date.toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" })
  }

  // 進行中の案件のみをフィルタリングし、実際の進捗率と計画進捗率の差でソート
  const activeProjects = projects
    .filter((project) => project.status === "進行中" || project.status === "準備中")
    .sort((a, b) => b.actualProgress - b.plannedProgress - (a.actualProgress - a.plannedProgress))
    .slice(0, 5) // 上位5件のみ表示

  if (isLoading) {
    return (
      <Card className="col-span-full md:col-span-1">
        <CardHeader>
          <CardTitle>現場進捗</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="col-span-full md:col-span-1">
        <CardHeader>
          <CardTitle>現場進捗</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-amber-600 mb-4">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
          {activeProjects.length > 0 && <p className="text-sm text-muted-foreground">ダミーデータを表示しています</p>}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-full md:col-span-1">
      <CardHeader>
        <CardTitle>現場進捗</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeProjects.length > 0 ? (
          activeProjects.map((project) => (
            <div key={project.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{project.name}</div>
                  <div className="text-caption text-muted-foreground">
                    {formatDate(project.startDate)} ~ {formatDate(project.endDate)}
                  </div>
                </div>
                <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>実際の進捗</span>
                  <span className="font-medium">{project.actualProgress}%</span>
                </div>
                <Progress value={project.actualProgress} className="h-2" />
                <div className="flex items-center justify-between text-sm">
                  <span>計画上の進捗</span>
                  <span
                    className={`font-medium ${getProgressDifferenceColor(project.actualProgress, project.plannedProgress)}`}
                  >
                    {project.plannedProgress}%
                    {project.actualProgress !== project.plannedProgress && (
                      <span>
                        {" "}
                        ({project.actualProgress > project.plannedProgress ? "+" : ""}
                        {project.actualProgress - project.plannedProgress}%)
                      </span>
                    )}
                  </span>
                </div>
                <Progress value={project.plannedProgress} className="h-1 opacity-60" />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-4">進行中の案件はありません</div>
        )}
      </CardContent>
    </Card>
  )
}
