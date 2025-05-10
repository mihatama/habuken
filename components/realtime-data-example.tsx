"use client"

import { useState, useEffect } from "react"
import { useRealtimeSubscription } from "@/hooks/use-realtime-subscription"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"

export function RealtimeDataExample() {
  const [recentEvents, setRecentEvents] = useState<any[]>([])

  // 日報テーブルのリアルタイム更新を監視
  const dailyReportsPayload = useRealtimeSubscription("daily_reports")

  // 休暇申請テーブルのリアルタイム更新を監視
  const leaveRequestsPayload = useRealtimeSubscription("leave_requests")

  // ペイロードが更新されたらイベントリストに追加
  useEffect(() => {
    if (dailyReportsPayload) {
      addEvent("daily_reports", dailyReportsPayload)
    }
  }, [dailyReportsPayload])

  useEffect(() => {
    if (leaveRequestsPayload) {
      addEvent("leave_requests", leaveRequestsPayload)
    }
  }, [leaveRequestsPayload])

  // イベントをリストに追加する関数
  const addEvent = (source: string, payload: any) => {
    setRecentEvents((prev) => {
      // 最大10件までイベントを保持
      const newEvents = [
        {
          id: Date.now(),
          source,
          eventType: payload.eventType,
          timestamp: new Date(),
          data: payload.new || payload.old,
        },
        ...prev,
      ].slice(0, 10)

      return newEvents
    })
  }

  // イベントタイプに応じたバッジの色を返す関数
  const getBadgeColor = (eventType: string) => {
    switch (eventType) {
      case "INSERT":
        return "bg-green-500"
      case "UPDATE":
        return "bg-blue-500"
      case "DELETE":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>リアルタイムデータ更新</CardTitle>
      </CardHeader>
      <CardContent>
        {recentEvents.length === 0 ? (
          <p className="text-gray-500">まだイベントはありません。データが更新されるとここに表示されます。</p>
        ) : (
          <ul className="space-y-3">
            {recentEvents.map((event) => (
              <li key={event.id} className="border p-3 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getBadgeColor(event.eventType)}>{event.eventType}</Badge>
                    <span className="font-medium">{event.source}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(event.timestamp, { addSuffix: true, locale: ja })}
                  </span>
                </div>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(event.data, null, 2)}
                </pre>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
