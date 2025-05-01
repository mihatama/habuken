import { Suspense } from "react"
import { DealsList } from "@/components/deals-list"
import { DealRegistrationModal } from "@/components/deal-registration-modal"
import { Loader2, Search } from "lucide-react"
import { DealsTabs } from "@/components/deals-tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function DealsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">案件管理</h1>

      <DealsTabs />

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="検索..." className="pl-9" />
        </div>
        <Button variant="outline" size="icon" className="shrink-0">
          <Search className="h-4 w-4" />
          <span className="sr-only">検索</span>
        </Button>
        <DealRegistrationModal />
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
