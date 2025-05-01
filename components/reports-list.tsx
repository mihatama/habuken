"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FileText, Eye, Download, Loader2, Plus } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

// レポートの型定義
interface Report {
  id: string
  project_name?: string
  deal_id?: string
  custom_project_name?: string
  date: string
  report_date?: string
  work_description: string
  created_by?: string
  submitted_by?: string
  status?: string
  created_at: string
  weather?: string
}

export function ReportsList() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [filter, setFilter] = useState({
    project: "",
    dateFrom: "",
    dateTo: "",
    status: "all",
  })
  const [newReport, setNewReport] = useState({
    custom_project_name: "",
    work_description: "",
    weather: "sunny",
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  // デバッグ情報を追加する関数
  const addDebugInfo = (info: string) => {
    console.log(info)
    setDebugInfo((prev) => prev + "\n" + info)
  }

  // データベースからレポートデータを取得
  const fetchReports = async () => {
    try {
      setLoading(true)
      setDebugInfo("日報データの取得を開始します...")
      addDebugInfo("Supabaseクライアントを初期化中...")

      // Supabaseクライアントを直接初期化
      const supabase = createClientComponentClient()

      // 認証状態を確認
      addDebugInfo("認証状態を確認中...")
      const { data: authData, error: authError } = await supabase.auth.getSession()

      if (authError) {
        addDebugInfo(`認証確認エラー: ${authError.message}`)
      } else {
        addDebugInfo(`認証セッション: ${authData.session ? "あり" : "なし"}`)
        if (authData.session) {
          addDebugInfo(`ユーザーID: ${authData.session.user.id}`)
        }
      }

      // テーブル構造を確認
      addDebugInfo("テーブル構造を確認中...")
      const { data: tableInfo, error: tableError } = await supabase.from("daily_reports").select("*").limit(1)

      if (tableError) {
        addDebugInfo(`テーブル構造確認エラー: ${tableError.message}`)
      } else {
        addDebugInfo(`テーブル構造: ${tableInfo ? "取得成功" : "データなし"}`)
      }

      // 日報データを取得（RLSを無視するために .select('*') を使用）
      addDebugInfo("日報データを取得中...")
      const { data: dailyReports, error: dailyError } = await supabase
        .from("daily_reports")
        .select("*")
        .order("created_at", { ascending: false })

      if (dailyError) {
        addDebugInfo(`日報データの取得エラー: ${dailyError.message}`)
        throw dailyError
      }

      addDebugInfo(`取得した日報データ: ${JSON.stringify(dailyReports)}`)

      // ダミーデータを準備
      const dummyReports = [
        {
          id: "dummy-1",
          project_name: "テスト工事",
          date: "2025-05-01",
          report_date: "2025-05-01",
          work_description: "テスト作業",
          created_at: new Date().toISOString(),
          weather: "sunny",
          status: "pending",
        },
      ]

      // データがない場合はダミーデータを使用
      if (!dailyReports || dailyReports.length === 0) {
        addDebugInfo("日報データが見つかりませんでした。ダミーデータを使用します。")
        setReports(dummyReports)
        setLoading(false)
        return
      }

      // 日報データを変換
      const formattedReports = dailyReports.map((report) => ({
        id: report.id,
        project_name: report.custom_project_name || "不明な案件",
        deal_id: report.deal_id,
        custom_project_name: report.custom_project_name,
        date: report.report_date,
        report_date: report.report_date,
        work_description: report.work_description,
        created_by: report.created_by,
        submitted_by: report.submitted_by,
        status: report.status || "pending",
        created_at: report.created_at,
        weather: report.weather,
      }))

      addDebugInfo(`変換後のレポートデータ: ${JSON.stringify(formattedReports)}`)
      setReports(formattedReports)
    } catch (err: any) {
      console.error("レポートデータの取得エラー:", err)
      addDebugInfo(`エラー発生: ${err.message}`)
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

  // フィルタリングされた報告書リスト
  const filteredReports = reports.filter((report) => {
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

  // ステータスに応じたバッジを取得
  const getStatusBadge = (status?: string) => {
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
        return <Badge variant="outline">未設定</Badge>
    }
  }

  // 報告書を表示
  const viewReport = (id: string) => {
    console.log(`報告書 ${id} を表示`)
    // ここで実際の表示処理を実装
    const report = reports.find((r) => r.id === id)
    if (report) {
      alert(`報告書詳細:\n工事名: ${report.project_name}\n日付: ${report.date}\n作業内容: ${report.work_description}`)
    }
  }

  // 報告書をダウンロード
  const downloadReport = (id: string) => {
    console.log(`報告書 ${id} をダウンロード`)
    // ここで実際のダウンロード処理を実装
    alert(`報告書 ${id} をダウンロードします`)
  }

  // 新しい日報を追加
  const addNewReport = async () => {
    try {
      setLoading(true)
      addDebugInfo("新しい日報の追加を開始します...")

      if (!newReport.custom_project_name || !newReport.work_description) {
        addDebugInfo("工事名と作業内容は必須です")
        toast({
          title: "入力エラー",
          description: "工事名と作業内容は必須です",
          variant: "destructive",
        })
        return
      }

      const supabase = createClientComponentClient()

      // 認証情報を取得
      const { data: authData } = await supabase.auth.getSession()
      const userId = authData.session?.user.id

      if (!userId) {
        addDebugInfo("ユーザーIDが取得できません")
        toast({
          title: "認証エラー",
          description: "ログインしていないか、セッションが無効です",
          variant: "destructive",
        })
        return
      }

      const today = new Date().toISOString().split("T")[0]

      const reportData = {
        report_date: today,
        work_description: newReport.work_description,
        submitted_by: userId,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        custom_project_name: newReport.custom_project_name,
        weather: newReport.weather,
        status: "pending",
      }

      addDebugInfo(`追加する日報データ: ${JSON.stringify(reportData)}`)

      const { data, error } = await supabase.from("daily_reports").insert(reportData).select()

      if (error) {
        addDebugInfo(`日報追加エラー: ${error.message}`)
        toast({
          title: "エラー",
          description: "日報の追加に失敗しました",
          variant: "destructive",
        })
      } else {
        addDebugInfo(`日報追加成功: ${JSON.stringify(data)}`)
        toast({
          title: "成功",
          description: "日報を追加しました",
        })
        // フォームをリセット
        setNewReport({
          custom_project_name: "",
          work_description: "",
          weather: "sunny",
        })
        setDialogOpen(false)
        // データを再取得
        fetchReports()
      }
    } catch (err: any) {
      addDebugInfo(`日報追加中にエラー発生: ${err.message}`)
      toast({
        title: "エラー",
        description: err.message || "日報の追加に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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

        <div className="p-4 border rounded-md bg-gray-50">
          <h3 className="font-bold mb-2">デバッグ情報</h3>
          <pre className="whitespace-pre-wrap text-xs">{debugInfo}</pre>
          <div className="mt-4 flex space-x-2">
            <Button onClick={fetchReports} variant="outline" size="sm">
              データ再取得
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold text-center mb-6">報告一覧</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

      <div className="flex justify-between items-center mb-4">
        <div></div>
        <div className="flex space-x-2">
          <Button onClick={fetchReports} variant="outline" size="sm">
            <Loader2 className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : "hidden"}`} />
            更新
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                新規作成
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新規日報作成</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">工事名</label>
                  <Input
                    value={newReport.custom_project_name}
                    onChange={(e) => setNewReport({ ...newReport, custom_project_name: e.target.value })}
                    placeholder="工事名を入力"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">天気</label>
                  <Select
                    value={newReport.weather}
                    onValueChange={(value) => setNewReport({ ...newReport, weather: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunny">晴れ</SelectItem>
                      <SelectItem value="cloudy">曇り</SelectItem>
                      <SelectItem value="rainy">雨</SelectItem>
                      <SelectItem value="snowy">雪</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">作業内容</label>
                  <Textarea
                    value={newReport.work_description}
                    onChange={(e) => setNewReport({ ...newReport, work_description: e.target.value })}
                    placeholder="作業内容を入力"
                    rows={5}
                  />
                </div>
                <Button onClick={addNewReport} className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  保存
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>種類</TableHead>
              <TableHead>工事名</TableHead>
              <TableHead>日付</TableHead>
              <TableHead>天気</TableHead>
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
                      <FileText className="h-4 w-4" />
                      <span className="ml-2">日報</span>
                    </div>
                  </TableCell>
                  <TableCell>{report.project_name}</TableCell>
                  <TableCell>
                    {report.date
                      ? new Date(report.date).toLocaleDateString("ja-JP", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : "日付なし"}
                  </TableCell>
                  <TableCell>{report.weather || "未設定"}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => viewReport(report.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
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

      <div className="p-4 border rounded-md bg-gray-50 mt-6">
        <h3 className="font-bold mb-2">デバッグ情報</h3>
        <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-60">{debugInfo}</pre>
      </div>
    </div>
  )
}
