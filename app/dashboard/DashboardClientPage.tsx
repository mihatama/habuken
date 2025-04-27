"use client"

import { CalendarView } from "@/components/calendar-view"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { fetchData } from "@/lib/supabase-client"

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

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true)

      try {
        // プロジェクトデータの取得
        const { data: projectsData } = await fetchData<Project>("projects", {
          order: { column: "created_at", ascending: false },
          limit: 5,
        })

        // スタッフデータの取得
        const { data: staffData } = await fetchData<Staff>("staff", {
          limit: 5,
        })

        // ツールデータの取得
        const { data: toolsData } = await fetchData<Tool>("resources", {
          filters: { type: "工具" },
          limit: 5,
        })

        setProjects(projectsData || [])
        setStaff(staffData || [])
        setTools(toolsData || [])
      } catch (error) {
        console.error("ダッシュボードデータ取得エラー:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-4">
      {loading ? (
        <Card>
          <CardContent className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      ) : (
        <CalendarView />
      )}
    </div>
  )
}
