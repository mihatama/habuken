"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getClientSupabase } from "@/lib/supabase-utils"
import { Loader2, ArrowLeft, Calendar, Users, Truck, Car, Package, FileText, Shield, Plus } from "lucide-react"

export function DealDetails({ id }: { id: string }) {
  const router = useRouter()
  const [deal, setDeal] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [staff, setStaff] = useState<any[]>([])
  const [heavyMachinery, setHeavyMachinery] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [tools, setTools] = useState<any[]>([])
  const [periods, setPeriods] = useState<any[]>([])
  const [dailyReports, setDailyReports] = useState<any[]>([])
  const [safetyReports, setSafetyReports] = useState<any[]>([])

  useEffect(() => {
    async function fetchDealData() {
      try {
        setLoading(true)
        const supabase = getClientSupabase()

        // 案件データを取得
        const { data: dealData, error: dealError } = await supabase.from("deals").select("*").eq("id", id).single()

        if (dealError) throw dealError
        setDeal(dealData)

        // 期間データを取得
        const { data: periodsData, error: periodsError } = await supabase
          .from("deal_periods")
          .select("*")
          .eq("deal_id", id)
          .order("start_date", { ascending: true })

        if (periodsError) throw periodsError
        setPeriods(periodsData || [])

        // スタッフデータを取得
        const { data: staffData, error: staffError } = await supabase
          .from("deal_staff")
          .select("staff_id, staff:staff_id(id, full_name, position, phone, email)")
          .eq("deal_id", id)

        if (staffError) throw staffError
        setStaff(staffData?.map((item) => item.staff) || [])

        // 重機データを取得
        const { data: machineryData, error: machineryError } = await supabase
          .from("deal_machinery")
          .select("machinery_id, machinery:machinery_id(id, name, type, location)")
          .eq("deal_id", id)

        if (machineryError) throw machineryError
        setHeavyMachinery(machineryData?.map((item) => item.machinery) || [])

        // 車両データを取得
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from("deal_vehicles")
          .select("vehicle_id, vehicle:vehicle_id(id, name, type, location)")
          .eq("deal_id", id)

        if (vehiclesError) throw vehiclesError
        setVehicles(vehiclesData?.map((item) => item.vehicle) || [])

        // 備品データを取得
        const { data: toolsData, error: toolsError } = await supabase
          .from("deal_tools")
          .select("tool_id, tool:tool_id(id, name, storage_location, condition)")
          .eq("deal_id", id)

        if (toolsError) throw toolsError
        setTools(toolsData?.map((item) => item.tool) || [])

        // 日報データを取得
        const { data: reportsData, error: reportsError } = await supabase
          .from("daily_reports")
          .select("*, staff:submitted_by(full_name)")
          .eq("deal_id", id)
          .order("report_date", { ascending: false })

        if (reportsError) throw reportsError
        setDailyReports(reportsData || [])

        // 安全パトロールデータを取得
        const { data: safetyData, error: safetyError } = await supabase
          .from("safety_inspections")
          .select("*, inspector:inspector(full_name)")
          .eq("deal_id", id)
          .order("inspection_date", { ascending: false })

        if (safetyError) throw safetyError
        setSafetyReports(safetyData || [])
      } catch (error) {
        console.error("案件データ取得エラー:", error)
        setError("案件データの取得中にエラーが発生しました。")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchDealData()
    }
  }, [id])

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-purple-100 text-purple-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "検討中"
      case "approved":
        return "承認済み"
      case "in_progress":
        return "進行中"
      case "completed":
        return "完了"
      case "cancelled":
        return "キャンセル"
      default:
        return status
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !deal) {
    return (
      <Card className="p-6">
        <CardHeader>
          <CardTitle>エラー</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error || "案件が見つかりませんでした。"}</p>
          <Button onClick={() => router.back()} className="mt-4">
            戻る
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{deal.name}</h1>
        <Badge className={`ml-auto ${getStatusBadgeClass(deal.status)}`}>{getStatusText(deal.status)}</Badge>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="resources">リソース</TabsTrigger>
          <TabsTrigger value="daily-reports">日報</TabsTrigger>
          <TabsTrigger value="safety-reports">安全パトロール</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">クライアント</h3>
                  <p className="font-medium">{deal.client_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">担当者</h3>
                  <p className="font-medium">{deal.contact_person || "-"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">連絡先メール</h3>
                  <p className="font-medium">{deal.contact_email || "-"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">連絡先電話番号</h3>
                  <p className="font-medium">{deal.contact_phone || "-"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">見積金額</h3>
                  <p className="font-medium">{formatCurrency(deal.estimated_value || 0)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">場所</h3>
                  <p className="font-medium">{deal.location || "-"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">開始日</h3>
                  <p className="font-medium">
                    {deal.start_date ? new Date(deal.start_date).toLocaleDateString("ja-JP") : "-"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">終了日</h3>
                  <p className="font-medium">
                    {deal.end_date ? new Date(deal.end_date).toLocaleDateString("ja-JP") : "-"}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">案件詳細</h3>
                <p className="whitespace-pre-wrap">{deal.description || "詳細情報はありません。"}</p>
              </div>
            </CardContent>
          </Card>

          {periods.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  期間
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {periods.map((period, index) => (
                    <div key={period.id} className="border p-4 rounded-md">
                      <h3 className="font-medium mb-2">期間 {index + 1}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div>
                          <span className="text-sm text-muted-foreground">開始日:</span>{" "}
                          {new Date(period.start_date).toLocaleDateString("ja-JP")}
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">終了日:</span>{" "}
                          {period.end_date ? new Date(period.end_date).toLocaleDateString("ja-JP") : "-"}
                        </div>
                      </div>
                      {period.description && <p className="text-sm">{period.description}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                担当スタッフ
              </CardTitle>
            </CardHeader>
            <CardContent>
              {staff.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {staff.map((person) => (
                    <div key={person.id} className="border p-4 rounded-md">
                      <h3 className="font-medium">{person.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{person.position || "役職なし"}</p>
                      {person.phone && <p className="text-sm">電話: {person.phone}</p>}
                      {person.email && <p className="text-sm">メール: {person.email}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">担当スタッフは登録されていません。</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center">
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                重機
              </CardTitle>
            </CardHeader>
            <CardContent>
              {heavyMachinery.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {heavyMachinery.map((machine) => (
                    <div key={machine.id} className="border p-4 rounded-md">
                      <h3 className="font-medium">{machine.name}</h3>
                      <p className="text-sm text-muted-foreground">{machine.type || "種類なし"}</p>
                      {machine.location && <p className="text-sm">場所: {machine.location}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">重機は登録されていません。</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center">
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                車両
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vehicles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="border p-4 rounded-md">
                      <h3 className="font-medium">{vehicle.name}</h3>
                      <p className="text-sm text-muted-foreground">{vehicle.type || "種類なし"}</p>
                      {vehicle.location && <p className="text-sm">場所: {vehicle.location}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">車両は登録されていません。</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                備品
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tools.map((tool) => (
                    <div key={tool.id} className="border p-4 rounded-md">
                      <h3 className="font-medium">{tool.name}</h3>
                      {tool.storage_location && <p className="text-sm">保管場所: {tool.storage_location}</p>}
                      {tool.condition && <p className="text-sm">状態: {tool.condition}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">備品は登録されていません。</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily-reports">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                日報
              </CardTitle>
              <Button onClick={() => router.push(`/deals/${id}/daily-report`)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                日報を追加
              </Button>
            </CardHeader>
            <CardContent>
              {dailyReports.length > 0 ? (
                <div className="space-y-4">
                  {dailyReports.map((report) => (
                    <div key={report.id} className="border p-4 rounded-md">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">
                            {new Date(report.report_date).toLocaleDateString("ja-JP")}の日報
                          </h3>
                          <p className="text-sm text-muted-foreground">報告者: {report.staff?.full_name || "不明"}</p>
                        </div>
                        <Badge>{report.status}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div>
                          <span className="text-sm text-muted-foreground">天候:</span> {report.weather || "-"}
                          {report.temperature && <span> ({report.temperature}℃)</span>}
                        </div>
                      </div>
                      <div className="mt-2">
                        <h4 className="text-sm font-medium">作業内容:</h4>
                        <p className="text-sm whitespace-pre-wrap">{report.work_description}</p>
                      </div>
                      {report.issues && (
                        <div className="mt-2">
                          <h4 className="text-sm font-medium">問題点:</h4>
                          <p className="text-sm whitespace-pre-wrap">{report.issues}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">日報は登録されていません。</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="safety-reports">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                安全パトロール
              </CardTitle>
              <Button onClick={() => router.push(`/deals/${id}/safety-inspection`)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                安全パトロールを追加
              </Button>
            </CardHeader>
            <CardContent>
              {safetyReports.length > 0 ? (
                <div className="space-y-4">
                  {safetyReports.map((report) => (
                    <div key={report.id} className="border p-4 rounded-md">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">
                            {new Date(report.inspection_date).toLocaleDateString("ja-JP")}の安全パトロール
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            点検者: {report.inspector?.full_name || "不明"}
                          </p>
                        </div>
                        <Badge>{report.status}</Badge>
                      </div>
                      <div className="mt-2">
                        <h4 className="text-sm font-medium">場所:</h4>
                        <p className="text-sm">{report.location}</p>
                      </div>
                      <div className="mt-2">
                        <h4 className="text-sm font-medium">発見事項:</h4>
                        <p className="text-sm whitespace-pre-wrap">{report.findings}</p>
                      </div>
                      {report.action_items && (
                        <div className="mt-2">
                          <h4 className="text-sm font-medium">対応事項:</h4>
                          <p className="text-sm whitespace-pre-wrap">{report.action_items}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">安全パトロール記録は登録されていません。</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
