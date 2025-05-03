import { Suspense } from "react"
import type { Metadata } from "next"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardClient } from "./dashboard-client"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "ダッシュボード | 工事管理システム",
  description: "プロジェクト状況、リソース稼働率、コスト分析などを一目で確認できるダッシュボード",
}

export default function DashboardPage() {
  return (
    <DashboardLayout
      title="ダッシュボード"
      description="プロジェクト状況、リソース稼働率、コスト分析などを一目で確認できます"
    >
      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[120px] rounded-xl" />
            ))}
            <Skeleton className="col-span-full h-[300px] rounded-xl" />
            <Skeleton className="col-span-full md:col-span-2 h-[300px] rounded-xl" />
            <Skeleton className="col-span-full md:col-span-2 h-[300px] rounded-xl" />
          </div>
        }
      >
        <DashboardClient />
      </Suspense>
    </DashboardLayout>
  )
}
