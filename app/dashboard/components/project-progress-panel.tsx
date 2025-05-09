"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"
import { useState, useEffect } from "react"

interface Project {
  id: string
  name: string
  startDate: string
  endDate: string | null
  status: string
  progress: number
}

const DynamicProjectProgress = dynamic(
  () =>
    Promise.resolve(({ projects }: { projects: Project[] }) => {
      // 進行中の案件のみをフィルタリングし、進捗率でソート
      const activeProjects = projects
        .filter((project) => project.status === "進行中" || project.status === "準備中")
        .sort((a, b) => b.progress - a.progress)
        .slice(0, 5) // 上位5件のみ表示

      return (
        <Card className="col-span-full md:col-span-1">
          <CardHeader>
            <CardTitle>プロジェクト進捗</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeProjects.length > 0 ? (
              activeProjects.map((project) => (
                <div key={project.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-caption text-muted-foreground">
                        {project.startDate} ~ {project.endDate || "未定"}
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={project.progress} className="h-2" />
                    <span className="text-caption font-medium">{project.progress}%</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">進行中の案件はありません</div>
            )}
          </CardContent>
        </Card>
      )
    }),
  { ssr: false },
)

export function ProjectProgressPanel() {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    // ダミーデータの生成 (APIから取得する想定)
    const dummyProjects: Project[] = [
      { id: "1", name: "プロジェクトA", startDate: "2023-01-01", endDate: "2023-03-31", status: "完了", progress: 100 },
      { id: "2", name: "プロジェクトB", startDate: "2023-02-15", endDate: null, status: "進行中", progress: 75 },
      { id: "3", name: "プロジェクトC", startDate: "2023-03-01", endDate: null, status: "準備中", progress: 25 },
      { id: "4", name: "プロジェクトD", startDate: "2023-04-01", endDate: null, status: "中断", progress: 0 },
      { id: "5", name: "プロジェクトE", startDate: "2023-05-01", endDate: null, status: "進行中", progress: 50 },
      { id: "6", name: "プロジェクトF", startDate: "2023-06-01", endDate: null, status: "進行中", progress: 90 },
      { id: "7", name: "プロジェクトG", startDate: "2023-07-01", endDate: null, status: "準備中", progress: 10 },
    ]
    setProjects(dummyProjects)
  }, [])

  return <DynamicProjectProgress projects={projects} />
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
