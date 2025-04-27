import { HeavyMachineryManagement } from "@/components/heavy-machinery-management"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function HeavyMachineryPage() {
  return (
    <DashboardLayout title="重機管理" description="重機の登録、編集、削除を行います。">
      <HeavyMachineryManagement />
    </DashboardLayout>
  )
}
