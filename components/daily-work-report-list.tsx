"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DailyReportFormDialog } from "./daily-report-form-dialog"
import { getClientSupabase } from "@/lib/supabase-utils"
import { useToast } from "@/components/ui/use-toast"
import { ImageIcon, FileText, Calendar, Clock, CloudSun, Search, RefreshCw, Filter } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DailyReportDetail } from "@/components/daily-report-detail"

// 日付フォーマット関数
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "日付なし"

  try {
    // YYYY-MM-DD形式の日付を処理
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateString)
    if (match) {
      const year = match[1]
      const month = match[2]
      const day = match[3]
      return `${year}年${month}月${day}日`
    }

    // ISO形式の日付を処理
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString)
      return "日付エラー"
    }

    return `${date.getFullYear()}年${(date.getMonth() + 1).toString().padStart(2, "0")}月${date.getDate().toString().padStart(2, "0")}日`
  } catch (error) {
    console.error("Date formatting error:", error)
    return "日付エラー"
  }
}

// 報告者情報をデバッグする関数
const debugReporterInfo = (report: any) => {
  console.group(`日報ID: ${report.id}の報告者情報`)
  console.log("staff_id:", report.staff_id)
  console.log("user_id:", report.user_id)
  console.log("submitted_by:", report.submitted_by)
  console.log("created_by:", report.created_by)
  console.log("custom_reporter_name:", report.custom_reporter_name)
  console.log("workers:", report.workers)
  console.groupEnd()
}

