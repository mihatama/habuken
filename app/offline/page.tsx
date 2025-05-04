"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { WifiOff, RefreshCw } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full w-16 h-16 flex items-center justify-center">
            <WifiOff className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-2xl">インターネット接続がありません</CardTitle>
          <CardDescription>オフラインモードで利用できる機能は限られています</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            インターネット接続が回復するまで、以下のことをお試しください：
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>Wi-Fi接続を確認する</li>
            <li>モバイルデータ通信が有効になっているか確認する</li>
            <li>機内モードがオフになっているか確認する</li>
            <li>デバイスを再起動する</li>
          </ul>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            接続が回復したら、下のボタンをクリックしてページを更新してください。
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => window.location.reload()} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            再読み込み
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
