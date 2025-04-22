import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
      <h2 className="mb-4 text-2xl font-bold">ページが見つかりません</h2>
      <p className="mb-6 max-w-md text-muted-foreground">お探しのページは存在しないか、移動された可能性があります。</p>
      <Button asChild>
        <Link href="/">ホームに戻る</Link>
      </Button>
    </div>
  )
}