export function DailyWorkReportList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [staffMap, setStaffMap] = useState<Record<string, string>>({})
  const [dealsMap, setDealsMap] = useState<Record<string, string>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const [sortBy, setSortBy] = useState("newest") // "newest", "oldest"
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [formattedReports, setFormattedReports] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)

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

  // 現在のユーザー情報を取得
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const supabase = getClientSupabase()
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("セッション取得エラー:", error)
          return
        }

        if (data.session?.user) {
          setCurrentUser(data.session.user)
          // 現在のユーザーをスタッフマップに追加
          setStaffMap((prev) => ({
            ...prev,
            [data.session.user.id]: data.session.user.email || "現在のユーザー",
          }))
        }
      } catch (err) {
        console.error("ユーザー情報取得エラー:", err)
      }
    }

    getCurrentUser()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const supabase = getClientSupabase()

      // 日報データを取得
      const { data: reportsData, error: reportsError } = await supabase
        .from("daily_reports")
        .select("*")
        .order("created_at", { ascending: sortBy === "oldest" })

      if (reportsError) {
        console.error("日報データの取得エラー:", reportsError)
        throw reportsError
      }

      console.log(`取得した日報データ: ${reportsData?.length || 0}件`)
      setReports(reportsData || [])

      // 案件データを取得
      const { data: dealsData, error: dealsError } = await supabase.from("deals").select("id, name")

      if (dealsError) throw dealsError

      // 案件IDと名前のマッピングを作成
      const dealsMapping: Record<string, string> = {}
      dealsData?.forEach((deal) => {
        dealsMapping[deal.id] = deal.name
      })
      setDealsMap(dealsMapping)

      // スタッフデータを取得
      const { data: staffData, error: staffError } = await supabase
        .from("staff")
        .select("id, full_name, user_id")
        .order("full_name")

      console.log("取得したスタッフデータ:", staffData, staffError)

      // スタッフマップを作成
      const staffMapping = {}
      if (!staffError && staffData && staffData.length > 0) {
        // スタッフデータをマッピング（user_idとidの両方をキーとして使用）
        staffData.forEach((staff) => {
          if (staff.id) staffMapping[staff.id] = staff.full_name
          if (staff.user_id) staffMapping[staff.user_id] = staff.full_name
        })
      }

      // プロフィールテーブルがあれば、そこからもユーザー情報を取得
      try {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, email")

        if (!profilesError && profilesData && profilesData.length > 0) {
          profilesData.forEach((profile) => {
            if (profile.id) {
              staffMapping[profile.id] = profile.full_name || profile.email || "プロフィールユーザー"
            }
          })
        }
      } catch (profileErr) {
        console.log("プロフィールデータ取得試行:", profileErr)
        // プロフィールテーブルがない場合はエラーを無視
      }

      console.log("作成されたスタッフマッピング:", staffMapping)
      setStaffMap((prev) => ({ ...prev, ...staffMapping }))

      // スタッフIDとユーザーIDのリストを作成
      const staffIds = [...new Set(reportsData.map((report: any) => report.staff_id).filter(Boolean))]

      console.log("取得する必要があるスタッフID:", staffIds)

      // スタッフデータを取得（IDが一致するものだけ）
      if (staffIds.length > 0) {
        const { data: specificStaffData, error: specificStaffError } = await supabase
          .from("staff")
          .select("id, full_name, user_id")
          .in("id", staffIds)

        if (specificStaffError) {
          console.error("特定のスタッフデータ取得エラー:", specificStaffError)
        } else {
          console.log("特定のスタッフデータ取得成功:", specificStaffData)
          specificStaffData?.forEach((staff: any) => {
            setStaffMap((prev) => ({ ...prev, [staff.id]: staff.full_name }))
          })
        }
      }

      // データを整形
      const formattedData =
        reportsData?.map((report) => {
          // デバッグ情報を出力
          debugReporterInfo(report)

          // 報告者名を決定
          let reporterName = null

          // 1. カスタム報告者名があればそれを使用
          if (report.custom_reporter_name) {
            reporterName = report.custom_reporter_name
            console.log(`日報 ${report.id}: カスタム報告者名を使用 - ${reporterName}`)
          }
          // 2. staff_idがあり、マッピングに存在すればそれを使用
          else if (report.staff_id && staffMap[report.staff_id]) {
            reporterName = staffMap[report.staff_id]
            console.log(`日報 ${report.id}: staff_id ${report.staff_id} から報告者名を取得 - ${reporterName}`)
          }
          // 3. user_idがあり、マッピングに存在すればそれを使用
          else if (report.user_id && staffMap[report.user_id]) {
            reporterName = staffMap[report.user_id]
            console.log(`日報 ${report.id}: user_id ${report.user_id} から報告者名を取得 - ${reporterName}`)
          }
          // 4. submitted_byがあり、マッピングに存在すればそれを使用
          else if (report.submitted_by && staffMap[report.submitted_by]) {
            reporterName = staffMap[report.submitted_by]
            console.log(`日報 ${report.id}: submitted_by ${report.submitted_by} から報告者名を取得 - ${reporterName}`)
          }
          // 5. created_byがあり、マッピングに存在すればそれを使用
          else if (report.created_by && staffMap[report.created_by]) {
            reporterName = staffMap[report.created_by]
            console.log(`日報 ${report.id}: created_by ${report.created_by} から報告者名を取得 - ${reporterName}`)
          }
          // 6. workersから取得を試みる
          else if (
            report.workers &&
            Array.isArray(report.workers) &&
            report.workers.length > 0 &&
            report.workers[0].name
          ) {
            reporterName = report.workers[0].name
            console.log(`日報 ${report.id}: workers[0].name から報告者名を取得 - ${reporterName}`)
          }
          // 7. full_nameフィールドがあれば使用
          else if (report.full_name) {
            reporterName = report.full_name
            console.log(`日報 ${report.id}: full_name から報告者名を取得 - ${reporterName}`)
          } else {
            reporterName = "不明な報告者"
            console.log(
              `日報 ${report.id}: 報告者名を特定できませんでした - staff_id: ${report.staff_id}, user_id: ${report.user_id}, submitted_by: ${report.submitted_by}, created_by: ${report.created_by}`,
            )
          }

          return {
            ...report,
            projectName: getProjectName(report, dealsMapping),
            reporterName: reporterName,
          }
        }) || []

      setFormattedReports(formattedData)
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
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [toast, sortBy])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchReports()
  }

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
  const filteredReports = formattedReports.filter((report) => {
    // 検索語によるフィルタリング
    const projectName = report.projectName || ""
    const reporterName = report.reporterName || ""
    const workDescription = report.work_description || report.work_content || ""
    const reportDate = report.report_date || ""

    const searchLower = searchTerm.toLowerCase()
    return (
      projectName.toLowerCase().includes(searchLower) ||
      reporterName.toLowerCase().includes(searchLower) ||
      workDescription.toLowerCase().includes(searchLower) ||
      reportDate.includes(searchLower)
    )
  })

  // 現在のユーザーIDを取得
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const checkCurrentUser = async () => {
      const supabase = getClientSupabase()
      const { data } = await supabase.auth.getSession()
      if (data.session?.user) {
        setCurrentUserId(data.session.user.id)
      }
    }

    checkCurrentUser()
  }, [])

  // 自分の日報かどうかを判定
  const isOwnReport = (report: any) => {
    return currentUserId && (report.created_by === currentUserId || report.submitted_by === currentUserId)
  }

  // 詳細を表示する関数
  const showDetails = (report: any) => {
    setSelectedReport(report)
    setDetailsOpen(true)
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
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle>作業日報一覧</CardTitle>
            <CardDescription>現場の作業日報を確認・管理できます</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="検索..."
                className="pl-8 w-full sm:w-[200px] md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="gold" onClick={() => setIsDialogOpen(true)}>
              新規作成
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="並び順" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">新しい順</SelectItem>
                  <SelectItem value="oldest">古い順</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-1/4 mb-2" />
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
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
                  getWeatherIcon={getWeatherIcon}
                  getWeatherText={getWeatherText}
                  isOwnReport={isOwnReport(report)}
                  onShowDetails={() => showDetails(report)}
                />
              ))}
            </div>
          )}

          {filteredReports.length > 0 && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              {filteredReports.length}件の日報が表示されています
              {searchTerm && ` (検索条件: "${searchTerm}")`}
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
          toast({
            title: "日報を作成しました",
            description: "日報が正常に作成されました",
          })
        }}
      />

      {/* 詳細ダイアログ */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>日報詳細</DialogTitle>
          </DialogHeader>
          <DailyReportDetail report={selectedReport} />
        </DialogContent>
      </Dialog>
    </>
  )
}

