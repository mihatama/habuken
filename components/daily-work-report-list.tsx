"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DailyReportFormDialog } from "./daily-report-form-dialog"
import { getClientSupabase } from "@/lib/supabase-utils"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { ImageIcon, FileText, Calendar, Clock, CloudSun } from "lucide-react"

export function DailyWorkReportList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [staffMap, setStaffMap] = useState<Record<string, string>>({})
  const [dealsMap, setDealsMap] = useState<Record<string, string>>({})
  const { toast } = useToast()

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

      // スタッフデータを取得
      const { data: staffData, error: staffError } = await supabase.from("staff").select("id, full_name")

      if (staffError) throw staffError

      // 案件データを取得
      const { data: dealsData, error: dealsError } = await supabase.from("deals").select("id, name")

      if (dealsError) throw dealsError

      // スタッフIDと名前のマッピングを作成
      const staffMapping: Record<string, string> = {}
      staffData?.forEach((staff) => {
        staffMapping[staff.id] = staff.full_name
      })

      // 案件IDと名前のマッピングを作成
      const dealsMapping: Record<string, string> = {}
      dealsData?.forEach((deal) => {
        dealsMapping[deal.id] = deal.name
      })

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            確認待ち
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            承認済み
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            差し戻し
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
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
          <Button onClick={() => setIsDialogOpen(true)}>新規作成</Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">すべて</TabsTrigger>
              <TabsTrigger value="pending">確認待ち</TabsTrigger>
              <TabsTrigger value="approved">承認済み</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {loading ? (
                <div className="text-center py-8">読み込み中...</div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8">日報データがありません</div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      staffMap={staffMap}
                      dealsMap={dealsMap}
                      getWeatherIcon={getWeatherIcon}
                      getWeatherText={getWeatherText}
                      getStatusBadge={getStatusBadge}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending">
              {loading ? (
                <div className="text-center py-8">読み込み中...</div>
              ) : reports.filter((r) => r.status === "pending").length === 0 ? (
                <div className="text-center py-8">確認待ちの日報はありません</div>
              ) : (
                <div className="space-y-4">
                  {reports
                    .filter((report) => report.status === "pending")
                    .map((report) => (
                      <ReportCard
                        key={report.id}
                        report={report}
                        staffMap={staffMap}
                        dealsMap={dealsMap}
                        getWeatherIcon={getWeatherIcon}
                        getWeatherText={getWeatherText}
                        getStatusBadge={getStatusBadge}
                      />
                    ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="approved">
              {loading ? (
                <div className="text-center py-8">読み込み中...</div>
              ) : reports.filter((r) => r.status === "approved").length === 0 ? (
                <div className="text-center py-8">承認済みの日報はありません</div>
              ) : (
                <div className="space-y-4">
                  {reports
                    .filter((report) => report.status === "approved")
                    .map((report) => (
                      <ReportCard
                        key={report.id}
                        report={report}
                        staffMap={staffMap}
                        dealsMap={dealsMap}
                        getWeatherIcon={getWeatherIcon}
                        getWeatherText={getWeatherText}
                        getStatusBadge={getStatusBadge}
                      />
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <DailyReportFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSuccess={fetchReports} />
    </>
  )
}

interface ReportCardProps {
  report: any
  staffMap: Record<string, string>
  dealsMap: Record<string, string>
  getWeatherIcon: (weather: string) => string
  getWeatherText: (weather: string) => string
  getStatusBadge: (status: string) => React.ReactNode
}

function ReportCard({ report, staffMap, dealsMap, getWeatherIcon, getWeatherText, getStatusBadge }: ReportCardProps) {
  const [showPhotos, setShowPhotos] = useState(false)

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy年MM月dd日(E)", { locale: ja })
    } catch (e) {
      return dateString
    }
  }

  const projectName = report.project_id
    ? dealsMap[report.project_id] || "不明な案件"
    : report.custom_project_name || "その他"

  const staffName = staffMap[report.submitted_by] || "不明なスタッフ"

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{projectName}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
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
          {getStatusBadge(report.status)}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm text-muted-foreground mb-2">
          <span className="font-medium">報告者:</span> {staffName}
        </div>
        <div className="text-sm whitespace-pre-wrap">{report.work_description}</div>

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
