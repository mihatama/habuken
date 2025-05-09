import type { Metadata } from "next"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProjectList } from "@/components/project-list"

export const metadata: Metadata = {
  title: "案件管理 | 工事管理システム",
  description: "案件の登録や編集ができます",
}

export default function ProjectPage() {
  return (
    <DashboardLayout
      title="案件管理"
      description="案件の登録、編集、予定管理ができますよ。新しい案件を作成したり、既存の案件を更新したりできます。"
      isAdmin={true}
    >
      <div className="flex flex-col space-y-6">
        <ProjectList />
      </div>
    </DashboardLayout>
  )
}