interface ReportCardProps {
  report: any
  getWeatherIcon: (weather: string) => string
  getWeatherText: (weather: string) => string
  isOwnReport: boolean
  onShowDetails: () => void
}

function ReportCard({ report, getWeatherIcon, getWeatherText, isOwnReport, onShowDetails }: ReportCardProps) {
  const [showPhotos, setShowPhotos] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!isOwnReport) {
      toast({
        title: "削除できません",
        description: "自分が作成した日報のみ削除できます",
        variant: "destructive",
      })
      return
    }

    if (!confirm("この日報を削除してもよろしいですか？")) return

    try {
      const supabase = getClientSupabase()
      const { error } = await supabase.from("daily_reports").delete().eq("id", report.id)

      if (error) throw error

      toast({
        title: "日報を削除しました",
        description: "日報が正常に削除されました",
      })

      // ここで親コンポーネントの再取得関数を呼び出すことも可能
      // onDelete(report.id)
    } catch (err: any) {
      console.error("日報削除エラー:", err)
      toast({
        title: "エラー",
        description: "日報の削除に失敗しました",
        variant: "destructive",
      })
    }
  }

  // 作業内容の短縮表示用
  const getShortenedContent = () => {
    const content = report.work_description || report.work_content || ""
    return content.length > 100 ? content.substring(0, 100) + "..." : content
  }

  return (
    <Card className={isOwnReport ? "border-l-4 border-l-gold" : ""}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">{report.projectName}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1 flex-wrap">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(report.report_date)}
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onShowDetails}
              className="border-gold text-gold hover:bg-gold/10"
            >
              詳細
            </Button>
            {isOwnReport && (
              <Button variant="ghost" size="sm" onClick={handleDelete} className="text-darkgray hover:bg-darkgray/10">
                削除
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm text-muted-foreground mb-2">
          <span className="font-medium">報告者:</span> {report.reporterName || "不明な報告者"}
          {report.reporterName === "不明な報告者" && report.custom_reporter_name && (
            <span> ({report.custom_reporter_name})</span>
          )}
        </div>
        <div className="text-sm mb-2">
          <span className="font-medium">作業内容:</span>
        </div>
        <div className="text-sm whitespace-pre-wrap">{getShortenedContent()}</div>

        {report.photo_urls && report.photo_urls.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">写真 {report.photo_urls.length}枚</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          {formatDate(report.created_at)} 作成
        </div>
      </CardFooter>
    </Card>
  )
}
