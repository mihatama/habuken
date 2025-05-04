"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getClientSupabase } from "@/lib/supabase-utils"
import { Loader2, ArrowLeft, Calendar, Users, Truck, Car, Package, FileText, Shield, Plus } from "lucide-react"
import { DealEditModal } from "@/components/deal-edit-modal"

// Helper function to validate UUID
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

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
  const [showDetails, setShowDetails] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    async function fetchDealData() {
      try {
        // Validate UUID before making any database calls
        if (!isValidUUID(id)) {
          throw new Error(`無効なIDです: ${id}`)
        }

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
          .select("staff_id, start_date, end_date, staff:staff_id(id, full_name, position, phone, email)")
          .eq("deal_id", id)

        if (staffError) throw staffError
        setStaff(staffData || [])

        // 重機データを取得
        const { data: machineryData, error: machineryError } = await supabase
          .from("deal_machinery")
          .select("machinery_id, start_date, end_date, machinery:machinery_id(id, name, type, location)")
          .eq("deal_id", id)

        if (machineryError) throw machineryError
        setHeavyMachinery(machineryData || [])

        // 車両データを取得
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from("deal_vehicles")
          .select("vehicle_id, start_date, end_date, vehicle:vehicle_id(id, name, type, location)")
          .eq("deal_id", id)

        if (vehiclesError) throw vehiclesError
        setVehicles(vehiclesData || [])

        // 備品データを取得
        const { data: toolsData, error: toolsError } = await supabase
          .from("deal_tools")
          .select("tool_id, start_date, end_date, tool:tool_id(id, name, storage_location, condition)")
          .eq("deal_id", id)

        if (toolsError) throw toolsError
        setTools(toolsData || [])

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

  const formatDateRange = (startDate: string | null, endDate: string | null) => {
    if (!startDate) return "-"

    const start = new Date(startDate).toLocaleDateString("ja-JP")
    if (!endDate) return `${start} ~`

    const end = new Date(endDate).toLocaleDateString("ja-JP")
    return `${start} ~ ${end}`
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
        <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)} className="ml-2">
          編集
        </Button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">クライアント: {deal.client_name}</p>
            <p className="text-sm text-muted-foreground">
              期間: {deal.start_date ? new Date(deal.start_date).toLocaleDateString("ja-JP") : "-"} ~
              {deal.end_date ? new Date(deal.end_date).toLocaleDateString("ja-JP") : ""}
            </p>
            <p className="text-sm text-muted-foreground">場所: {deal.location || "-"}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4 text-blue-500" /> {staff.length}
            </span>
            <span className="flex items-center gap-1">
              <Truck className="h-4 w-4 text-yellow-500" /> {heavyMachinery.length}
            </span>
            <span className="flex items-center gap-1">
              <Car className="h-4 w-4 text-green-500" /> {vehicles.length}
            </span>
            <span className="flex items-center gap-1">
              <Package className="h-4 w-4 text-purple-500" /> {tools.length}
            </span>
          </div>
        </div>

        <div className="border rounded-lg">
          <button
            className="w-full flex items-center justify-center py-2 text-sm font-medium border-b"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "詳細を隠す" : "詳細を表示する"}
          </button>

          {showDetails && (
            <div className="p-4 space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" /> スタッフ
                </h3>
                <div className="space-y-2">
                  {staff.length > 0 ? (
                    staff.map((item) => (
                      <div key={item.staff_id} className="bg-gray-50 p-2 rounded-md">
                        <div className="flex flex-col">
                          <span className="font-medium">{item.staff.full_name}</span>
                          <span className="text-xs text-muted-foreground">
                            期間: {formatDateRange(item.start_date, item.end_date)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">スタッフは登録されていません。</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-yellow-500" /> 重機
                </h3>
                <div className="space-y-2">
                  {heavyMachinery.length > 0 ? (
                    heavyMachinery.map((item) => (
                      <div key={item.machinery_id} className="bg-gray-50 p-2 rounded-md">
                        <div className="flex flex-col">
                          <span className="font-medium">{item.machinery.name}</span>
                          <span className="text-xs text-muted-foreground">
                            期間: {formatDateRange(item.start_date, item.end_date)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">重機は登録されていません。</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Car className="h-4 w-4 text-green-500" /> 車両
                </h3>
                <div className="space-y-2">
                  {vehicles.length > 0 ? (
                    vehicles.map((item) => (
                      <div key={item.vehicle_id} className="bg-gray-50 p-2 rounded-md">
                        <div className="flex flex-col">
                          <span className="font-medium">{item.vehicle.name}</span>
                          <span className="text-xs text-muted-foreground">
                            期間: {formatDateRange(item.start_date, item.end_date)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">車両は登録されていません。</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple-500" /> 備品
                </h3>
                <div className="space-y-2">
                  {tools.length > 0 ? (
                    tools.map((item) => (
                      <div key={item.tool_id} className="bg-gray-50 p-2 rounded-md">
                        <div className="flex flex-col">
                          <span className="font-medium">{item.tool.name}</span>
                          <span className="text-xs text-muted-foreground">
                            期間: {formatDateRange(item.start_date, item.end_date)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">備品は登録されていません。</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
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
                  {staff.map((item) => (
                    <div key={item.staff_id} className="border p-4 rounded-md">
                      <h3 className="font-medium">{item.staff.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{item.staff.position || "役職なし"}</p>
                      <p className="text-sm text-muted-foreground">
                        期間: {formatDateRange(item.start_date, item.end_date)}
                      </p>
                      {item.staff.phone && <p className="text-sm">電話: {item.staff.phone}</p>}
                      {item.staff.email && <p className="text-sm">メール: {item.staff.email}</p>}
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
                  {heavyMachinery.map((item) => (
                    <div key={item.machinery_id} className="border p-4 rounded-md">
                      <h3 className="font-medium">{item.machinery.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.machinery.type || "種類なし"}</p>
                      <p className="text-sm text-muted-foreground">
                        期間: {formatDateRange(item.start_date, item.end_date)}
                      </p>
                      {item.machinery.location && <p className="text-sm">場所: {item.machinery.location}</p>}
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
                  {vehicles.map((item) => (
                    <div key={item.vehicle_id} className="border p-4 rounded-md">
                      <h3 className="font-medium">{item.vehicle.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.vehicle.type || "種類なし"}</p>
                      <p className="text-sm text-muted-foreground">
                        期間: {formatDateRange(item.start_date, item.end_date)}
                      </p>
                      {item.vehicle.location && <p className="text-sm">場所: {item.vehicle.location}</p>}
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
                  {tools.map((item) => (
                    <div key={item.tool_id} className="border p-4 rounded-md">
                      <h3 className="font-medium">{item.tool.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        期間: {formatDateRange(item.start_date, item.end_date)}
                      </p>
                      {item.tool.storage_location && <p className="text-sm">保管場所: {item.tool.storage_location}</p>}
                      {item.tool.condition && <p className="text-sm">状態: {item.tool.condition}</p>}
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
      <DealEditModal dealId={id} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
    </div>
  )
}
