import type { Metadata } from "next"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TaskList } from "@/components/task-list"

export const metadata: Metadata = {
  title: "わたしの作業 | 工事管理システム",
  description: "担当している作業を確認できます",
}

export default function TasksPage() {
  return (
    <DashboardLayout title="わたしの作業" isAdmin={false}>
      <div className="flex flex-col space-y-6">
        <p className="text-muted-foreground">担当している作業を確認して更新してくださいね。</p>
        <TaskList />
      </div>
    </DashboardLayout>
  )
}
