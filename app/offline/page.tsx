"use client"

import { Button } from "@/components/ui/button"
import { WifiOff, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <WifiOff className="h-16 w-16 text-gray-400 mb-6" />
      <h1 className="text-3xl font-bold mb-2">オフラインです</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
        インターネット接続がありません。一部の機能は引き続き使用できますが、最新のデータを取得するにはネットワーク接続が必要です。
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => window.location.reload()} className="flex items-center">
          <RefreshCw className="h-4 w-4 mr-2" />
          再読み込み
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">ダッシュボードへ</Link>
        </Button>
      </div>
    </div>
  )
}
