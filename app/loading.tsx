import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen p-container-padding">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
        <h2 className="text-heading-md font-semibold">読み込み中...</h2>
        <p className="text-body text-muted-foreground mt-2">データを取得しています。しばらくお待ちください。</p>
      </div>
    </div>
  )
}
