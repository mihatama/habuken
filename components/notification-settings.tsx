"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useNotificationPermission } from "@/hooks/use-notification-permission"
import { Bell, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function NotificationSettings() {
  const { toast } = useToast()
  const { permission, requestPermission, supported, isGranted, isDenied } = useNotificationPermission()
  const [dealsNotifications, setDealsNotifications] = useState(false)

  // 初期状態の設定
  useEffect(() => {
    // ローカルストレージから設定を読み込む
    const savedSettings = localStorage.getItem("notification-settings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setDealsNotifications(settings.deals || false)
    }

    // 通知権限がある場合は設定を有効化
    if (isGranted) {
      setDealsNotifications(true)
    }
  }, [isGranted])

  // 設定の保存
  const saveSettings = (deals: boolean) => {
    setDealsNotifications(deals)
    localStorage.setItem("notification-settings", JSON.stringify({ deals }))
  }

  // 通知権限のリクエスト
  const handleEnableNotifications = async () => {
    console.log("[通知設定] 通知有効化開始", { supported })

    if (!supported) {
      console.log("[通知設定] 通知がサポートされていません")
      toast({
        title: "通知がサポートされていません",
        description: "お使いのブラウザは通知機能をサポートしていません",
        variant: "destructive",
      })
      return
    }

    console.log("[通知設定] 通知権限をリクエストします")
    const granted = await requestPermission()
    console.log("[通知設定] 通知権限リクエスト結果:", granted)

    if (granted) {
      saveSettings(true)
      toast({
        title: "通知が有効になりました",
        description: "現場情報の更新通知を受け取ることができます",
      })
    } else if (isDenied) {
      console.log("[通知設定] 通知が拒否されました")
      toast({
        title: "通知が拒否されました",
        description: "ブラウザの設定から通知を有効にしてください",
        variant: "destructive",
      })
    }
  }

  // 通知設定の切り替え
  const handleToggleDealsNotifications = (checked: boolean) => {
    console.log("[通知設定] 通知設定変更:", { checked, isGranted })

    if (checked && !isGranted) {
      console.log("[通知設定] 通知権限をリクエストします")
      handleEnableNotifications()
      return
    }

    console.log("[通知設定] 設定を保存します:", checked)
    saveSettings(checked)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          通知設定
        </CardTitle>
        <CardDescription>アプリからの通知設定を管理します</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!supported && (
          <div className="flex items-center p-3 text-amber-800 bg-amber-50 rounded-md">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p className="text-sm">お使いのブラウザは通知機能をサポートしていません</p>
          </div>
        )}

        {isDenied && (
          <div className="flex items-center p-3 text-amber-800 bg-amber-50 rounded-md">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p className="text-sm">通知が拒否されています。ブラウザの設定から通知を有効にしてください</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="font-medium">現場情報の更新通知</div>
            <div className="text-sm text-muted-foreground">現場の追加・更新・削除時に通知を受け取ります</div>
          </div>
          <Switch
            checked={dealsNotifications}
            onCheckedChange={handleToggleDealsNotifications}
            disabled={!supported || isDenied}
          />
        </div>
      </CardContent>
      <CardFooter>
        {!isGranted && !isDenied && (
          <Button onClick={handleEnableNotifications} disabled={!supported}>
            通知を有効にする
          </Button>
        )}

        {isDenied && (
          <Button variant="outline" onClick={() => window.open("about:preferences#privacy", "_blank")}>
            ブラウザの設定を開く
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
