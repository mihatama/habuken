"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // リダイレクトエラーの場合は処理しない
    if (error.message === "NEXT_REDIRECT" || error.message.includes("Redirect")) {
      console.log("Redirect detected, not treating as error")
      return
    }

    // その他のエラーをログに記録
    console.error("Application error:", error)
  }, [error])

  // リダイレクトエラーの場合は何も表示しない
  if (error.message === "NEXT_REDIRECT" || error.message.includes("Redirect")) {
    return null
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
      <h2 className="mb-4 text-2xl font-bold">エラーが発生しました</h2>
      <p className="mb-6 max-w-md text-muted-foreground">
        申し訳ありませんが、予期しないエラーが発生しました。もう一度お試しいただくか、管理者にお問い合わせください。
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()}>再試行</Button>
        <Button variant="outline" onClick={() => router.push("/")}>
          ホームに戻る
        </Button>
      </div>
    </div>
  )
}
