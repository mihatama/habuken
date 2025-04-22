"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FileText, Shield, Eye, Check, X, Download } from "lucide-react"
import { format } from "date-fns"

// サンプルデータ
const sampleReports = [
  {
    id: 1,
    type: "daily",
    projectName: "東京オフィスビル建設",
    date: "2023-04-15",
    createdBy: "山田太郎",
    status: "pending",
  },
  {
    id: 2,
    type: "safety",
    projectName: "東京オフィスビル建設",
    date: "2023-04-15",
    createdBy: "山田太郎",
    status: "approved",
  },
  {
    id: 3,
    type: "daily",
    projectName: "大阪マンション改修",
    date: "2023-04-14",
    createdBy: "佐藤次郎",
    status: "rejected",
  },
  {
    id: 4,
    type: "safety",
    projectName: "大阪マンション改修",
    date: "2023-04-14",
    createdBy: "佐藤次郎",
    status: "pending",
  },
  {
    id: 5,
    type: "daily",
    projectName: "名古屋工場建設",
    date: "2023-04-13",
    createdBy: "鈴木三郎",
    status: "approved",
  },
]

export function ReportsList() {
  const [filter, setFilter] = useState({
    type: "all",
    project: "",
    dateFrom: "",
    dateTo: "",
    status: "all",
  })

  // フィルタリングされた報告書リスト
  const filteredReports = sampleReports.filter((report) => {
    // 種類フィルタ
    if (filter.type !== "all" && report.type !== filter.type) return false

    // プロジェクトフィルタ
    if (filter.project && !report.projectName.includes(filter.project)) return false

    // 日付フィルタ（開始）
    if (filter.dateFrom && new Date(report.date) < new Date(filter.dateFrom)) return false

    // 日付フィルタ（終了）
    if (filter.dateTo && new Date(report.date) > new Date(filter.dateTo)) return false

    // ステータスフィルタ
    if (filter.status !== "all" && report.status !== filter.status) return false

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

  // 報告書を表示
  const viewReport = (id: number) => {
    console.log(`報告書 ${id} を表示`)
    // ここで実際の表示処理を実装
    alert(`報告書 ${id} を表示します`)
  }

  // 報告書を承認
  const approveReport = (id: number) => {
    console.log(`報告書 ${id} を承認`)
    // ここで実際の承認処理を実装
    alert(`報告書 ${id} を承認しました`)
  }

  // 報告書を差戻し
  const rejectReport = (id: number) => {
    console.log(`報告書 ${id} を差戻し`)
    // ここで実際の差戻し処理を実装
    alert(`報告書 ${id} を差戻しました`)
  }

  // 報告書をダウンロード
  const downloadReport = (id: number) => {
    console.log(`報告書 ${id} をダウンロード`)
    // ここで実際のダウンロード処理を実装
    alert(`報告書 ${id} をダウンロードします`)
  }

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
          <Input
            value={filter.project}
            onChange={(e) => setFilter({ ...filter, project: e.target.value })}
            placeholder="工事名で検索"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">ステータス</label>
          <Select value={filter.status} onValueChange={(value) => setFilter({ ...filter, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="pending">承認待ち</SelectItem>
              <SelectItem value="approved">承認済</SelectItem>
              <SelectItem value="rejected">差戻し</SelectItem>
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
              <TableHead>ステータス</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="flex items-center">
                      {getReportTypeIcon(report.type)}
                      <span className="ml-2">{getReportTypeName(report.type)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{report.projectName}</TableCell>
                  <TableCell>{format(new Date(report.date), "yyyy/MM/dd")}</TableCell>
                  <TableCell>{report.createdBy}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => viewReport(report.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {report.status === "pending" && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => approveReport(report.id)}>
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => rejectReport(report.id)}>
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => downloadReport(report.id)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
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
