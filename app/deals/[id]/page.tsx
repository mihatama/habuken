import { Suspense } from "react"
import { DealDetails } from "@/components/deal-details"
import { Loader2 } from "lucide-react"
import { notFound } from "next/navigation"

// Helper function to validate UUID format
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export default function DealDetailsPage({ params }: { params: { id: string } }) {
  // If the ID is not a valid UUID, show the not found page
  if (!isValidUUID(params.id)) {
    notFound()
  }

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
