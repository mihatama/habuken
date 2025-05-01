"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ChevronDown, ChevronUp, Users, Truck, Car, Key } from "lucide-react"
import { formatDate } from "@/utils/date-utils"

interface Deal {
  id: string
  name: string
  client: string
  location: string
  start_date: string
  end_date: string
  status: string
  resources?: {
    staff: number
    heavy: number
    vehicle: number
    tools: number
  }
}

export function EnhancedDealsList() {
  const router = useRouter()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedDeals, setExpandedDeals] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // 実際のアプリケーションではAPIからデータを取得します
    // ここではサンプルデータを使用します
    const fetchDeals = async () => {
      try {
        // サンプルデータ
        const sampleDeals: Deal[] = [
          {
            id: "1",
            name: "東京オフィスビル改修工事",
            client: "株式会社東京建設",
            location: "東京都中央区",
            start_date: "2023-06-01",
            end_date: "2023-08-31",
            status: "進行中",
            resources: {
              staff: 8,
              heavy: 2,
              vehicle: 3,
              tools: 12,
            },
          },
          {
            id: "2",
            name: "大阪マンション新築工事",
            client: "大阪不動産株式会社",
            location: "大阪府大阪市",
            start_date: "2023-07-15",
            end_date: "2024-01-20",
            status: "計画中",
            resources: {
              staff: 15,
              heavy: 4,
              vehicle: 6,
              tools: 25,
            },
          },
          {
            id: "3",
            name: "名古屋商業施設リノベーション",
            client: "中部開発株式会社",
            location: "愛知県名古屋市",
            start_date: "2023-05-10",
            end_date: "2023-09-30",
            status: "進行中",
            resources: {
              staff: 12,
              heavy: 3,
              vehicle: 4,
              tools: 18,
            },
          },
        ]

        setDeals(sampleDeals)
        setLoading(false)
      } catch (error) {
        console.error("案件データの取得に失敗しました:", error)
        setLoading(false)
      }
    }

    fetchDeals()
  }, [])

  const toggleDealExpand = (dealId: string) => {
    setExpandedDeals((prev) => ({
      ...prev,
      [dealId]: !prev[dealId],
    }))
  }

  const navigateToDealDetails = (dealId: string) => {
    router.push(`/deals/${dealId}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {deals.map((deal) => (
        <Card key={deal.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div
              className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigateToDealDetails(deal.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{deal.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {deal.client} - {deal.location}
                  </p>
                  <p className="text-sm">
                    {formatDate(new Date(deal.start_date))} 〜 {formatDate(new Date(deal.end_date))}
                  </p>
                </div>
                <Badge variant={deal.status === "進行中" ? "default" : "outline"}>{deal.status}</Badge>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {deal.resources && (
                  <>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      スタッフ: {deal.resources.staff}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      重機: {deal.resources.heavy}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Car className="h-3 w-3" />
                      車両: {deal.resources.vehicle}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Key className="h-3 w-3" />
                      備品: {deal.resources.tools}
                    </Badge>
                  </>
                )}
              </div>
            </div>

            <div className="border-t px-4 py-2 bg-muted/20">
              <Button
                variant="ghost"
                size="sm"
                className="w-full flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleDealExpand(deal.id)
                }}
              >
                {expandedDeals[deal.id] ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    詳細を隠す
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    詳細を表示
                  </>
                )}
              </Button>
            </div>

            {expandedDeals[deal.id] && (
              <div className="p-4 border-t">
                <h4 className="font-medium mb-2">リソース詳細</h4>

                {/* スタッフ詳細 */}
                <div className="mb-3">
                  <h5 className="text-sm font-medium flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    スタッフ
                  </h5>
                  <div className="ml-5 mt-1">
                    <p className="text-sm">現場監督: 1名</p>
                    <p className="text-sm">作業員: {(deal.resources?.staff || 0) - 1}名</p>
                  </div>
                </div>

                {/* 重機詳細 */}
                <div className="mb-3">
                  <h5 className="text-sm font-medium flex items-center">
                    <Truck className="h-4 w-4 mr-1" />
                    重機
                  </h5>
                  <div className="ml-5 mt-1">
                    <p className="text-sm">バックホウ: 1台</p>
                    <p className="text-sm">クレーン: 1台</p>
                    {deal.resources?.heavy && deal.resources.heavy > 2 && (
                      <p className="text-sm">その他: {deal.resources.heavy - 2}台</p>
                    )}
                  </div>
                </div>

                {/* 車両詳細 */}
                <div className="mb-3">
                  <h5 className="text-sm font-medium flex items-center">
                    <Car className="h-4 w-4 mr-1" />
                    車両
                  </h5>
                  <div className="ml-5 mt-1">
                    <p className="text-sm">トラック: 2台</p>
                    <p className="text-sm">軽トラック: 1台</p>
                    {deal.resources?.vehicle && deal.resources.vehicle > 3 && (
                      <p className="text-sm">その他: {deal.resources.vehicle - 3}台</p>
                    )}
                  </div>
                </div>

                {/* 備品詳細 */}
                <div>
                  <h5 className="text-sm font-medium flex items-center">
                    <Key className="h-4 w-4 mr-1" />
                    備品
                  </h5>
                  <div className="ml-5 mt-1">
                    <p className="text-sm">電動工具: 8点</p>
                    <p className="text-sm">安全装備: 4点</p>
                    {deal.resources?.tools && deal.resources.tools > 12 && (
                      <p className="text-sm">その他: {deal.resources.tools - 12}点</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
