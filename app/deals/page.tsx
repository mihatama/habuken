import { Suspense } from "react"
import { DealsList } from "@/components/deals-list"
import { Button } from "@/components/ui/button"
import { Loader2, PlusCircle } from "lucide-react"
import Link from "next/link"

export default function DealsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">案件一覧</h1>
        <Link href="/deals/register">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            新規案件登録
          </Button>
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <DealsList />
      </Suspense>
    </div>
  )
}
