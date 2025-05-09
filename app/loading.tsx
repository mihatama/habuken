import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-container-padding">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-space-4" />
      <p className="text-body text-muted-foreground">読み込み中...</p>
    </div>
  )
}
