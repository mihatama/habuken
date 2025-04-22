import type { Metadata } from "next"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StaffList } from "@/components/staff-list"

export const metadata: Metadata = {
  title: "Staff | Project Management SaaS",
  description: "Manage your staff members",
}

export default function StaffPage() {
  return (
    <DashboardLayout title="Staff" isAdmin={true}>
      <div className="flex flex-col space-y-6">
        <p className="text-muted-foreground">Create, view, and manage your staff members.</p>
        <StaffList />
      </div>
    </DashboardLayout>
  )
}
