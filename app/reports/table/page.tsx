import { DailyReportsTable } from "@/components/daily-reports-table"

export default function DailyReportsTablePage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">日報データテーブル</h1>
      <DailyReportsTable />
    </div>
  )
}
