"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { debugNotification } from "@/lib/debug-notification"
import { Bell, AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react"

export function NotificationDebug() {
  const [status, setStatus] = useState<{
    supported?: boolean
    permission?: NotificationPermission
    granted?: boolean
    testSent?: boolean
  }>({})
  const [loading, setLoading] = useState(false)

  const runDiagnostics = async () => {
    setLoading(true)
    try {
      const result = await debugNotification.checkAll()
      setStatus(result)
    } catch (error) {
      console.error("通知診断エラー:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendTestNotification = async () => {
    setLoading(true)
    try {
      const result = await debugNotification.sendTestNotification()
      setStatus((prev) => ({ ...prev, testSent: result }))
    } catch (error) {
      console.error("テスト通知エラー:", error)
    } finally {
      setLoading(false)
    }
  }

  const requestPermission = async () => {
    setLoading(true)
    try {
      const granted = await debugNotification.requestPermission()
      setStatus((prev) => ({
        ...prev,
        permission: Notification.permission,
        granted,
      }))
    } catch (error) {
      console.error("権限リクエストエラー:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          通知デバッグツール
        </CardTitle>
        <CardDescription>通知機能の問題を診断します</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm font-medium">通知サポート</div>
            <div className="flex items-center">
              {status.supported === undefined ? (
                <span className="text-gray-500">未確認</span>
              ) : status.supported ? (
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span>{status.supported ? "サポート" : "未サポート"}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium">通知権限</div>
            <div className="flex items-center">
              {!status.permission ? (
                <span className="text-gray-500">未確認</span>
              ) : status.permission === "granted" ? (
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              ) : status.permission === "denied" ? (
                <XCircle className="h-4 w-4 text-red-500 mr-1" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
              )}
              <span>
                {status.permission === "granted" ? "許可済み" : status.permission === "denied" ? "拒否" : "未設定"}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium">テスト通知</div>
            <div className="flex items-center">
              {status.testSent === undefined ? (
                <span className="text-gray-500">未実行</span>
              ) : status.testSent ? (
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span>{status.testSent ? "成功" : "失敗"}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium">Service Worker</div>
            <div className="flex items-center">
              {typeof navigator === "undefined" || !("serviceWorker" in navigator) ? (
                <XCircle className="h-4 w-4 text-red-500 mr-1" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              )}
              <span>
                {typeof navigator === "undefined" || !("serviceWorker" in navigator) ? "未サポート" : "サポート"}
              </span>
            </div>
          </div>
        </div>

        {status.permission === "denied" && (
          <div className="flex items-center p-3 text-amber-800 bg-amber-50 rounded-md">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p className="text-sm">通知が拒否されています。ブラウザの設定から通知を有効にしてください</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button onClick={runDiagnostics} disabled={loading} className="flex items-center gap-1">
          {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
          診断実行
        </Button>

        {status.supported && status.permission !== "granted" && (
          <Button onClick={requestPermission} disabled={loading} variant="outline" className="flex items-center gap-1">
            {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
            権限リクエスト
          </Button>
        )}

        {status.supported && status.permission === "granted" && (
          <Button
            onClick={sendTestNotification}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-1"
          >
            {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
            テスト通知送信
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
