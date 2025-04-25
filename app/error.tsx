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
    // エラーをログに記録（リダイレクトエラーは除く）
    if (!isRedirectError(error)) {
      console.error("Application error:", error)
    }
  }, [error])

  // リダイレクトエラーかどうかを判定する関数
  function isRedirectError(error: Error): boolean {
    return error.message === "NEXT_REDIRECT" || error.message.includes("Redirect") || error.message.includes("redirect")
  }

  // リダイレクトエラーの場合は何も表示しない
  if (isRedirectError(error)) {
    // リダイレクトエラーの場合は空のフラグメントを返す
    return <></>
  }

  // 通常のエラー表示
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
