import type { Metadata } from "next"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TaskList } from "@/components/task-list"

export const metadata: Metadata = {
  title: "My Tasks | Project Management SaaS",
  description: "View and manage your assigned tasks",
}

export default function TasksPage() {
  return (
    <DashboardLayout title="My Tasks" isAdmin={false}>
      <div className="flex flex-col space-y-6">
        <p className="text-muted-foreground">View and update your assigned tasks.</p>
        <TaskList />
      </div>
    </DashboardLayout>
  )
}
