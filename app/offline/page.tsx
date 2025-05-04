"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { WifiOff, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function OfflinePage() {
  return (
    <div className="container flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-gray-100 dark:bg-gray-800 p-3 rounded-full w-16 h-16 flex items-center justify-center">
            <WifiOff className="h-8 w-8 text-gray-500" />
          </div>
          <CardTitle className="text-xl">インターネット接続がありません</CardTitle>
          <CardDescription>現在オフラインモードで表示しています。一部の機能が制限されています。</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            インターネット接続が回復したら、自動的に通常モードに戻ります。
            または、下のボタンをクリックして再読み込みしてください。
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.reload()
              }
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            再読み込み
          </Button>
          <Button asChild>
            <Link href="/">ホームに戻る</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
