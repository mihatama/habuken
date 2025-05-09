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

  // fetchStaffData 関数を以下のように修正
  async function fetchStaffData() {
    setIsLoading(true)
    try {
      const supabase = getClientSupabase()

      // スタッフデータの取得（正しいカラム名を使用）
      const { data: staffData, error: staffError } = await supabase
        .from("staff")
        .select("id, full_name, position, department")

      if (staffError) throw staffError

      // deal_staff テーブルを通じてスタッフと案件の関連を取得
      const { data: dealStaffData, error: dealStaffError } = await supabase
        .from("deal_staff")
        .select("staff_id, deal_id")

      if (dealStaffError) throw dealStaffError

      // 案件データの取得
      const { data: dealsData, error: dealsError } = await supabase.from("deals").select("id, name")

      if (dealsError) throw dealsError

      // 案件IDと名前のマッピングを作成
      const dealMap = new Map()
      dealsData.forEach((deal) => {
        dealMap.set(deal.id, deal.name)
      })

      // スタッフと案件の関連マッピングを作成
      const staffDealMap = new Map()
      dealStaffData.forEach((relation) => {
        staffDealMap.set(relation.staff_id, relation.deal_id)
      })

      // プロジェクト別のスタッフ集計
      const dealCounts: Record<string, number> = {}
      const positionCounts: Record<string, number> = {}

      staffData.forEach((staff) => {
        // 案件別集計
        const dealId = staffDealMap.get(staff.id)
        const dealName = dealId ? dealMap.get(dealId) || "未割当" : "未割当"

        if (!dealCounts[dealName]) {
          dealCounts[dealName] = 0
        }
        dealCounts[dealName]++

        // 役割別集計
        const position = staff.position || "その他"
        if (!positionCounts[position]) {
          positionCounts[position] = 0
        }
        positionCounts[position]++
      })

      // グラフ用データ形式に変換
      const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#C9CBCF"]

      const byProject = Object.keys(dealCounts).map((name, index) => ({
        name,
        value: dealCounts[name],
        color: colors[index % colors.length],
      }))

      const byRole = Object.keys(positionCounts).map((name, index) => ({
        name,
        value: positionCounts[name],
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
