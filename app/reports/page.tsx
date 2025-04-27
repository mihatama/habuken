import type { Metadata } from "next"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ReportsList } from "@/components/reports-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DailyWorkReport } from "@/components/daily-work-report"
import { SafetyPatrolLog } from "@/components/safety-patrol-log"

export const metadata: Metadata = {
  title: "現場報告 | 建設業務管理システム",
  description: "日報や安全パトロール記録などの現場報告を管理します",
}

export default function ReportsPage() {
  return (
    <DashboardLayout
      title="現場報告"
      description="日報や安全パトロール記録などの現場報告を管理します。報告書の作成や閲覧ができます。"
      isAdmin={false}
    >
      <div className="flex flex-col space-y-6">
        <Tabs defaultValue="list" className="mb-6">
          <TabsList>
            <TabsTrigger value="list">報告一覧</TabsTrigger>
            <TabsTrigger value="daily">日報作成</TabsTrigger>
            <TabsTrigger value="safety">安全パトロール</TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="mt-4">
            <ReportsList />
          </TabsContent>
          <TabsContent value="daily" className="mt-4">
            <DailyWorkReport />
          </TabsContent>
          <TabsContent value="safety" className="mt-4">
            <SafetyPatrolLog />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
