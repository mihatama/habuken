"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useRealtimeSubscription } from "@/hooks/use-realtime-subscription"
import { notificationService } from "@/lib/notification-service"
import { useNotificationPermission } from "@/hooks/use-notification-permission"
import { useToast } from "@/components/ui/use-toast"

export function DealsNotificationHandler() {
  const router = useRouter()
  const { toast } = useToast()
  const { permission, requestPermission, supported, isGranted } = useNotificationPermission()
  const hasRequestedPermission = useRef(false)

  // dealsテーブルのリアルタイム変更を監視
  const payload = useRealtimeSubscription("deals", {
    enabled: isGranted, // 通知権限がある場合のみ有効化
  })

  // 通知権限のリクエスト
  useEffect(() => {
    const requestNotificationPermission = async () => {
      if (supported && permission === "default" && !hasRequestedPermission.current) {
        hasRequestedPermission.current = true

        // 通知権限をリクエスト
        const granted = await requestPermission()

        if (granted) {
          toast({
            title: "通知が有効になりました",
            description: "現場情報の更新通知を受け取ることができます",
          })
        } else if (permission === "denied") {
          toast({
            title: "通知が無効です",
            description: "ブラウザの設定から通知を有効にしてください",
            variant: "destructive",
          })
        }
      }
    }

    requestNotificationPermission()
  }, [permission, requestPermission, supported, toast])

  // リアルタイム更新を監視して通知を送信
  useEffect(() => {
    if (!payload || !isGranted) return

    const handleNotification = async () => {
      const { eventType, new: newRecord, old: oldRecord } = payload

      let title = ""
      let body = ""
      let dealId = ""

      switch (eventType) {
        case "INSERT":
          title = "新しい現場が追加されました"
          body = `現場名: ${newRecord.name}`
          dealId = newRecord.id
          break
        case "UPDATE":
          title = "現場情報が更新されました"
          body = `現場名: ${newRecord.name}`
          dealId = newRecord.id
          break
        case "DELETE":
          title = "現場が削除されました"
          body = `現場名: ${oldRecord.name}`
          dealId = oldRecord.id
          break
        default:
          return
      }

      await notificationService.sendNotification({
        title,
        body,
        tag: `deal-${dealId}`,
        data: { dealId },
        onClick: () => {
          // 削除以外の場合は現場詳細ページに遷移
          if (eventType !== "DELETE" && dealId) {
            router.push(`/deals/${dealId}`)
          } else {
            router.push("/deals")
          }
        },
      })
    }

    handleNotification()
  }, [payload, isGranted, router])

  // UIは表示しない（バックグラウンド処理のみ）
  return null
}
