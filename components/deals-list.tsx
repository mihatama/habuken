"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getClientSupabase } from "@/lib/supabase-utils"
import { Loader2, Edit, Eye, Trash2, AlertCircle, PlusCircle } from "lucide-react"
import Link from "next/link"

type Deal = {
  id: string
  name: string
  client_name: string
  estimated_value: number
  start_date: string
  end_date: string | null
  status: string
  created_at: string
}

export function DealsList() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDeals() {
      try {
        const supabase = getClientSupabase()

        const { data, error } = await supabase.from("deals").select("*").order("created_at", { ascending: false })

        if (error) throw error

        setDeals(data || [])
      } catch (err) {
        console.error("案件データの取得エラー:", err)
        setError("案件データの取得中にエラーが発生しました。")
      } finally {
        setLoading(false)
      }
    }

    fetchDeals()
  }, [])

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

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">データ取得エラー</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
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
          <Link href="/deals/register">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              新規案件登録
            </Button>
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="px-4 py-3 text-left text-sm font-medium">案件名</th>
              <th className="px-4 py-3 text-left text-sm font-medium">クライアント</th>
              <th className="px-4 py-3 text-left text-sm font-medium">見積金額</th>
              <th className="px-4 py-3 text-left text-sm font-medium">開始日</th>
              <th className="px-4 py-3 text-left text-sm font-medium">終了日</th>
              <th className="px-4 py-3 text-left text-sm font-medium">ステータス</th>
              <th className="px-4 py-3 text-right text-sm font-medium">アクション</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {deals.map((deal) => (
              <tr key={deal.id} className="hover:bg-muted/50">
                <td className="px-4 py-3 text-sm">{deal.name}</td>
                <td className="px-4 py-3 text-sm">{deal.client_name}</td>
                <td className="px-4 py-3 text-sm">{formatCurrency(deal.estimated_value)}</td>
                <td className="px-4 py-3 text-sm">{new Date(deal.start_date).toLocaleDateString("ja-JP")}</td>
                <td className="px-4 py-3 text-sm">
                  {deal.end_date ? new Date(deal.end_date).toLocaleDateString("ja-JP") : "-"}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(deal.status)}`}>
                    {getStatusText(deal.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="flex justify-end space-x-2">
                    <Link href={`/deals/${deal.id}`}>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">詳細</span>
                      </Button>
                    </Link>
                    <Link href={`/deals/${deal.id}/edit`}>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">編集</span>
                      </Button>
                    </Link>
                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">削除</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
