import { DealsTabs } from "@/components/deals-tabs"
import { EnhancedDealsList } from "@/components/enhanced-deals-list"

export const metadata = {
  title: "現場管理",
  description: "現場リスト",
}

export default function DealsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">現場管理</h1>

      <DealsTabs />

      <div className="flex items-center justify-between mb-6">
        <div className="relative w-full max-w-sm">
          <input type="text" placeholder="検索..." className="w-full px-4 py-2 border rounded-md" />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2">🔍</span>
        </div>
        <button className="ml-4 p-2 rounded-full bg-muted">
          <span>🔄</span>
        </button>
      </div>

      <EnhancedDealsList />
    </div>
  )
}
