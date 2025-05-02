import { Suspense } from "react"
import { DashboardClientPage } from "./DashboardClientPage"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-6">ダッシュボード</h1>
      <Suspense
        fallback={
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <DashboardClientPage />
      </Suspense>
    </div>
  )
}
