import type { Metadata } from "next"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ResourceList } from "@/components/resource-list"

export const metadata: Metadata = {
  title: "Resources | Project Management SaaS",
  description: "Manage your resources and equipment",
}

export default function ResourcePage() {
  return (
    <DashboardLayout title="Resources" isAdmin={true}>
      <div className="flex flex-col space-y-6">
        <p className="text-muted-foreground">Create, view, and manage your resources and equipment.</p>
        <ResourceList />
      </div>
    </DashboardLayout>
  )
}
