"use client"

import { CalendarView } from "@/components/calendar-view"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"

export function DashboardClientPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [tools, setTools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClientComponentClient()

      // プロジェクトデータの取得
      const { data: projectsData } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

      // スタッフデータの取得
      const { data: staffData } = await supabase.from("staff").select("*").limit(5)

      // ツールデータの取得
      const { data: toolsData } = await supabase.from("resources").select("*").eq("category", "工具").limit(5)

      setProjects(projectsData || [])
      setStaff(staffData || [])
      setTools(toolsData || [])
      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-4">
      <CalendarView />
    </div>
  )
}
