"use client"

import { useState, useEffect } from "react"

type NotificationPermission = "default" | "granted" | "denied"

export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [supported, setSupported] = useState<boolean>(false)

  useEffect(() => {
    // 通知APIがサポートされているか確認
    const isSupported = "Notification" in window
    setSupported(isSupported)

    if (isSupported) {
      // 現在の権限状態を取得
      setPermission(Notification.permission as NotificationPermission)
    }
  }, [])

  // 通知の権限をリクエスト
  const requestPermission = async (): Promise<boolean> => {
    console.log("[通知権限] リクエスト開始", { supported })

    if (!supported) {
      console.log("[通知権限] 通知がサポートされていません")
      return false
    }

    try {
      console.log("[通知権限] Notification.requestPermission を呼び出します")
      const result = await Notification.requestPermission()
      console.log("[通知権限] 権限リクエスト結果:", result)

      setPermission(result as NotificationPermission)
      return result === "granted"
    } catch (error) {
      console.error("[通知権限] 通知権限のリクエストに失敗しました:", error)
      return false
    }
  }

  return {
    permission,
    supported,
    requestPermission,
    isGranted: permission === "granted",
    isDenied: permission === "denied",
  }
}
