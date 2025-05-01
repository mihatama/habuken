"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DailyReportFormDialog } from "./daily-report-form-dialog"
import { getClientSupabase } from "@/lib/supabase-utils"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { ImageIcon, FileText, Calendar, Clock, CloudSun, Search } from "lucide-react"

export function DailyWorkReportList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [staffMap, setStaffMap] = useState<Record<string, string>>({})
  const [dealsMap, setDealsMap] = useState<Record<string, string>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("all") // "all", "pending", "approved"

  const fetchReports = async () => {
    try {
      setLoading(true)
      const supabase = getClientSupabase()

      // 日報データを取得
      const { data: reportsData, error: reportsError } = await supabase
        .from("daily_reports")
        .select("*")
        .order("created_at", { ascending: false })

      if (reportsError) throw reportsError

      // デバッグ用ログを追加
      console.log("取得した日報データの件数:", reportsData?.length || 0)
      console.log("最新の日報データ:", reportsData?.[0])

      // スタッフデータを取得
      const { data: staffData, error: staffError } = await supabase.from("staff").select("id, full_name")

      if (staffError) throw staffError

      // 案件データを取得
      const { data: dealsData, error: dealsError } = await supabase.from("deals").select("id, name")

      if (dealsError) throw dealsError

      // ユーザーデータを取得
      const { data: userData, error: userError } = await supabase.from("users").select("id, email, full_name")

      if (userError) {
        console.warn("ユーザーデータの取得に失敗しました:", userError)
        // ユーザーデータの取得に失敗しても処理を続行
      }

      // スタッフIDと名前のマッピングを作成
      const staffMapping: Record<string, string> = {}
      staffData?.forEach((staff) => {
        staffMapping[staff.id] = staff.full_name
      })

      // ユーザーIDと名前のマッピングを作成
      userData?.forEach((user) => {
        staffMapping[user.id] = user.full_name || user.email
      })

      // 案件IDと名前のマッピングを作成
      const dealsMapping: Record<string, string> = {}
      dealsData?.forEach((deal) => {
        dealsMapping[deal.id] = deal.name
      })

      console.log("取得した日報データ:", reportsData)
      setReports(reportsData || [])
      setStaffMap(staffMapping)
      setDealsMap(dealsMapping)
    } catch (err: any) {
      console.error("日報データの取得エラー:", err)
      setError(err.message || "データの取得に失敗しました")
      toast({
        title: "エラー",
        description: "日報データの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [toast])

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case "sunny":
        return "☀️"
      case "cloudy":
        return "☁️"
      case "rainy":
        return "🌧️"
      case "snowy":
        return "❄️"
      case "windy":
        return "💨"
      default:
        return "☀️"
    }
  }

  const getWeatherText = (weather: string) => {
    switch (weather) {
      case "sunny":
        return "晴れ"
      case "cloudy":
        return "曇り"
      case "rainy":
        return "雨"
      case "snowy":
        return "雪"
      case "windy":
        return "強風"
      default:
        return weather
    }
  }

  // 検索フィルター
  const filteredReports = reports.filter((report) => {
    // まずタブによるフィルタリング
    if (activeTab === "pending" && report.status !== "pending") return false
    if (activeTab === "approved" && report.status !== "approved") return false

    // 次に検索語によるフィルタリング
    const projectName = getProjectName(report, dealsMap)
    const reporterName = getReporterName(report, staffMap)
    const workDescription = report.work_description || report.work_content || ""

    const searchLower = searchTerm.toLowerCase()
    return (
      projectName.toLowerCase().includes(searchLower) ||
      reporterName.toLowerCase().includes(searchLower) ||
      workDescription.toLowerCase().includes(searchLower)
    )
  })

  // 案件名の取得ヘルパー関数
  const getProjectName = (report: any, dealsMap: Record<string, string>) => {
    if (report.deal_id && dealsMap[report.deal_id]) {
      return dealsMap[report.deal_id]
    }
    if (report.project_id && dealsMap[report.project_id]) {
      return dealsMap[report.project_id]
    }
    if (report.custom_project_name) {
      return report.custom_project_name
    }
    return "不明な案件"
  }

  // 報告者名の取得ヘルパー関数
  const getReporterName = (report: any, staffMap: Record<string, string>) => {
    const reporterId = report.submitted_by || report.created_by
    if (reporterId && staffMap[reporterId]) {
      return staffMap[reporterId]
    }
    return "不明なスタッフ"
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>エラー</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchReports} className="mt-4">
            再読み込み
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>作業日報一覧</CardTitle>
            <CardDescription>現場の作業日報を確認・管理できます</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="検索..."
                className="pl-8 w-[200px] md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>新規作成</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Button variant={activeTab === "all" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("all")}>
              すべて
            </Button>
            <Button
              variant={activeTab === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("pending")}
            >
              承認待ち
            </Button>
            <Button
              variant={activeTab === "approved" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("approved")}
            >
              承認済
            </Button>
          </div>
          {loading ? (
            <div className="text-center py-8">読み込み中...</div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8">
              {searchTerm ? "検索条件に一致する日報はありません" : "日報データがありません"}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  staffMap={staffMap}
                  dealsMap={dealsMap}
                  getWeatherIcon={getWeatherIcon}
                  getWeatherText={getWeatherText}
                  getProjectName={getProjectName}
                  getReporterName={getReporterName}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DailyReportFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {
          console.log("日報追加成功後のデータ再取得を実行します")
          fetchReports()
        }}
      />
    </>
  )
}

interface ReportCardProps {
  report: any
  staffMap: Record<string, string>
  dealsMap: Record<string, string>
  getWeatherIcon: (weather: string) => string
  getWeatherText: (weather: string) => string
  getProjectName: (report: any, dealsMap: Record<string, string>) => string
  getReporterName: (report: any, staffMap: Record<string, string>) => string
}

function ReportCard({
  report,
  staffMap,
  dealsMap,
  getWeatherIcon,
  getWeatherText,
  getProjectName,
  getReporterName,
}: ReportCardProps) {
  const [showPhotos, setShowPhotos] = useState(false)

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy年MM月dd日(E)", { locale: ja })
    } catch (e) {
      return dateString
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{getProjectName(report, dealsMap)}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1 flex-wrap">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(report.report_date || report.work_date)}
              <span className="mx-1">|</span>
              <CloudSun className="h-3.5 w-3.5" />
              {getWeatherIcon(report.weather)} {getWeatherText(report.weather)}
              {report.start_time && report.end_time && (
                <>
                  <span className="mx-1">|</span>
                  <Clock className="h-3.5 w-3.5" />
                  {report.start_time.substring(0, 5)} 〜 {report.end_time.substring(0, 5)}
                </>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm text-muted-foreground mb-2">
          <span className="font-medium">報告者:</span> {getReporterName(report, staffMap)}
        </div>
        <div className="text-sm whitespace-pre-wrap">{report.work_description || report.work_content}</div>

        {report.photo_urls && report.photo_urls.length > 0 && (
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-xs"
              onClick={() => setShowPhotos(!showPhotos)}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              写真 ({report.photo_urls.length}枚)
              {showPhotos ? " 非表示" : " 表示"}
            </Button>

            {showPhotos && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {report.photo_urls.map((url: string, index: number) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded border border-gray-200"
                  >
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`現場写真 ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          {format(new Date(report.created_at), "yyyy/MM/dd HH:mm")} 作成
        </div>
      </CardFooter>
    </Card>
  )
}
