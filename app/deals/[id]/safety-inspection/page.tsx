import { DealSafetyInspectionForm } from "@/components/deal-safety-inspection-form"

export default function DealSafetyInspectionPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <DealSafetyInspectionForm dealId={params.id} />
    </div>
  )
}
