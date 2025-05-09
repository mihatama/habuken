"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect, useCallback } from "react"
import { getClientSupabase } from "@/lib/supabase-utils"
import { Loader2, AlertCircle } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/components/ui/use-toast"
import { debounce } from "lodash"

interface Deal {
  id: string
  name: string
  startDate: Date
  endDate: Date | null
  status: string
  actualProgress: number
  plannedProgress: number
}

interface ProjectProgressPanelProps {
  deals?: any[] // 親コンポーネントから渡される案件データ
}

// コンポーネントの外でdebounce関数を定義
const createDebouncedSave = () =>
  debounce(async (dealId: string, progress: number, updateFn: (id: string, progress: number) => Promise<boolean>) => {
    try {
      const success = await updateFn(dealId, progress)
      if (success) {
        toast({
          title: "進捗率を更新しました",
          description: `進捗率を${progress}%に更新しました`,
        })
      }
    } catch (error) {
      console.error("進捗率の更新に失敗しました", error)
      toast({
        title: "エラー",
        description: "進捗率の更新に失敗しました",
        variant: "destructive",
      })
    }
  }, 1000)

export function ProjectProgressPanel({ deals: initialDeals }: ProjectProgressPanelProps) {
  const [deals, setDeals] = useState<Deal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortedDealIds, setSortedDealIds] = useState<string[]>([])

  // useCallbackを使用してメモ化された関数を作成
  const updateActualProgress = useCallback(async (dealId: string, progress: number): Promise<boolean> => {
    try {
      const supabase = getClientSupabase()
      const { error } = await supabase.from("deals").update({ actual_progress: progress }).eq("id", dealId)

      if (error) throw error
      return true
    } catch (err) {
      console.error("進捗率の更新エラー:", err)
      return false
    }
  }, [])

  // デバウンスされた保存関数をuseCallbackで作成
  const debouncedSaveProgress = useCallback(createDebouncedSave(), [])

  useEffect(() => {
    if (initialDeals && initialDeals.length > 0) {
      // 親コンポーネントからデータが渡された場合はそれを使用
      const formattedDeals = formatDeals(initialDeals)
      setDeals(formattedDeals)

      // 初回ロード時にソート順を保存
      const sortedDeals = formattedDeals
        .filter((deal) => deal.status === "進行中" || deal.status === "準備中")
        .filter((deal) => !isProjectExpired(deal)) // 期限切れの案件を除外
        .sort((a, b) => a.plannedProgress - a.actualProgress - (b.plannedProgress - b.actualProgress))

      setSortedDealIds(sortedDeals.map((deal) => deal.id))
      setIsLoading(false)
    } else {
      fetchDeals()
    }

    // クリーンアップ関数
    return () => {
      debouncedSaveProgress.cancel()
    }
  }, [initialDeals, debouncedSaveProgress])

  // 案件データのフォーマット関数
  function formatDeals(data) {
    const today = new Date()

    return data.map((deal) => {
      let startDate
      if (deal.start_date) {
        startDate = new Date(deal.start_date)
        // 時間部分をリセット
        startDate.setHours(0, 0, 0, 0)
      } else {
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      }

      let endDate
      if (deal.end_date) {
        endDate = new Date(deal.end_date)
        // 時間部分をリセット
        endDate.setHours(0, 0, 0, 0)
      } else {
        endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0)
      }

      // 計画上の進捗率を計算（開始日から終了日までの期間における現在日付の位置）
      let plannedProgress = 0

      if (endDate) {
        const totalDuration = endDate.getTime() - startDate.getTime()
        const elapsedDuration = today.getTime() - startDate.getTime()

        if (totalDuration > 0) {
          plannedProgress = Math.min(Math.max(Math.round((elapsedDuration / totalDuration) * 100), 0), 100)
        }
      }

      // 実際の進捗率を計算
      // ステータスと期間に基づいて計算
      // 実際の進捗率はデータベースから取得、なければ計算値を使用
      const actualProgress =
        deal.actual_progress !== undefined && deal.actual_progress !== null
          ? deal.actual_progress
          : calculateActualProgress(deal.status, startDate, endDate, plannedProgress)

      return {
        id: deal.id,
        name: deal.name,
        startDate: startDate,
        endDate: endDate,
        status: getStatusLabel(deal.status || "in_progress"),
        actualProgress: actualProgress,
        plannedProgress: plannedProgress,
      }
    })
  }

  // ステータスと期間に基づいて実際の進捗率を計算
  function calculateActualProgress(
    status: string,
    startDate: Date | null,
    endDate: Date | null,
    plannedProgress: number,
  ): number {
    const today = new Date()

    // ステータスに基づく進捗率の計算
    switch (status) {
      case "completed":
      case "完了":
        return 100

      case "suspended":
      case "中断":
        // 中断された案件は計画進捗の80%程度と仮定
        return Math.round(plannedProgress * 0.8)

      case "planned":
      case "計画中":
      case "準備中":
        // 準備中の案件は開始前なら5%、開始後は計画進捗の30%程度と仮定
        if (today < startDate) return 5
        return Math.min(Math.max(Math.round(plannedProgress * 0.3), 5), 30)

      case "in_progress":
      case "進行中":
        // 進行中の案件は計画進捗に基づいて計算
        // 開始直後は少し遅れ気味、中盤で追いつき、終盤で計画通りと仮定
        if (plannedProgress < 30) {
          // 初期段階: 計画より少し遅れ気味 (計画の85%)
          return Math.round(plannedProgress * 0.85)
        } else if (plannedProgress < 70) {
          // 中盤: 計画に近づく (計画の95%)
          return Math.round(plannedProgress * 0.95)
        } else {
          // 終盤: 計画通りに進行
          return plannedProgress
        }

      default:
        // デフォルトは計画進捗と同じ
        return plannedProgress
    }
  }

  async function fetchDeals() {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = getClientSupabase()

      // 案件データの取得 - deals テーブルから
      const { data, error } = await supabase
        .from("deals")
        .select("id, name, start_date, end_date, status, actual_progress")
        .order("start_date", { ascending: false })

      if (error) throw error

      // 抽出した関数を使用
      const formattedDeals = formatDeals(data)

      setDeals(formattedDeals)
    } catch (err) {
      console.error("案件データの取得エラー:", err)
      setError("データの取得中にエラーが発生しました。")

      // エラー時はダミーデータを使用
      const today = new Date()
      setDeals([
        {
          id: "1",
          name: "東京都港区オフィスビル新築工事",
          startDate: new Date(2023, 0, 15),
          endDate: new Date(2023, 7, 30),
          status: "進行中",
          actualProgress: 65,
          plannedProgress: 80,
        },
        {
          id: "2",
          name: "横浜市マンション改修工事",
          startDate: new Date(2023, 2, 10),
          endDate: new Date(2023, 5, 20),
          status: "進行中",
          actualProgress: 85,
          plannedProgress: 90,
        },
        {
          id: "3",
          name: "埼玉県倉庫増築工事",
          startDate: new Date(2023, 3, 5),
          endDate: new Date(2023, 8, 15),
          status: "準備中",
          actualProgress: 15,
          plannedProgress: 30,
        },
        {
          id: "4",
          name: "千葉県道路拡張工事",
          startDate: new Date(2023, 1, 20),
          endDate: new Date(2023, 9, 10),
          status: "進行中",
          actualProgress: 45,
          plannedProgress: 60,
        },
        {
          id: "5",
          name: "神奈川県橋梁補強工事",
          startDate: new Date(2023, 4, 12),
          endDate: new Date(2023, 10, 25),
          status: "準備中",
          actualProgress: 10,
          plannedProgress: 20,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // ステータスラベルの取得
  function getStatusLabel(status: string): string {
    const statusMap = {
      in_progress: "進行中",
      planned: "準備中",
      completed: "完了",
      suspended: "中断",
      計画中: "準備中",
      進行中: "進行中",
      完了: "完了",
      中断: "中断",
      準備中: "準備中",
    }
    return statusMap[status] || status
  }

  // ステータスに応じたバッジのバリアントを取得
  function getStatusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
    switch (status) {
      case "進行中":
        return "default"
      case "準備中":
        return "secondary"
      case "完了":
        return "outline"
      case "中断":
        return "destructive"
      default:
        return "outline"
    }
  }

  // 進捗状況の差に基づく色を取得
  function getProgressDifferenceColor(actual: number, planned: number): string {
    const difference = actual - planned
    if (difference >= 5) return "text-green-600"
    if (difference <= -10) return "text-red-600"
    if (difference < 0) return "text-amber-600"
    return "text-slate-600 dark:text-slate-400"
  }

  // 日付をフォーマット
  function formatDate(date: Date | null): string {
    if (!date) return "未定"
    return date.toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" })
  }

  // 案件が期限切れかどうかを判定する関数
  function isProjectExpired(deal: Deal): boolean {
    const today = new Date()
    // 日付のみを比較するために時間部分をリセット
    today.setHours(0, 0, 0, 0)

    if (!deal.endDate) return false

    // 終了日の時間部分もリセット
    const endDate = new Date(deal.endDate)
    endDate.setHours(0, 0, 0, 0)

    return endDate < today
  }

  // 進行中かつ期限内の案件のみをフィルタリング
  const filteredDeals = deals.filter(
    (deal) => (deal.status === "進行中" || deal.status === "準備中") && !isProjectExpired(deal),
  )

  // 保存したソート順を使用して案件を並べ替え
  const activeDeals =
    sortedDealIds.length > 0
      ? (sortedDealIds.map((id) => filteredDeals.find((deal) => deal.id === id)).filter(Boolean) as Deal[]).slice(0, 5)
      : filteredDeals.slice(0, 5)

  // デバッグ用のコンソールログを追加（問題解決後に削除可能）
  console.log("Today:", new Date())
  console.log(
    "Filtered deals:",
    filteredDeals.map((d) => ({
      name: d.name,
      endDate: d.endDate,
      expired: isProjectExpired(d),
    })),
  )
  console.log(
    "Active deals:",
    activeDeals.map((d) => d.name),
  )

  // スライダーの値変更時の処理を修正
  function handleProgressChange(dealId: string, value: number[]) {
    // UI更新のみを行う（即時反映）
    setDeals(deals.map((deal) => (deal.id === dealId ? { ...deal, actualProgress: value[0] } : deal)))

    // デバウンスされた保存処理を呼び出す
    debouncedSaveProgress(dealId, value[0], updateActualProgress)
  }

  if (isLoading) {
    return (
      <Card className="col-span-full md:col-span-1">
        <CardHeader>
          <CardTitle>現場進捗</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="col-span-full md:col-span-1">
        <CardHeader>
          <CardTitle>現場進捗</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-amber-600 mb-4">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
          {activeDeals.length > 0 && <p className="text-sm text-muted-foreground">ダミーデータを表示しています</p>}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-full md:col-span-1">
      <CardHeader>
        <CardTitle>現場進捗</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeDeals.length > 0 ? (
          activeDeals.map((deal) => (
            <div key={deal.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{deal.name}</div>
                  <div className="text-caption text-muted-foreground">
                    {formatDate(deal.startDate)} ~ {formatDate(deal.endDate)}
                  </div>
                </div>
                <Badge variant={getStatusVariant(deal.status)}>{deal.status}</Badge>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>実際の進捗</span>
                  <span className="font-medium">{deal.actualProgress}%</span>
                </div>
                <div className="py-2">
                  <Slider
                    value={[deal.actualProgress]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => handleProgressChange(deal.id, value)}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>計画上の進捗</span>
                  <span
                    className={`font-medium ${getProgressDifferenceColor(deal.actualProgress, deal.plannedProgress)}`}
                  >
                    {deal.plannedProgress}%
                    {deal.actualProgress !== deal.plannedProgress && (
                      <span>
                        {" "}
                        ({deal.actualProgress > deal.plannedProgress ? "+" : ""}
                        {deal.actualProgress - deal.plannedProgress}%)
                      </span>
                    )}
                  </span>
                </div>
                <Progress value={deal.plannedProgress} className="h-1 opacity-60" />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-4">進行中の案件はありません</div>
        )}
      </CardContent>
    </Card>
  )
}
