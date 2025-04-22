import type { Metadata } from "next"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProfileForm } from "@/components/profile-form"

export const metadata: Metadata = {
  title: "Profile | Project Management SaaS",
  description: "Manage your profile settings",
}

export default function ProfilePage() {
  return (
    <DashboardLayout title="Profile" isAdmin={true}>
      <div className="flex flex-col space-y-6">
        <p className="text-muted-foreground">Manage your personal information and preferences.</p>
        <ProfileForm />
      </div>
    </DashboardLayout>
  )
}
