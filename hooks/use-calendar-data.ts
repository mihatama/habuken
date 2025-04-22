"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function useCalendarData() {
  const [projects, setProjects] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Fetch projects
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("*")
          .order("name", { ascending: true })

        if (projectsError) throw new Error(`プロジェクト取得エラー: ${projectsError.message}`)
        setProjects(projectsData || [])

        // Fetch staff
        const { data: staffData, error: staffError } = await supabase
          .from("staff")
          .select("*")
          .order("full_name", { ascending: true })

        if (staffError) throw new Error(`スタッフ取得エラー: ${staffError.message}`)
        setStaff(staffData || [])

        // Fetch resources
        const { data: resourcesData, error: resourcesError } = await supabase
          .from("resources")
          .select("*")
          .order("name", { ascending: true })

        if (resourcesError) throw new Error(`リソース取得エラー: ${resourcesError.message}`)
        setResources(resourcesData || [])
      } catch (err) {
        console.error("データ取得エラー:", err)
        setError(err instanceof Error ? err : new Error("不明なエラーが発生しました"))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  return { projects, staff, resources, loading, error }
}
