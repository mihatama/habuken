import type { Metadata } from "next"
import { DashboardLayout } from "@/components/dashboard-layout"
import { SettingsTabs } from "@/components/settings-tabs"

export const metadata: Metadata = {
  title: "Settings | Project Management SaaS",
  description: "Manage system settings",
}

export default function SettingsPage() {
  return (
    <DashboardLayout title="Settings" isAdmin={true}>
      <div className="flex flex-col space-y-6">
        <p className="text-muted-foreground">Configure system settings, manage users, and customize notifications.</p>
        <SettingsTabs />
      </div>
    </DashboardLayout>
  )
}
