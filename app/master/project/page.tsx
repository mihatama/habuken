import type { Metadata } from "next"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProjectList } from "@/components/project-list"

export const metadata: Metadata = {
  title: "案件管理 | 建設業務管理システム",
  description: "案件の登録、編集、管理を行います",
}

export default function ProjectPage() {
  return (
    <DashboardLayout
      title="案件管理"
      description="案件の登録、編集、スケジュール管理を行います。新規案件の作成や既存案件の更新が可能です。"
      isAdmin={true}
    >
      <div className="flex flex-col space-y-6">
        <ProjectList />
      </div>
    </DashboardLayout>
  )
}
