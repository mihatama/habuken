"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ImageIcon, Sun, Cloud, CloudRain, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@supabase/supabase-js"
import { toast } from "@/components/ui/use-toast"
import { getDailyReportsData } from "@/lib/supabase-utils" // 修正: getDailyReportsData を使用
import { DailyReportFormDialog } from "./daily-report-form-dialog"

export function DailyWorkReport() {
  const [reports, setReports] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [currentReport, setCurrentReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Supabaseクライアントの初期化を遅延させる
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    // コンポーネントがマウントされた後にSupabaseクライアントを初期化
    if (typeof window !== "undefined") {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (supabaseUrl && supabaseAnonKey) {
        const client = createClient(supabaseUrl, supabaseAnonKey)
        setSupabase(client)
      } else {
        console.error("Supabase環境変数が設定されていません")
        toast({
          title: "エラー",
          description: "システム設定に問題があります。管理者にお問い合わせください。",
          variant: "destructive",
        })
      }
    }
  }, [])

  // データの取得
  const fetchData = async () => {
    if (!supabase) return // supabaseクライアントがない場合は何もしない

    setLoading(true)
    try {
      // 作業日報データを取得 (修正: getDailyReportsData を使用)
      const reportsData = await getDailyReportsData()

      // 各日報データに表示用のプロパティを追加
      const processedReports =
        reportsData?.map((report) => {
          // プロジェクト名の設定
          const projectName = report.custom_project_name || "不明な案件"

          // ユーザー名の設定（後でスタッフデータから更新）
          const userName = "不明なユーザー"

          return {
            ...report,
            projectName,
            userName,
            work_content: report.work_description || "", // work_content フィールドがない場合は work_description を使用
          }
        }) || []

      console.log("処理後の日報データ:", processedReports)
      setReports(processedReports)

      // プロジェクトデータを取得
      const { data: projectsData } = await supabase.from("projects").select("*")
      setProjects(projectsData || [])

      // スタッフデータを取得
      const { data: staffData } = await supabase.from("staff").select("*")
      setStaff(staffData || [])
    } catch (error) {
      console.error("データ取得エラー:", error)
      toast({
        title: "エラー",
        description: "データの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (supabase) {
      fetchData()
    }
  }, [supabase])

  const handleOpenAddDialog = () => {
    try {
      console.log("ダイアログを開こうとしています...")
      setIsAddDialogOpen(true)
      console.log("ダイアログの状態:", isAddDialogOpen) // この時点ではまだfalseの可能性がある（状態更新は非同期）
    } catch (error) {
      console.error("ダイアログを開く際にエラーが発生しました:", error)
      toast({
        title: "エラー",
        description: "操作を完了できませんでした。もう一度お試しください。",
        variant: "destructive",
      })
    }
  }

  const filteredReports = reports.filter(
    (report) =>
      report.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.work_content?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case "sunny":
        return <Sun className="h-5 w-5 text-yellow-500" />
      case "cloudy":
        return <Cloud className="h-5 w-5 text-gray-500" />
      case "rainy":
        return <CloudRain className="h-5 w-5 text-blue-500" />
      default:
        return <Sun className="h-5 w-5 text-yellow-500" />
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>作業日報</CardTitle>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[250px]"
          />
          <Button onClick={handleOpenAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            新規作成
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>工事名</TableHead>
              <TableHead>作業者</TableHead>
              <TableHead>作業日</TableHead>
              <TableHead>天候</TableHead>
              <TableHead>作業内容</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  該当する日報はありません
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.projectName}</TableCell>
                  <TableCell>{report.userName}</TableCell>
                  <TableCell>{new Date(report.work_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getWeatherIcon(report.weather)}
                      <span className="ml-2">
                        {report.weather === "sunny"
                          ? "晴れ"
                          : report.weather === "cloudy"
                            ? "曇り"
                            : report.weather === "rainy"
                              ? "雨"
                              : report.weather}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{report.work_content}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Dialog
                        open={isViewDialogOpen && currentReport?.id === report.id}
                        onOpenChange={(open) => {
                          setIsViewDialogOpen(open)
                          if (open) setCurrentReport(report)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setCurrentReport(report)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            詳細
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>作業日報詳細</DialogTitle>
                          </DialogHeader>
                          {currentReport && (
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="border rounded-md p-4">
                                  <h3 className="text-sm font-medium text-muted-foreground mb-1">工事名</h3>
                                  <p className="font-medium">{currentReport.projectName}</p>
                                </div>
                                <div className="border rounded-md p-4">
                                  <h3 className="text-sm font-medium text-muted-foreground mb-1">作業者</h3>
                                  <p className="font-medium">{currentReport.userName}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="border rounded-md p-4">
                                  <h3 className="text-sm font-medium text-muted-foreground mb-1">作業日</h3>
                                  <p className="font-medium">
                                    {new Date(currentReport.work_date).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="border rounded-md p-4">
                                  <h3 className="text-sm font-medium text-muted-foreground mb-1">天候</h3>
                                  <div className="flex items-center">
                                    {getWeatherIcon(currentReport.weather)}
                                    <span className="ml-2 font-medium">
                                      {currentReport.weather === "sunny"
                                        ? "晴れ"
                                        : currentReport.weather === "cloudy"
                                          ? "曇り"
                                          : currentReport.weather === "rainy"
                                            ? "雨"
                                            : currentReport.weather}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="border rounded-md p-4">
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">作業内容</h3>
                                <p>{currentReport.work_content}</p>
                              </div>
                              <div className="border rounded-md p-4">
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">添付写真</h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {currentReport.photos && currentReport.photos.length > 0 ? (
                                    currentReport.photos.map((photo: string, index: number) => (
                                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                                        <ImageIcon className="h-3 w-3 mr-1" />
                                        {photo}
                                      </Badge>
                                    ))
                                  ) : (
                                    <p className="text-sm text-muted-foreground">添付写真はありません</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* ダイアログを外部に配置 */}
      <DailyReportFormDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSuccess={fetchData} />
    </Card>
  )
}
