"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getClientSupabase } from "@/lib/supabase-utils"
import { Loader2, Users, Truck, Package, Car, Calendar } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import type { Deal } from "@/types/supabase"

interface DealDetailsProps {
  deal: Deal
}

export function DealDetails({ deal }: DealDetailsProps) {
  const [loading, setLoading] = useState(true)
  const [staffData, setStaffData] = useState<any[]>([])
  const [machineryData, setMachineryData] = useState<any[]>([])
  const [vehiclesData, setVehiclesData] = useState<any[]>([])
  const [toolsData, setToolsData] = useState<any[]>([])

  useEffect(() => {
    const fetchDealResources = async () => {
      try {
        setLoading(true)
        const supabase = getClientSupabase()

        // スタッフデータの取得
        const { data: staffAssignments, error: staffError } = await supabase
          .from("deal_staff")
          .select("*, staff:staff_id(*)")
          .eq("deal_id", deal.id)

        if (staffError) throw staffError
        setStaffData(staffAssignments || [])

        // 重機データの取得
        const { data: machineryAssignments, error: machineryError } = await supabase
          .from("deal_machinery")
          .select("*, machinery:machinery_id(*)")
          .eq("deal_id", deal.id)

        if (machineryError) throw machineryError
        setMachineryData(machineryAssignments || [])

        // 車両データの取得
        const { data: vehicleAssignments, error: vehicleError } = await supabase
          .from("deal_vehicles")
          .select("*, vehicle:vehicle_id(*)")
          .eq("deal_id", deal.id)

        if (vehicleError) throw vehicleError
        setVehiclesData(vehicleAssignments || [])

        // 備品データの取得
        const { data: toolAssignments, error: toolError } = await supabase
          .from("deal_tools")
          .select("*, tool:tool_id(*)")
          .eq("deal_id", deal.id)

        if (toolError) throw toolError
        setToolsData(toolAssignments || [])
      } catch (error) {
        console.error("案件リソース取得エラー:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDealResources()
  }, [deal.id])

  // 日付のフォーマット
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return format(new Date(dateString), "yyyy年MM月dd日", { locale: ja })
  }

  // ステータスの表示名
  const getStatusLabel = (status: string) => {
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

  // ステータスのバリアント
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "outline"
      case "approved":
        return "secondary"
      case "in_progress":
        return "default"
      case "completed":
        return "success"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">{deal.name}</CardTitle>
            <p className="text-muted-foreground mt-1">
              {deal.client_name ? `クライアント: ${deal.client_name}` : "クライアント: 未設定"}
            </p>
          </div>
          <Badge variant={getStatusVariant(deal.status)} className="px-3 py-1 text-sm">
            {getStatusLabel(deal.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium mb-2">案件期間</h3>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {formatDate(deal.start_date)} 〜 {formatDate(deal.end_date)}
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">場所</h3>
            <p>{deal.location || "未設定"}</p>
          </div>
        </div>

        {deal.description && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">案件詳細</h3>
            <p className="whitespace-pre-line">{deal.description}</p>
          </div>
        )}

        <Tabs defaultValue="staff" className="mt-6">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              スタッフ
            </TabsTrigger>
            <TabsTrigger value="heavy" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              重機
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              車両
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              備品
            </TabsTrigger>
          </TabsList>

          <TabsContent value="staff">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : staffData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>この案件に割り当てられたスタッフはいません</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名前</TableHead>
                    <TableHead>役職</TableHead>
                    <TableHead>連絡先</TableHead>
                    <TableHead>使用期間</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffData.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.staff?.full_name || "-"}</TableCell>
                      <TableCell>{assignment.staff?.position || "-"}</TableCell>
                      <TableCell>{assignment.staff?.phone || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(assignment.start_date)} 〜 {formatDate(assignment.end_date)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="heavy">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : machineryData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Truck className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>この案件に割り当てられた重機はありません</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名前</TableHead>
                    <TableHead>種類</TableHead>
                    <TableHead>所有形態</TableHead>
                    <TableHead>使用期間</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {machineryData.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.machinery?.name || "-"}</TableCell>
                      <TableCell>{assignment.machinery?.type || "-"}</TableCell>
                      <TableCell>{assignment.machinery?.ownership_type || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(assignment.start_date)} 〜 {formatDate(assignment.end_date)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="vehicles">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : vehiclesData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>この案件に割り当てられた車両はありません</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名前</TableHead>
                    <TableHead>種類</TableHead>
                    <TableHead>所有形態</TableHead>
                    <TableHead>使用期間</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehiclesData.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.vehicle?.name || "-"}</TableCell>
                      <TableCell>{assignment.vehicle?.type || "-"}</TableCell>
                      <TableCell>{assignment.vehicle?.ownership_type || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(assignment.start_date)} 〜 {formatDate(assignment.end_date)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="tools">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : toolsData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>この案件に割り当てられた備品はありません</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名前</TableHead>
                    <TableHead>保管場所</TableHead>
                    <TableHead>状態</TableHead>
                    <TableHead>使用期間</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {toolsData.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.tool?.name || "-"}</TableCell>
                      <TableCell>{assignment.tool?.storage_location || "-"}</TableCell>
                      <TableCell>{assignment.tool?.condition || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(assignment.start_date)} 〜 {formatDate(assignment.end_date)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
