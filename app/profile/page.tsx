import type { Metadata } from "next"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProfileForm } from "@/components/profile-form"

export const metadata: Metadata = {
  title: "利用者情報 | 工事管理システム",
  description: "利用者情報の設定ができます",
}

export default function ProfilePage() {
  return (
    <DashboardLayout title="利用者情報" isAdmin={true}>
      <div className="flex flex-col space-y-6">
        <p className="text-muted-foreground">個人情報や設定を変更できますよ。</p>
        <ProfileForm />
      </div>
    </DashboardLayout>
  )
}
