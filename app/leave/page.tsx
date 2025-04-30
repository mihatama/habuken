import type { Metadata } from "next"
import { DashboardLayout } from "../../components/dashboard-layout"
import { LeaveRequestManagement } from "../../components/leave-request-management"

export const metadata: Metadata = {
  title: "休暇申請 | 建設業務管理システム",
  description: "休暇の申請と管理を行います",
}

export default function LeavePage() {
  return (
    <DashboardLayout
      title="休暇申請"
      description="休暇の申請と管理を行います。年次有給休暇や特別休暇の申請状況を確認できます。"
      isAdmin={false}
    >
      <div className="flex flex-col space-y-6">
        <LeaveRequestManagement />
      </div>
    </DashboardLayout>
  )
}
