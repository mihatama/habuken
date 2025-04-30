import { getServerSupabase } from "@/lib/supabase-utils"
import { DealDetails } from "@/components/deal-details"
import { DealPeriodManagement } from "@/components/deal-period-management"
import { notFound } from "next/navigation"

interface DealPageProps {
  params: {
    id: string
  }
}

export default async function DealPage({ params }: DealPageProps) {
  const { id } = params
  const supabase = getServerSupabase()

  // 案件データの取得
  const { data: deal, error } = await supabase.from("deals").select("*").eq("id", id).single()

  if (error || !deal) {
    notFound()
  }

  return (
    <div className="container py-6 space-y-6">
      <DealDetails deal={deal} />
      <DealPeriodManagement dealId={id} />
    </div>
  )
}
