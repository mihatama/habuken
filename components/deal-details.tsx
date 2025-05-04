"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getClientSupabase } from "@/lib/supabase-utils"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, ChevronDown, ChevronUp, User, Truck, Wrench, PenToolIcon as Tool } from "lucide-react"
import Link from "next/link"
import type { Deal } from "@/types/supabase"

interface DealDetailsProps {
  dealId: string
}

export function DealDetails({ dealId }: DealDetailsProps) {
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [staffData, setStaffData] = useState<any[]>([])
  const [machineryData, setMachineryData] = useState<any[]>([])
  const [vehicleData, setVehicleData] = useState<any[]>([])
  const [toolData, setToolData] = useState<any[]>([])

  useEffect(() => {
    fetchDealData()
  }, [dealId])

  async function fetchDealData() {
    try {
      setLoading(true)
      const supabase = getClientSupabase()

      // 案件データの取得
      const { data: dealData, error: dealError } = await supabase.from("deals").select("*").eq("id", dealId).single()

      if (dealError) throw dealError

      setDeal(dealData)

      // スタッフデータの取得
      const { data: staffAssignments, error: staffError } = await supabase
        .from("deal_staff")
        .select("*, staff:staff_id(*)")
        .eq("deal_id", dealId)

      if (staffError) throw staffError

      setStaffData(staffAssignments || [])

      // 重機データの取得
      const { data: machineryAssignments, error: machineryError } = await supabase
        .from("deal_machinery")
        .select("*, machinery:machinery_id(*)")
        .eq("deal_id", dealId)

      if (machineryError) throw machineryError

      setMachineryData(machineryAssignments || [])

      // 車両データの取得
      const { data: vehicleAssignments, error: vehicleError } = await supabase
        .from("deal_vehicles")
        .select("*, vehicle:vehicle_id(*)")
        .eq("deal_id", dealId)

      if (vehicleError) throw vehicleError

      setVehicleData(vehicleAssignments || [])

      // 工具データの取得
      const { data: toolAssignments, error: toolError } = await supabase
        .from("deal_tools")
        .select("*, tool:tool_id(*)")
        .eq("deal_id", dealId)

      if (toolError) throw toolError

      setToolData(toolAssignments || [])
    } catch (err: any) {
      console.error("案件データの取得エラー:", err)
      setError("案件データの取得中にエラーが発生しました。")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "計画中":
        return "outline"
      case "準備中":
        return "secondary"
      case "進行中":
        return "default"
      case "完了":
        return "success"
      case "中断":
        return "warning"
      case "キャンセル":
        return "destructive"
      default:
        return "outline"
    }
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
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-500">{error || "案件データが見つかりません。"}</p>
            <Button asChild className="mt-4">
              <Link href="/deals">案件一覧に戻る</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">{deal.name}</h2>
            <Badge variant={getStatusBadgeVariant(deal.status) as any}>{deal.status}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">クライアント:</span> {deal.client_name || "未設定"}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">期間:</span>{" "}
                {format(new Date(deal.start_date), "yyyy年MM月dd日", { locale: ja })}
                {deal.end_date && ` 〜 ${format(new Date(deal.end_date), "yyyy年MM月dd日", { locale: ja })}`}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">場所:</span> {deal.location || "未設定"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">作成日:</span>{" "}
                {format(new Date(deal.created_at), "yyyy年MM月dd日", { locale: ja })}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">最終更新:</span>{" "}
                {deal.updated_at ? format(new Date(deal.updated_at), "yyyy年MM月dd日", { locale: ja }) : "更新なし"}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-center"
          >
            {showDetails ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                詳細を閉じる
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                編集
              </>
            )}
          </Button>

          {showDetails && (
            <div className="mt-4">
              <Tabs defaultValue="staff">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="staff" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    スタッフ
                  </TabsTrigger>
                  <TabsTrigger value="machinery" className="flex items-center">
                    <Truck className="h-4 w-4 mr-2" />
                    重機
                  </TabsTrigger>
                  <TabsTrigger value="vehicles" className="flex items-center">
                    <Wrench className="h-4 w-4 mr-2" />
                    車両
                  </TabsTrigger>
                  <TabsTrigger value="tools" className="flex items-center">
                    <Tool className="h-4 w-4 mr-2" />
                    工具
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="staff">
                  {staffData.length > 0 ? (
                    <div className="space-y-2">
                      {staffData.map((assignment) => (
                        <div key={assignment.id} className="p-2 border rounded-md">
                          <p className="font-medium">{assignment.staff?.name || "不明なスタッフ"}</p>
                          <p className="text-sm text-muted-foreground">
                            {assignment.start_date &&
                              format(new Date(assignment.start_date), "yyyy年MM月dd日", { locale: ja })}
                            {assignment.end_date &&
                              ` 〜 ${format(new Date(assignment.end_date), "yyyy年MM月dd日", {
                                locale: ja,
                              })}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">スタッフの割り当てはありません</p>
                  )}
                </TabsContent>

                <TabsContent value="machinery">
                  {machineryData.length > 0 ? (
                    <div className="space-y-2">
                      {machineryData.map((assignment) => (
                        <div key={assignment.id} className="p-2 border rounded-md">
                          <p className="font-medium">{assignment.machinery?.name || "不明な重機"}</p>
                          <p className="text-sm text-muted-foreground">
                            {assignment.start_date &&
                              format(new Date(assignment.start_date), "yyyy年MM月dd日", { locale: ja })}
                            {assignment.end_date &&
                              ` 〜 ${format(new Date(assignment.end_date), "yyyy年MM月dd日", {
                                locale: ja,
                              })}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">重機の割り当てはありません</p>
                  )}
                </TabsContent>

                <TabsContent value="vehicles">
                  {vehicleData.length > 0 ? (
                    <div className="space-y-2">
                      {vehicleData.map((assignment) => (
                        <div key={assignment.id} className="p-2 border rounded-md">
                          <p className="font-medium">{assignment.vehicle?.name || "不明な車両"}</p>
                          <p className="text-sm text-muted-foreground">
                            {assignment.start_date &&
                              format(new Date(assignment.start_date), "yyyy年MM月dd日", { locale: ja })}
                            {assignment.end_date &&
                              ` 〜 ${format(new Date(assignment.end_date), "yyyy年MM月dd日", {
                                locale: ja,
                              })}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">車両の割り当てはありません</p>
                  )}
                </TabsContent>

                <TabsContent value="tools">
                  {toolData.length > 0 ? (
                    <div className="space-y-2">
                      {toolData.map((assignment) => (
                        <div key={assignment.id} className="p-2 border rounded-md">
                          <p className="font-medium">{assignment.tool?.name || "不明な工具"}</p>
                          <p className="text-sm text-muted-foreground">
                            {assignment.start_date &&
                              format(new Date(assignment.start_date), "yyyy年MM月dd日", { locale: ja })}
                            {assignment.end_date &&
                              ` 〜 ${format(new Date(assignment.end_date), "yyyy年MM月dd日", {
                                locale: ja,
                              })}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">工具の割り当てはありません</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button asChild variant="outline">
          <Link href="/deals">案件一覧に戻る</Link>
        </Button>
        <Button asChild>
          <Link href={`/deals/${dealId}/edit`}>編集する</Link>
        </Button>
      </div>
    </div>
  )
}
