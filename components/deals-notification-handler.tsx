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
      console.log("[通知デバッグ] 権限状態:", {
        supported,
        permission,
        hasRequested: hasRequestedPermission.current,
      })

      if (supported && permission === "default" && !hasRequestedPermission.current) {
        hasRequestedPermission.current = true
        console.log("[通知デバッグ] 通知権限をリクエストします")

        // 通知権限をリクエスト
        const granted = await requestPermission()
        console.log("[通知デバッグ] 通知権限リクエスト結果:", granted)

        if (granted) {
          toast({
            title: "通知が有効になりました",
            description: "現場情報の更新通知を受け取ることができます",
          })
        } else if (permission === "denied") {
          console.log("[通知デバッグ] 通知が拒否されました")
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
    if (!payload) {
      console.log("[通知デバッグ] payload がありません")
      return
    }

    if (!isGranted) {
      console.log("[通知デバッグ] 通知権限がありません", { permission })
      return
    }

    console.log("[通知デバッグ] リアルタイム更新を受信:", payload)

    const handleNotification = async () => {
      const { eventType, new: newRecord, old: oldRecord } = payload
      console.log("[通知デバッグ] イベントタイプ:", eventType, { newRecord, oldRecord })

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
          console.log("[通知デバッグ] 未知のイベントタイプ:", eventType)
          return
      }

      console.log("[通知デバッグ] 通知を送信します:", { title, body, dealId })

      const result = await notificationService.sendNotification({
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

      console.log("[通知デバッグ] 通知送信結果:", result)
    }

    handleNotification()
  }, [payload, isGranted, router, permission])

  // UIは表示しない（バックグラウンド処理のみ）
  return null
}
