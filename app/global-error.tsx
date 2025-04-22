"use client"

import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
          <h2 className="mb-4 text-2xl font-bold">致命的なエラーが発生しました</h2>
          <p className="mb-6 max-w-md text-muted-foreground">
            申し訳ありませんが、アプリケーションで致命的なエラーが発生しました。
          </p>
          <Button onClick={() => reset()}>再試行</Button>
        </div>
      </body>
    </html>
  )
}
