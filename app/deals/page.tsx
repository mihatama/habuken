import { Suspense } from "react"
import { DealsList } from "@/components/deals-list"
import { DealRegistrationModal } from "@/components/deal-registration-modal"
import { Loader2 } from "lucide-react"

export default function DealsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">案件一覧</h1>
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
