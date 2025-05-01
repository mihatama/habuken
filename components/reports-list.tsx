"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FileText, Shield, Eye, Check, X, Download, Loader2 } from "lucide-react"
import { getClientSupabase } from "@/lib/supabase-utils"
import { useToast } from "@/components/ui/use-toast"

// レポートの型定義
interface Report {
  id: string
  type: string
  project_name?: string
  deal_id?: string
  custom_project_name?: string
  date: string
  report_date?: string
  work_date?: string
  created_by: string
  submitted_by?: string
  status: string
  created_at: string
}

export function ReportsList() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState({
    type: "all",
    project: "",
    dateFrom: "",
    dateTo: "",
    status: "all",
  })
  const [staffMap, setStaffMap] = useState<Record<string, string>>({})
  const [projectsMap, setProjectsMap] = useState<Record<string, string>>({})
  const { toast } = useToast()

  // データベースからレポートデータを取得
  const fetchReports = async () => {
    try {
      setLoading(true)
      const supabase = getClientSupabase()

      // 日報データを取得
      const { data: dailyReports, error: dailyError } = await supabase
        .from("daily_reports")
        .select("*")
        .order("created_at", { ascending: false })

      if (dailyError) throw dailyError

      // 安全巡視データを取得
      const { data: safetyReports, error: safetyError } = await supabase
        .from("safety_reports")
        .select("*")
        .order("created_at", { ascending: false })

      if (safetyError) {
        // 安全巡視テーブルがない場合はエラーを無視して空の配列を使用
        console.warn("安全巡視テーブルの取得エラー:", safetyError)
      }

      // スタッフデータを取得
      const { data: staffData, error: staffError } = await supabase.from("staff").select("id, full_name")

      if (staffError) throw staffError

      // ユーザーデータを取得
      const { data: userData, error: userError } = await supabase.from("users").select("id, email, full_name")

      if (userError) {
        console.warn("ユーザーデータの取得エラー:", userError)
      }

      // 案件データを取得
      const { data: dealsData, error: dealsError } = await supabase.from("deals").select("id, name")

      if (dealsError) throw dealsError

      // スタッフマップを作成
      const staffMapping: Record<string, string> = {}
      staffData?.forEach((staff) => {
        staffMapping[staff.id] = staff.full_name
      })

      // ユーザーマップを追加
      userData?.forEach((user) => {
        staffMapping[user.id] = user.full_name || user.email
      })

      // 案件マップを作成
      const projectMapping: Record<string, string> = {}
      dealsData?.forEach((deal) => {
        projectMapping[deal.id] = deal.name
      })

      // 日報データを統一形式に変換
      const formattedDailyReports = (dailyReports || []).map((report) => ({
        id: report.id,
        type: "daily",
        project_name: getProjectName(report, projectMapping),
        deal_id: report.deal_id,
        custom_project_name: report.custom_project_name,
        date: report.report_date || report.work_date,
        report_date: report.report_date,
        work_date: report.work_date,
        created_by: report.created_by || report.submitted_by,
        submitted_by: report.submitted_by,
        status: report.status || "pending",
        created_at: report.created_at,
      }))

      // 安全巡視データを統一形式に変換
      const formattedSafetyReports = (safetyReports || []).map((report) => ({
        id: report.id,
        type: "safety",
        project_name: getProjectName(report, projectMapping),
        deal_id: report.deal_id,
        custom_project_name: report.custom_project_name,
        date: report.inspection_date || report.report_date,
        report_date: report.report_date,
        work_date: report.inspection_date,
        created_by: report.created_by || report.submitted_by,
        submitted_by: report.submitted_by,
        status: report.status || "pending",
        created_at: report.created_at,
      }))

      // 両方のレポートを結合して日付順にソート
      const allReports = [...formattedDailyReports, ...formattedSafetyReports].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )

      console.log("取得したレポートデータ:", allReports)
      setReports(allReports)
      setStaffMap(staffMapping)
      setProjectsMap(projectMapping)
    } catch (err: any) {
      console.error("レポートデータの取得エラー:", err)
      setError(err.message || "データの取得に失敗しました")
      toast({
        title: "エラー",
        description: "レポートデータの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // コンポーネントマウント時にデータを取得
  useEffect(() => {
    fetchReports()
  }, [])

  // 案件名の取得ヘルパー関数
  const getProjectName = (report: any, projectsMap: Record<string, string>) => {
    if (report.deal_id && projectsMap[report.deal_id]) {
      return projectsMap[report.deal_id]
    }
    if (report.project_id && projectsMap[report.project_id]) {
      return projectsMap[report.project_id]
    }
    if (report.custom_project_name) {
      return report.custom_project_name
    }
    return "不明な案件"
  }

  // フィルタリングされた報告書リスト
  const filteredReports = reports.filter((report) => {
    // 種類フィルタ
    if (filter.type !== "all" && report.type !== filter.type) return false

    // プロジェクトフィルタ
    if (filter.project && !report.project_name?.includes(filter.project)) return false

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
  const viewReport = (id: string) => {
    console.log(`報告書 ${id} を表示`)
    // ここで実際の表示処理を実装
    alert(`報告書 ${id} を表示します`)
  }

  // 報告書を承認
  const approveReport = async (id: string) => {
    try {
      setLoading(true)
      const supabase = getClientSupabase()

      // 報告書の種類を特定
      const report = reports.find((r) => r.id === id)
      if (!report) throw new Error("報告書が見つかりません")

      const tableName = report.type === "daily" ? "daily_reports" : "safety_reports"

      // ステータスを更新
      const { error } = await supabase.from(tableName).update({ status: "approved" }).eq("id", id)

      if (error) throw error

      toast({
        title: "承認完了",
        description: "報告書を承認しました",
      })

      // データを再取得
      fetchReports()
    } catch (err: any) {
      console.error(`報告書 ${id} の承認エラー:`, err)
      toast({
        title: "エラー",
        description: "報告書の承認に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // 報告書を差戻し
  const rejectReport = async (id: string) => {
    try {
      setLoading(true)
      const supabase = getClientSupabase()

      // 報告書の種類を特定
      const report = reports.find((r) => r.id === id)
      if (!report) throw new Error("報告書が見つかりません")

      const tableName = report.type === "daily" ? "daily_reports" : "safety_reports"

      // ステータスを更新
      const { error } = await supabase.from(tableName).update({ status: "rejected" }).eq("id", id)

      if (error) throw error

      toast({
        title: "差戻し完了",
        description: "報告書を差戻しました",
      })

      // データを再取得
      fetchReports()
    } catch (err: any) {
      console.error(`報告書 ${id} の差戻しエラー:`, err)
      toast({
        title: "エラー",
        description: "報告書の差戻しに失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // 報告書をダウンロード
  const downloadReport = (id: string) => {
    console.log(`報告書 ${id} をダウンロード`)
    // ここで実際のダウンロード処理を実装
    alert(`報告書 ${id} をダウンロードします`)
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-2xl font-bold text-center mb-6">報告一覧</div>
        <div className="p-4 border rounded-md bg-red-50 text-red-700">
          <p>{error}</p>
          <Button onClick={fetchReports} className="mt-4">
            再読み込み
          </Button>
        </div>
      </div>
    )
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    データを読み込み中...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="flex items-center">
                      {getReportTypeIcon(report.type)}
                      <span className="ml-2">{getReportTypeName(report.type)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{report.project_name}</TableCell>
                  <TableCell>
                    {new Date(report.date).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>{staffMap[report.created_by] || "不明"}</TableCell>
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
