import { Suspense } from "react"
import { DealsTabs } from "@/components/deals-tabs"
import { Loader2 } from "lucide-react"
import { DealResourceCalendar } from "@/components/deal-resource-calendar"

export default function DealsCalendarPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">案件管理</h1>

      <DealsTabs />

      <Suspense
        fallback={
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <DealResourceCalendar />
      </Suspense>
    </div>
  )
}
