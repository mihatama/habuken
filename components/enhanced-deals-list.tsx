"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getClientSupabase } from "@/lib/supabase-utils"
import {
  Loader2,
  Edit,
  Users,
  Truck,
  Car,
  Package,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Calendar,
  Trash2,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import type { Deal } from "@/types/supabase"
import { DealEditModal } from "@/components/deal-edit-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DealWithResources extends Deal {
  staff?: { id: string; full_name: string }[]
  machinery?: { id: string; name: string }[]
  vehicles?: { id: string; name: string }[]
  tools?: { id: string; name: string }[]
  contract_amount?: number
  // pdf_url はすでに Deal 型に含まれているはずです
}

export function EnhancedDealsList() {
  const [deals, setDeals] = useState<DealWithResources[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedDeals, setExpandedDeals] = useState<Record<string, boolean>>({})
  const [editingDealId, setEditingDealId] = useState<string | null>(null)

  // Add state variables for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [dealToDelete, setDealToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchDealsWithResources()
  }, [])

  async function fetchDealsWithResources() {
    try {
      setLoading(true)
      const supabase = getClientSupabase()

      // 1. 案件データを取得
      const { data: dealsData, error: dealsError } = await supabase
        .from("deals")
        .select("*")
        .order("start_date", { ascending: false })

      if (dealsError) throw dealsError

      // 2. 関連データを一括で取得
      // スタッフ情報を一括取得
      const { data: allStaffData, error: staffError } = await supabase
        .from("deal_staff")
        .select("deal_id, staff:staff_id(id, full_name)")

      if (staffError) throw staffError

      // 重機情報を一括取得
      const { data: allMachineryData, error: machineryError } = await supabase
        .from("deal_machinery")
        .select("deal_id, machinery:machinery_id(id, name)")

      if (machineryError) throw machineryError

      // 車両情報を一括取得
      const { data: allVehiclesData, error: vehiclesError } = await supabase
        .from("deal_vehicles")
        .select("deal_id, vehicle:vehicle_id(id, name)")

      if (vehiclesError) throw vehiclesError

      // 備品情報を一括取得
      const { data: allToolsData, error: toolsError } = await supabase
        .from("deal_tools")
        .select("deal_id, tool:tool_id(id, name)")

      if (toolsError) throw toolsError

      // 3. データを整形
      const dealsWithResources: DealWithResources[] = dealsData.map((deal) => {
        // 各案件に関連するデータをフィルタリング
        const staffData = allStaffData?.filter((item) => item.deal_id === deal.id) || []
        const machineryData = allMachineryData?.filter((item) => item.deal_id === deal.id) || []
        const vehiclesData = allVehiclesData?.filter((item) => item.deal_id === deal.id) || []
        const toolsData = allToolsData?.filter((item) => item.deal_id === deal.id) || []

        return {
          ...deal,
          staff: staffData.map((item) => item.staff),
          machinery: machineryData.map((item) => item.machinery),
          vehicles: vehiclesData.map((item) => item.vehicle),
          tools: toolsData.map((item) => item.tool),
        }
      })

      setDeals(dealsWithResources)
      console.log("現場データの取得が完了しました。件数:", dealsWithResources.length)
    } catch (err: any) {
      console.error("現場データの取得エラー:", err)
      setError("現場データの取得中にエラーが発生しました。")
      toast({
        title: "エラー",
        description: "現場データの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleDealExpand = (dealId: string) => {
    setExpandedDeals((prev) => ({
      ...prev,
      [dealId]: !prev[dealId],
    }))
  }

  // getStatusBadgeVariant 関数内で、未選択のケースを追加し、デフォルトケースを修正します
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
      case "未選択":
        return "outline"
      default:
        return "outline"
    }
  }

  // Add the handleDeleteClick function
  const handleDeleteClick = (dealId: string) => {
    setDealToDelete(dealId)
    setDeleteDialogOpen(true)
  }

  // Add the confirmDelete function
  const confirmDelete = async () => {
    if (!dealToDelete) return

    try {
      setIsDeleting(true)
      const supabase = getClientSupabase()

      // 案件の削除
      const { error } = await supabase.from("deals").delete().eq("id", dealToDelete)

      if (error) throw error

      // 成功メッセージ
      toast({
        title: "削除完了",
        description: "現場が正常に削除されました。",
      })

      // 案件リストを更新
      setDeals(deals.filter((deal) => deal.id !== dealToDelete))
    } catch (err: any) {
      console.error("現場削除エラー:", err)
      toast({
        title: "エラー",
        description: `現場の削除に失敗しました: ${err.message || "不明なエラー"}`,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setDealToDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">データ取得エラー</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => fetchDealsWithResources()} className="mt-4">
            再読み込み
          </Button>
        </div>
      </Card>
    )
  }

  if (deals.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <h3 className="text-xl font-semibold mb-2">現場がありません</h3>
          <p className="text-muted-foreground mb-4">新しい現場を登録してください</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {deals.map((deal) => (
        <Card key={deal.id} className="w-full overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold line-clamp-2">{deal.name}</h3>
              {/* status が null または undefined または空文字の場合、「未選択」と表示するように修正 */}
              <Badge variant={getStatusBadgeVariant(deal.status || "未選択") as any}>{deal.status || "未選択"}</Badge>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              <Calendar className="h-3.5 w-3.5 inline-block mr-1" />
              {deal.start_date ? new Date(deal.start_date).toLocaleDateString("ja-JP") : "-"}{" "}
              {deal.end_date ? `~ ${new Date(deal.end_date).toLocaleDateString("ja-JP")}` : ""}
            </div>

            <div className="space-y-2 mb-4">
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

            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-1 text-sm">
                <Users className="h-4 w-4 text-blue-500" />
                <span>{deal.staff?.length || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Truck className="h-4 w-4 text-amber-500" />
                <span>{deal.machinery?.length || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Car className="h-4 w-4 text-green-500" />
                <span>{deal.vehicles?.length || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Package className="h-4 w-4 text-purple-500" />
                <span>{deal.tools?.length || 0}</span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleDealExpand(deal.id)}
              className="w-full flex items-center justify-center gap-1 text-muted-foreground"
            >
              {expandedDeals[deal.id] ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  <span>詳細を閉じる</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span>詳細を表示</span>
                </>
              )}
            </Button>

            {expandedDeals[deal.id] && (
              <div className="mt-4 pt-4 border-t">
                {/* スタッフ情報 */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    スタッフ
                  </h4>
                  {deal.staff && deal.staff.length > 0 ? (
                    <div className="grid gap-2">
                      {deal.staff.map((staff) => (
                        <div
                          key={staff.id}
                          className="flex justify-between items-center bg-blue-50 rounded-md px-3 py-1.5 text-sm"
                        >
                          <span className="font-medium">{staff.full_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {deal.start_date && new Date(deal.start_date).toLocaleDateString("ja-JP")}
                            {deal.end_date ? ` 〜 ${new Date(deal.end_date).toLocaleDateString("ja-JP")}` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">スタッフは割り当てられていません</p>
                  )}
                </div>

                {/* 重機情報 */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Truck className="h-4 w-4 text-amber-500" />
                    重機
                  </h4>
                  {deal.machinery && deal.machinery.length > 0 ? (
                    <div className="grid gap-2">
                      {deal.machinery.map((machine) => (
                        <div
                          key={machine.id}
                          className="flex justify-between items-center bg-amber-50 rounded-md px-3 py-1.5 text-sm"
                        >
                          <span className="font-medium">{machine.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {deal.start_date && new Date(deal.start_date).toLocaleDateString("ja-JP")}
                            {deal.end_date ? ` 〜 ${new Date(deal.end_date).toLocaleDateString("ja-JP")}` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">重機は割り当てられていません</p>
                  )}
                </div>

                {/* 車両情報 */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Car className="h-4 w-4 text-green-500" />
                    車両
                  </h4>
                  {deal.vehicles && deal.vehicles.length > 0 ? (
                    <div className="grid gap-2">
                      {deal.vehicles.map((vehicle) => (
                        <div
                          key={vehicle.id}
                          className="flex justify-between items-center bg-green-50 rounded-md px-3 py-1.5 text-sm"
                        >
                          <span className="font-medium">{vehicle.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {deal.start_date && new Date(deal.start_date).toLocaleDateString("ja-JP")}
                            {deal.end_date ? ` 〜 ${new Date(deal.end_date).toLocaleDateString("ja-JP")}` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">車両は割り当てられていません</p>
                  )}
                </div>

                {/* 備品情報 */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4 text-purple-500" />
                    備品
                  </h4>
                  {deal.tools && deal.tools.length > 0 ? (
                    <div className="grid gap-2">
                      {deal.tools.map((tool) => (
                        <div
                          key={tool.id}
                          className="flex justify-between items-center bg-purple-50 rounded-md px-3 py-1.5 text-sm"
                        >
                          <span className="font-medium">{tool.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {deal.start_date && new Date(deal.start_date).toLocaleDateString("ja-JP")}
                            {deal.end_date ? ` 〜 ${new Date(deal.end_date).toLocaleDateString("ja-JP")}` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">備品は割り当てられていません</p>
                  )}
                </div>

                {/* PDFファイル情報 */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-red-500" />
                    PDFファイル
                  </h4>
                  {deal.pdf_url ? (
                    <div className="bg-red-50 rounded-md px-3 py-1.5 text-sm flex justify-between items-center">
                      <span className="font-medium">添付書類</span>
                      <a
                        href={deal.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-xs"
                      >
                        表示
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">PDFファイルはアップロードされていません</p>
                  )}
                </div>

                {/* 請負金額情報 */}
                <div className="mb-4">
                  <h4 className="text-xs font-medium flex items-center gap-2 mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5 text-emerald-500"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                      <path d="M12 18V6" />
                    </svg>
                    請負金額（税込）
                  </h4>
                  <div className="bg-emerald-50 rounded-md px-3 py-2 text-sm">
                    <span className="font-medium text-lg">
                      {deal.contract_amount
                        ? new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(
                            deal.contract_amount,
                          )
                        : "未設定"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteClick(deal.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    削除
                  </Button>
                  <Link href={`/deals/${deal.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      編集
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>現場を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は元に戻せません。現場に関連するすべてのデータ（スタッフ割り当て、重機割り当てなど）も削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-red-500 hover:bg-red-600">
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {editingDealId && (
        <DealEditModal dealId={editingDealId} isOpen={!!editingDealId} onClose={() => setEditingDealId(null)} />
      )}
    </div>
  )
}
