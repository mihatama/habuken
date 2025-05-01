import { DealsTabs } from "@/components/deals-tabs"
import { DealRegistrationForm } from "@/components/deal-registration-form"

export const metadata = {
  title: "案件登録",
  description: "新規案件登録",
}

export default function DealRegistrationPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">案件管理</h1>

      <DealsTabs />

      <DealRegistrationForm />
    </div>
  )
}
