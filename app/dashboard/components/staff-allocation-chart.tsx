"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getClientSupabase } from "@/lib/supabase-utils"

interface ChartData {
  name: string
  value: number
  color: string
}

interface StaffAllocationChartProps {
  data?: {
    byProject: ChartData[]
    byRole: ChartData[]
  }
}

export function StaffAllocationChart({ data: initialData }: StaffAllocationChartProps) {
  const [activeTab, setActiveTab] = useState("byProject")
  const [data, setData] = useState(initialData || { byProject: [], byRole: [] })
  const [isLoading, setIsLoading] = useState(!initialData)

  useEffect(() => {
    if (!initialData) {
      fetchStaffData()
    }
  }, [initialData])

  async function fetchStaffData() {
    setIsLoading(true)
    try {
      const supabase = getClientSupabase()

      // スタッフデータの取得（リレーションシップを使わない）
      const { data: staffData, error: staffError } = await supabase.from("staff").select("id, name, role, project_id")

      if (staffError) throw staffError

      // プロジェクトデータの取得
      const { data: projectsData, error: projectsError } = await supabase.from("projects").select("id, name")

      if (projectsError) throw projectsError

      // プロジェクトIDと名前のマッピングを作成
      const projectMap = new Map()
      projectsData.forEach((project) => {
        projectMap.set(project.id, project.name)
      })

      // プロジェクト別のスタッフ集計
      const projectCounts: Record<string, number> = {}
      const roleCounts: Record<string, number> = {}

      staffData.forEach((staff) => {
        // プロジェクト別集計
        const projectName = staff.project_id ? projectMap.get(staff.project_id) || "未割当" : "未割当"
        if (!projectCounts[projectName]) {
          projectCounts[projectName] = 0
        }
        projectCounts[projectName]++

        // 役割別集計
        const role = staff.role || "その他"
        if (!roleCounts[role]) {
          roleCounts[role] = 0
        }
        roleCounts[role]++
      })

      // グラフ用データ形式に変換
      const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#C9CBCF"]

      const byProject = Object.keys(projectCounts).map((name, index) => ({
        name,
        value: projectCounts[name],
        color: colors[index % colors.length],
      }))

      const byRole = Object.keys(roleCounts).map((name, index) => ({
        name,
        value: roleCounts[name],
        color: colors[index % colors.length],
      }))

      setData({ byProject, byRole })
    } catch (error) {
      console.error("スタッフデータの取得エラー:", error)
      // エラー時はダミーデータを使用
      setData({
        byProject: [
          { name: "東京プロジェクト", value: 8, color: "#FF6384" },
          { name: "大阪工事", value: 5, color: "#36A2EB" },
          { name: "名古屋現場", value: 3, color: "#FFCE56" },
          { name: "福岡工事", value: 2, color: "#4BC0C0" },
          { name: "未割当", value: 4, color: "#9966FF" },
        ],
        byRole: [
          { name: "現場監督", value: 3, color: "#FF6384" },
          { name: "作業員", value: 12, color: "#36A2EB" },
          { name: "事務", value: 2, color: "#FFCE56" },
          { name: "エンジニア", value: 5, color: "#4BC0C0" },
        ],
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-caption"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <Card className="col-span-full md:col-span-1">
      <CardHeader>
        <CardTitle>スタッフ配置</CardTitle>
        <CardDescription>プロジェクトと役割別のスタッフ配置状況</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Tabs defaultValue="byProject" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="byProject">現場別</TabsTrigger>
              <TabsTrigger value="byRole">役割別</TabsTrigger>
            </TabsList>
            <TabsContent value="byProject" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.byProject}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.byProject.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}人`]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="byRole" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.byRole}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.byRole.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}人`]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
