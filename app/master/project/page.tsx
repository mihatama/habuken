import type { Metadata } from "next"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProjectList } from "@/components/project-list"

export const metadata: Metadata = {
  title: "Projects | Project Management SaaS",
  description: "Manage your projects",
}

export default function ProjectPage() {
  return (
    <DashboardLayout title="Projects" isAdmin={true}>
      <div className="flex flex-col space-y-6">
        <p className="text-muted-foreground">Create, view, and manage your projects.</p>
        <ProjectList />
      </div>
    </DashboardLayout>
  )
}
