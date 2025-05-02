"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DailyReportFormDialog } from "@/components/daily-report-form-dialog"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { formatDate } from "@/lib/utils"

export function DailyWorkReportList() {
  const [reports, setReports] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    console.log("日報データを取得中...")
    const { data, error } = await supabase.from("daily_reports").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching reports:", error)
      return
    }

    console.log("取得した日報データ:", data)

    // 各レポートのfull_nameフィールドを確認
    data?.forEach((report) => {
      console.log(`レポートID: ${report.id}, full_name: "${report.full_name}"`)
    })

    setReports(data || [])
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">日報一覧</h2>
        <Button onClick={() => setIsDialogOpen(true)}>新規作成</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日付</TableHead>
                <TableHead>タイトル</TableHead>
                <TableHead>報告者</TableHead>
                <TableHead>作業内容</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow
                  key={report.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/reports/${report.id}`)}
                >
                  <TableCell>{formatDate(report.report_date)}</TableCell>
                  <TableCell>{report.custom_project_name || "タイトルなし"}</TableCell>
                  <TableCell>{report.full_name || "不明な報告者"}</TableCell>
                  <TableCell className="truncate max-w-xs">{report.work_description}</TableCell>
                </TableRow>
              ))}
              {reports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    日報がありません
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DailyReportFormDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          console.log("ダイアログの状態が変更されました:", open)
          setIsDialogOpen(open)
        }}
        onSuccess={() => {
          console.log("日報作成成功コールバックが呼び出されました")
          fetchReports()
        }}
      />
    </div>
  )
}
