import { DealDailyReportForm } from "@/components/deal-daily-report-form"

export default function DealDailyReportPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <DealDailyReportForm dealId={params.id} />
    </div>
  )
}
