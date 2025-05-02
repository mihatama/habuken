"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getClientSupabase } from "@/lib/supabase-utils"
import { Eye, Download, FileText, Search, Plus, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

export function ReportsList() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [projectFilter, setProjectFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const { toast } = useToast()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchReports = async () => {
    try {
      setLoading(true)
      const supabase = getClientSupabase()

      let query = supabase.from("daily_reports").select("*")

      // 検索フィルターを適用
      if (projectFilter) {
        query = query.ilike("custom_project_name", `%${projectFilter}%`)
      }

      if (dateFilter) {
        query = query.eq("report_date", dateFilter)
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) throw error

      setReports(data || [])
    } catch (err: any) {
      console.error("報告データの取得エラー:", err)
      toast({
        title: "エラー",
        description: "報告データの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [projectFilter, dateFilter])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchReports()
  }

  // 検索フィルター
  const filteredReports = reports.filter((report) => {
    if (!searchTerm) return true

    const projectName = report.custom_project_name || ""
    const workDescription = report.work_description || ""
    const reportDate = report.report_date || ""

    const searchLower = searchTerm.toLowerCase()
    return (
      projectName.toLowerCase().includes(searchLower) ||
      workDescription.toLowerCase().includes(searchLower) ||
      reportDate.includes(searchLower)
    )
  })

  // 日付フォーマット関数
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "日付なし"

    try {
      // YYYY-MM-DD形式の日付を処理
      const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateString)
      if (match) {
        return `${match[1]}/${match[2]}/${match[3]}`
      }

      // ISO形式の日付を処理
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "日付エラー"
      }

      return format(date, "yyyy/MM/dd")
    } catch (error) {
      return "日付エラー"
    }
  }

  // 作業内容の短縮表示用
  const getShortenedContent = (content: string) => {
    return content.length > 30 ? content.substring(0, 30) + "..." : content
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="検索..."
              className="pl-8 w-[200px] md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <div className="flex gap-2">
          <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-[180px]" />
          <Button variant="default" onClick={() => (window.location.href = "/reports/new")}>
            <Plus className="mr-2 h-4 w-4" /> 新規作成
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="py-3 px-4 text-left font-medium">種類</th>
                <th className="py-3 px-4 text-left font-medium">工事名</th>
                <th className="py-3 px-4 text-left font-medium">日付</th>
                <th className="py-3 px-4 text-left font-medium">天気</th>
                <th className="py-3 px-4 text-left font-medium">作業内容</th>
                <th className="py-3 px-4 text-center font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center">
                    読み込み中...
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center">
                    報告データがありません
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        日報
                      </div>
                    </td>
                    <td className="py-3 px-4">{report.custom_project_name || "不明な案件"}</td>
                    <td className="py-3 px-4">{formatDate(report.report_date)}</td>
                    <td className="py-3 px-4">{report.weather}</td>
                    <td className="py-3 px-4">
                      {getShortenedContent(report.work_description || report.work_content || "")}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`/reports/${report.id}`} title="詳細を見る">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`/reports/${report.id}/download`} title="ダウンロード">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
