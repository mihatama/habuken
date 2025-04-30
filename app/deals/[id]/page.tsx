import { Suspense } from "react"
import { DealDetails } from "@/components/deal-details"
import { Loader2 } from "lucide-react"

export default function DealDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense
        fallback={
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <DealDetails id={params.id} />
      </Suspense>
    </div>
  )
}
