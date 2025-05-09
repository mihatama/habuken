"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // エラーをログに記録
    console.error(error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen p-container-padding">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mb-4" />
          <h2 className="text-heading-md font-semibold mb-2">エラーが発生しました</h2>
          <p className="text-body text-muted-foreground mb-4">
            申し訳ありませんが、ページの読み込み中にエラーが発生しました。
          </p>
          <Button onClick={reset}>再試行</Button>
        </CardContent>
      </Card>
    </div>
  )
}
