"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getClientSupabase } from "@/lib/supabase-utils"
import { Loader2, Edit, Eye, Trash2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { DealRegistrationModal } from "@/components/deal-registration-modal"
import { toast } from "@/components/ui/use-toast"
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
import type { Deal } from "@/types/supabase"

export function DealsList() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [dealToDelete, setDealToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchDeals()
  }, [])

  async function fetchDeals() {
    try {
      setLoading(true)
      const supabase = getClientSupabase()

      console.log("Fetching deals from Supabase database...")
      const { data, error } = await supabase.from("deals").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching deals:", error)
        throw error
      }

      console.log(`Successfully fetched ${data?.length || 0} deals from database`)
      setDeals(data || [])
    } catch (err: any) {
      console.error("案件データの取得エラー:", err)
      setError("案件データの取得中にエラーが発生しました。")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (dealId: string) => {
    setDealToDelete(dealId)
    setDeleteDialogOpen(true)
  }

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
        description: "案件が正常に削除されました。",
      })

      // 案件リストを更新
      setDeals(deals.filter((deal) => deal.id !== dealToDelete))
    } catch (err: any) {
      console.error("案件削除エラー:", err)
      toast({
        title: "エラー",
        description: `案件の削除に失敗しました: ${err.message || "不明なエラー"}`,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setDealToDelete(null)
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

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">データ取得エラー</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => fetchDeals()} className="mt-4">
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
          <h3 className="text-xl font-semibold mb-2">案件がありません</h3>
          <p className="text-muted-foreground mb-4">新しい案件を登録してください</p>
          <DealRegistrationModal />
        </div>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deals.map((deal) => (
          <Card key={deal.id} className="overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold line-clamp-2">{deal.name}</h3>
                <Badge variant={getStatusBadgeVariant(deal.status) as any}>{deal.status}</Badge>
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

              <div className="flex justify-between items-center">
                <Link href={`/deals/${deal.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    詳細
                  </Button>
                </Link>
                <div className="space-x-2">
                  <Link href={`/deals/${deal.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      編集
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteClick(deal.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    削除
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>案件を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は元に戻せません。案件に関連するすべてのデータ（スタッフ割り当て、重機割り当てなど）も削除されます。
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
    </>
  )
}
