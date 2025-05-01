import { DailyWorkReportList } from "@/components/daily-work-report-list"

export default function DailyReportsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">作業日報管理</h1>
      <DailyWorkReportList />
    </div>
  )
}
