"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getClientSupabase } from "@/lib/supabase-utils"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw } from "lucide-react"

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

export function DailyReportsTable() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [staffMap, setStaffMap] = useState<Record<string, string>>({})
  const [dealsMap, setDealsMap] = useState<Record<string, string>>({})
  const { toast } = useToast()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [tableStructure, setTableStructure] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

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

  // テーブル構造を取得する関数
  const fetchTableStructure = async () => {
    try {
      const supabase = getClientSupabase()

      // テーブル情報を取得するSQLクエリを実行
      const { data, error } = await supabase.rpc("get_table_info", { table_name: "daily_reports" })

      if (error) {
        console.error("テーブル構造の取得エラー:", error)
        return
      }

      setTableStructure(data)
      console.log("daily_reportsテーブルの構造:", data)
    } catch (err) {
      console.error("テーブル構造の取得中にエラーが発生しました:", err)
    }
  }

  const fetchReports = async () => {
    try {
      setLoading(true)
      const supabase = getClientSupabase()

      // 日報データを取得
      const { data: reportsData, error: reportsError } = await supabase
        .from("daily_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)

      if (reportsError) {
        console.error("日報データの取得エラー:", reportsError)
        throw reportsError
      }

      console.log(`取得した日報データ: ${reportsData?.length || 0}件`)

      // サンプルデータの詳細をログに出力
      if (reportsData && reportsData.length > 0) {
        console.log("日報サンプルデータ:", {
          id: reportsData[0].id,
          report_date: reportsData[0].report_date,
          submitted_by: reportsData[0].submitted_by,
          created_by: reportsData[0].created_by,
          staff_id: reportsData[0].staff_id,
          user_id: reportsData[0].user_id,
          workers: reportsData[0].workers,
          deal_id: reportsData[0].deal_id,
          custom_project_name: reportsData[0].custom_project_name,
        })
      }

      setReports(reportsData || [])

      // スタッフデータを取得
      const { data: staffData, error: staffError } = await supabase
        .from("staff")
        .select("id, full_name, user_id")
        .order("full_name")

      if (staffError) {
        console.error("スタッフデータの取得エラー:", staffError)
        throw staffError
      }

      // スタッフマップを作成
      const staffMapping = {}

      // スタッフデータからマッピングを作成
      staffData?.forEach((staff) => {
        staffMapping[staff.id] = staff.full_name
        if (staff.user_id) {
          staffMapping[staff.user_id] = staff.full_name
        }
      })

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

      setStaffMap((prev) => ({ ...prev, ...staffMapping }))

      // 案件データを取得
      const { data: dealsData, error: dealsError } = await supabase.from("deals").select("id, name")

      if (dealsError) {
        console.error("案件データの取得エラー:", dealsError)
        throw dealsError
      }

      // 案件マップを作成
      const dealsMapping = {}
      dealsData?.forEach((deal) => {
        dealsMapping[deal.id] = deal.name
      })

      setDealsMap(dealsMapping)
    } catch (err: any) {
      console.error("データ取得エラー:", err)
      setError(err.message || "データの取得に失敗しました")
      toast({
        title: "エラー",
        description: "データの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchReports()
    fetchTableStructure()
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchReports()
  }

  // 報告者名を取得する関数
  const getReporterName = (report: any) => {
    // 可能性のあるすべてのフィールドをチェック

    // 1. カスタム報告者名があればそれを使用
    if (report.custom_reporter_name) {
      return report.custom_reporter_name
    }

    // 2. staff_idがあり、マッピングに存在すればそれを使用
    const reporterId = report.staff_id || report.user_id || report.submitted_by || report.created_by

    if (reporterId && staffMap[reporterId]) {
      return staffMap[reporterId]
    }

    // 3. 作業者情報から取得を試みる
    if (report.workers && Array.isArray(report.workers) && report.workers.length > 0) {
      const firstWorker = report.workers[0]
      if (firstWorker.name) {
        return firstWorker.name
      }
    }

    // 4. full_nameフィールドがあれば使用
    if (report.full_name) {
      return report.full_name
    }

    // 5. 関連するスタッフ情報があれば使用
    if (report.staff && report.staff.full_name) {
      return report.staff.full_name
    }

    return "不明なスタッフ"
  }

  // 案件名を取得する関数
  const getProjectName = (report: any) => {
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>日報データテーブル</CardTitle>
          <CardDescription>daily_reportsテーブルの登録者情報を含むデータ一覧</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {tableStructure && (
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium mb-2">テーブル構造</h3>
            <div className="text-xs text-muted-foreground">
              <p>テーブル名: daily_reports</p>
              <p className="mt-2">主要フィールド:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>id: 日報ID (主キー)</li>
                <li>report_date: 報告日</li>
                <li>submitted_by: 提出者ID (スタッフまたはユーザーID)</li>
                <li>created_by: 作成者ID (ユーザーID)</li>
                <li>staff_id: スタッフID</li>
                <li>user_id: ユーザーID</li>
                <li>workers: 作業者情報 (JSON配列)</li>
                <li>deal_id: 案件ID</li>
                <li>custom_project_name: カスタム案件名</li>
                <li>work_description: 作業内容</li>
              </ul>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8">日報データがありません</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>報告日</TableHead>
                  <TableHead>案件名</TableHead>
                  <TableHead>登録者</TableHead>
                  <TableHead>登録者ID</TableHead>
                  <TableHead>作業者</TableHead>
                  <TableHead>作業内容</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{formatDate(report.report_date)}</TableCell>
                    <TableCell>{getProjectName(report)}</TableCell>
                    <TableCell>{getReporterName(report)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {report.submitted_by || report.created_by || report.staff_id || report.user_id || "なし"}
                    </TableCell>
                    <TableCell>
                      {report.workers && Array.isArray(report.workers) && report.workers.length > 0 ? (
                        <div className="text-xs">
                          {report.workers.map((worker, index) => (
                            <div key={index} className="mb-1">
                              {worker.name || "名前なし"}
                              {worker.start_time && worker.end_time && (
                                <span className="text-muted-foreground ml-1">
                                  ({worker.start_time.substring(0, 5)}〜{worker.end_time.substring(0, 5)})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">作業者情報なし</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">{report.work_description || "説明なし"}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
