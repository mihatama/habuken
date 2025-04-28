"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Shield, Eye, Download, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSupabaseClient } from "@/hooks/use-supabase-query"

type ReportFilter = {
  type: string
  project: string
  dateFrom: string
  dateTo: string
}

export function ReportsList() {
  const supabase = useSupabaseClient()
  const [filter, setFilter] = useState<ReportFilter>({
    type: "all",
    project: "all", // Changed from empty string to "all"
    dateFrom: "",
    dateTo: "",
  })

  // 日報データを取得するクエリ
  const { data: dailyReports = [], isLoading: isDailyReportsLoading } = useQuery({
    queryKey: ["daily_reports"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("daily_reports")
          .select("*, project_id, projects(name), submitted_by")
          .order("report_date", { ascending: false })

        if (error) throw error

        // 日報データを共通フォーマットに変換
        return (data || []).map((report) => ({
          id: report.id,
          type: "daily",
          title: `日報: ${report.projects?.name || "不明"} - ${new Date(report.report_date).toLocaleDateString("ja-JP")}`,
          project_id: report.project_id,
          project_name: report.projects?.name || "不明",
          date: report.report_date,
          created_by: report.submitted_by,
          created_at: report.created_at,
          content: report.work_description,
        }))
      } catch (error) {
        console.error("日報取得エラー:", error)
        return []
      }
    },
  })

  // 安全巡視データを取得するクエリ
  const { data: safetyReports = [], isLoading: isSafetyReportsLoading } = useQuery({
    queryKey: ["safety_inspections"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("safety_inspections")
          .select("*, project_id, projects(name)")
          .order("inspection_date", { ascending: false })

        if (error) throw error

        // 安全巡視データを共通フォーマットに変換
        return (data || []).map((report) => ({
          id: report.id,
          type: "safety",
          title: `安全巡視: ${report.projects?.name || "不明"} - ${new Date(report.inspection_date).toLocaleDateString("ja-JP")}`,
          project_id: report.project_id,
          project_name: report.projects?.name || "不明",
          date: report.inspection_date,
          created_by: report.inspector,
          created_at: report.created_at,
          content: report.findings,
          status: report.status,
        }))
      } catch (error) {
        console.error("安全巡視取得エラー:", error)
        return []
      }
    },
  })

  // プロジェクトデータを取得するクエリ（フィルター用）
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("projects").select("id, name").order("name")

        if (error) throw error
        return data || []
      } catch (error) {
        console.error("プロジェクト取得エラー:", error)
        return []
      }
    },
  })

  // 両方のレポートを結合
  const allReports = [...dailyReports, ...safetyReports]

  // フィルタリングされた報告書リスト
  const filteredReports = allReports.filter((report) => {
    // 種類フィルタ
    if (filter.type !== "all" && report.type !== filter.type) return false

    // プロジェクトフィルタ
    if (filter.project !== "all" && report.project_id !== filter.project) return false // Changed from empty string check to "all" check

    // 日付フィルタ（開始）
    if (filter.dateFrom && new Date(report.date) < new Date(filter.dateFrom)) return false

    // 日付フィルタ（終了）
    if (filter.dateTo && new Date(report.date) > new Date(filter.dateTo)) return false

    return true
  })

  // 報告書の種類に応じたアイコンを取得
  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case "daily":
        return <FileText className="h-4 w-4" />
      case "safety":
        return <Shield className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // 報告書の種類に応じた名前を取得
  const getReportTypeName = (type: string) => {
    switch (type) {
      case "daily":
        return "作業日報"
      case "safety":
        return "安全巡視"
      default:
        return "不明"
    }
  }

  // ステータスに応じたバッジを取得
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            承認待ち
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            承認済
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            差戻し
          </Badge>
        )
      default:
        return <Badge variant="outline">不明</Badge>
    }
  }

  // 日付をフォーマットする関数
  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  // 報告書を表示
  const viewReport = (id: string, type: string) => {
    console.log(`報告書 ${id} (${type}) を表示`)
    // ここで実際の表示処理を実装
    alert(`報告書 ${id} (${type}) を表示します`)
  }

  // 報告書をダウンロード
  const downloadReport = (id: string, type: string) => {
    console.log(`報告書 ${id} (${type}) をダウンロード`)
    // ここで実際のダウンロード処理を実装
    alert(`報告書 ${id} (${type}) をダウンロードします`)
  }

  const isLoading = isDailyReportsLoading || isSafetyReportsLoading

  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold text-center mb-6">報告一覧</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">報告種類</label>
          <Select value={filter.type} onValueChange={(value) => setFilter({ ...filter, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="daily">作業日報</SelectItem>
              <SelectItem value="safety">安全巡視</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">工事名</label>
          <Select value={filter.project} onValueChange={(value) => setFilter({ ...filter, project: value })}>
            <SelectTrigger>
              <SelectValue placeholder="すべてのプロジェクト" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのプロジェクト</SelectItem> {/* Changed from empty string to "all" */}
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">日付（開始）</label>
          <Input
            type="date"
            value={filter.dateFrom}
            onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">日付（終了）</label>
          <Input type="date" value={filter.dateTo} onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })} />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>種類</TableHead>
              <TableHead>工事名</TableHead>
              <TableHead>日付</TableHead>
              <TableHead>作成者</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <TableRow key={`${report.type}-${report.id}`}>
                  <TableCell>
                    <div className="flex items-center">
                      {getReportTypeIcon(report.type)}
                      <span className="ml-2">{getReportTypeName(report.type)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{report.project_name}</TableCell>
                  <TableCell>{formatDate(report.date)}</TableCell>
                  <TableCell>{report.created_by}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => viewReport(report.id, report.type)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => downloadReport(report.id, report.type)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  該当する報告書がありません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
