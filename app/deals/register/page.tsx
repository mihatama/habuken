import { Suspense } from "react"
import { DealRegistrationForm } from "@/components/deal-registration-form"
import { Loader2 } from "lucide-react"

export default function DealRegistrationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">案件登録</h1>
      <Suspense
        fallback={
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <DealRegistrationForm />
      </Suspense>
    </div>
  )
}
