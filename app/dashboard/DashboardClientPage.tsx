"use client"

import { CalendarView } from "@/components/calendar-view"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"
import { fetchClientData } from "@/lib/supabase-utils"

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

export function DashboardClientPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true)
      setError(null)

      try {
        console.log("ダッシュボードデータ取得開始")

        // プロジェクトデータの取得
        const projectsData = await fetchClientData<Project>("projects", {
          order: { column: "created_at", ascending: false },
          limit: 5,
        })

        // スタッフデータの取得
        const staffData = await fetchClientData<Staff>("staff", {
          limit: 5,
        })

        // ツールデータの取得
        const toolsData = await fetchClientData<Tool>("resources", {
          filters: { type: "工具" },
          limit: 5,
        })

        console.log("データ取得完了:", {
          projects: projectsData?.length,
          staff: staffData?.length,
          tools: toolsData?.length,
        })

        setProjects(projectsData || [])
        setStaff(staffData || [])
        setTools(toolsData || [])
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
                {projects.length > 0 ? (
                  <ul className="space-y-2">
                    {projects.map((project) => (
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
                {staff.length > 0 ? (
                  <ul className="space-y-2">
                    {staff.map((person) => (
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
                <h2 className="text-xl font-bold mb-3">工具</h2>
                {tools.length > 0 ? (
                  <ul className="space-y-2">
                    {tools.map((tool) => (
                      <li key={tool.id} className="p-2 hover:bg-muted rounded">
                        {tool.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">工具がありません</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
