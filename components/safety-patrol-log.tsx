"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { RefreshCw, Search, CheckCircle, AlertTriangle, XCircle, Filter, Calendar, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getClientSupabase } from "@/lib/supabase-utils"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { SafetyInspectionForm } from "./safety-inspection-form"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// チェックリスト項目の定義
const checklistItems = [
  { id: "machines", label: "機械・設備" },
  { id: "protectiveGear", label: "保護具着用" },
  { id: "waste", label: "廃棄物管理" },
  { id: "noise", label: "騒音・振動" },
  { id: "scaffolding", label: "足場・作業床" },
  { id: "electricity", label: "電気関係" },
  { id: "fire", label: "火災防止" },
  { id: "signage", label: "標識・表示" },
]

export function SafetyPatrolLog() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [currentPatrol, setCurrentPatrol] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [tableExists, setTableExists] = useState<boolean | null>(null)
  const [isCheckingTable, setIsCheckingTable] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [searchQuery, setSearchQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([]) // 実際のデータ構造に合わせて型を定義する
  const [sortBy, setSortBy] = useState("newest") // "newest", "oldest"
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 検索クエリの変更を処理
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // フォームを開く
  const openForm = () => {
    setIsFormOpen(true)
  }

  // フォームを閉じる
  const closeForm = () => {
    setIsFormOpen(false)
  }

  // 詳細を表示
  const openDetail = (log: any) => {
    setSelectedLog(log)
    setIsDetailOpen(true)
  }

  // 詳細を閉じる
  const closeDetail = () => {
    setIsDetailOpen(false)
    setSelectedLog(null)
  }

  // 巡視日誌の保存が完了した時の処理
  const handleFormSuccess = (newLog: any) => {
    // データを再取得して最新の状態を反映
    queryClient.invalidateQueries({ queryKey: ["safetyPatrols"] })

    // フォームを閉じる
    closeForm()

    toast({
      title: "成功",
      description: "安全巡視データが正常に保存されました",
    })
  }

  // Check if safety_inspections table exists
  const checkTableExists = async () => {
    try {
      setIsCheckingTable(true)
      const supabase = getClientSupabase()

      const { error } = await supabase.from("safety_inspections").select("count(*)").limit(1).single()

      if (error && error.message.includes("does not exist")) {
        setTableExists(false)
      } else {
        setTableExists(true)
      }
    } catch (error) {
      console.error("テーブル確認エラー:", error)
      setTableExists(false)
    } finally {
      setIsCheckingTable(false)
    }
  }

  useEffect(() => {
    checkTableExists()
  }, [])

  // 安全パトロールデータを取得
  const { data: patrols = [], isLoading } = useQuery({
    queryKey: ["safetyPatrols", tableExists, sortBy],
    queryFn: async () => {
      if (!tableExists) return []

      try {
        console.log("安全巡視データの取得を開始します...")
        const supabase = getClientSupabase()
        setIsRefreshing(true)

        // 安全巡視データを取得（リレーションシップを使用せず）
        console.log("安全巡視データをクエリ実行中...")
        const { data, error } = await supabase
          .from("safety_inspections")
          .select("*")
          .order("created_at", { ascending: sortBy === "oldest" })

        if (error) {
          console.error("安全巡視データの取得エラー:", error)
          throw error
        }

        console.log(`安全巡視データの取得成功: ${data?.length || 0} 件`)

        // 案件データを取得
        const dealIds = data
          .filter((item) => item.deal_id)
          .map((item) => item.deal_id)
          .filter((value, index, self) => self.indexOf(value) === index) // 重複を削除

        let dealsMap = {}
        if (dealIds.length > 0) {
          const { data: dealsData, error: dealsError } = await supabase
            .from("deals")
            .select("id, name")
            .in("id", dealIds)

          if (!dealsError && dealsData) {
            dealsMap = dealsData.reduce((acc, deal) => {
              acc[deal.id] = deal.name
              return acc
            }, {})
          }
        }

        // スタッフデータを取得
        console.log("安全巡視データの生データ:", data)
        const staffIds = data
          .filter((item) => item.staff_id)
          .map((item) => item.staff_id)
          .filter((value, index, self) => self.indexOf(value) === index) // 重複を削除

        console.log("抽出されたスタッフID:", staffIds)

        const staffMap = {}
        if (staffIds.length > 0) {
          // まずスタッフテーブルを確認
          const { data: staffData, error: staffError } = await supabase
            .from("staff")
            .select("id, full_name, user_id")
            .order("full_name")

          console.log("取得したスタッフデータ:", staffData, staffError)

          if (!staffError && staffData && staffData.length > 0) {
            // スタッフデータをマッピング（user_idとidの両方をキーとして使用）
            staffData.forEach((staff) => {
              if (staff.id) staffMap[staff.id] = staff.full_name
              if (staff.user_id) staffMap[staff.user_id] = staff.full_name
            })
          }

          // ユーザーテーブルも確認
          const { data: usersData, error: usersError } = await supabase.from("users").select("id, email, user_metadata")

          console.log("取得したユーザーデータ:", usersData, usersError)

          if (!usersError && usersData && usersData.length > 0) {
            usersData.forEach((user) => {
              // ユーザーIDをキーとして使用
              if (user.id && !staffMap[user.id]) {
                // user_metadataから名前を取得するか、なければメールアドレスを使用
                const userName = user.user_metadata?.name || user.user_metadata?.full_name || user.email
                staffMap[user.id] = userName
              }
            })
          }
        }

        console.log("作成された巡視者マッピング:", staffMap)

        // データを整形
        const formattedData = data.map((item) => {
          // 巡視者名を決定
          let inspectorName = "不明な巡視者"

          // 1. カスタム巡視者名があればそれを使用
          if (item.custom_inspector_name) {
            inspectorName = item.custom_inspector_name
            console.log(`項目 ${item.id}: カスタム巡視者名を使用 - ${inspectorName}`)
          }
          // 2. staff_idがあり、マッピングに存在すればそれを使用
          else if (item.staff_id && staffMap[item.staff_id]) {
            inspectorName = staffMap[item.staff_id]
            console.log(`項目 ${item.id}: staff_id ${item.staff_id} から巡視者名を取得 - ${inspectorName}`)
          }
          // 3. user_idがあり、マッピングに存在すればそれを使用
          else if (item.user_id && staffMap[item.user_id]) {
            inspectorName = staffMap[item.user_id]
            console.log(`項目 ${item.id}: user_id ${item.user_id} から巡視者名を取得 - ${inspectorName}`)
          }
          // 4. created_byがあり、マッピングに存在すればそれを使用
          else if (item.created_by && staffMap[item.created_by]) {
            inspectorName = staffMap[item.created_by]
            console.log(`項目 ${item.id}: created_by ${item.created_by} から巡視者名を取得 - ${inspectorName}`)
          } else {
            console.log(
              `項目 ${item.id}: 巡視者名を特定できませんでした - staff_id: ${item.staff_id}, user_id: ${item.user_id}, created_by: ${item.created_by}`,
            )
          }

          return {
            id: item.id,
            projectName: item.custom_project_name || (item.deal_id && dealsMap[item.deal_id]) || "不明な案件",
            inspectionDate: item.inspection_date,
            inspectorName: inspectorName,
            comment: item.comment || "",
            checklist: item.checklist_items || [],
            photoUrls: item.photo_urls || [],
            createdAt: item.created_at,
            rawData: item,
          }
        })

        // logsステート変数を更新
        setLogs(formattedData)
        setIsRefreshing(false)

        return formattedData
      } catch (error) {
        console.error("安全巡視データ取得エラー:", error)
        toast({
          title: "エラー",
          description: "安全巡視データの取得に失敗しました",
          variant: "destructive",
        })
        setIsRefreshing(false)
        return []
      }
    },
    enabled: tableExists === true,
  })

  // 検索フィルター
  const filteredLogs = logs.filter(
    (log) =>
      log.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.inspectorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.comment.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddPatrolSuccess = () => {
    // データを再取得
    queryClient.invalidateQueries({ queryKey: ["safetyPatrols"] })
  }

  const countIssues = (patrol: any) => {
    const checklist = patrol.checklist || []
    let warningCount = 0
    let dangerCount = 0

    if (Array.isArray(checklist)) {
      checklist.forEach((item: any) => {
        if (item.status === "warning" || item.status === "caution") warningCount++
        if (item.status === "danger") dangerCount++
      })
    }

    return { warningCount, dangerCount }
  }

  // 日付フォーマット関数
  const formatDateString = (dateString: string | null | undefined): string => {
    if (!dateString) return "日付なし"
    try {
      return format(new Date(dateString), "yyyy年MM月dd日")
    } catch (error) {
      return dateString
    }
  }

  // チェックリストアイテムのステータスアイコンを取得
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
      case "caution":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "danger":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  // リフレッシュボタンのハンドラー
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["safetyPatrols"] })
  }

  // If we're still checking if the table exists, show a loading state
  if (isCheckingTable) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>安全・環境巡視日誌</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>データベース接続を確認中...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If the table doesn't exist, show a message
  if (tableExists === false) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>安全・環境巡視日誌</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-200 dark:border-yellow-800 mb-4">
            <p className="text-yellow-700 dark:text-yellow-300">
              安全巡視テーブルが存在しません。データベースが正しく設定されていることを確認してください。
            </p>
          </div>
          <Button onClick={checkTableExists} className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            再確認
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <CardTitle>安全・環境巡視日誌</CardTitle>
          <CardDescription>現場の安全・環境巡視記録を確認・管理できます</CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="検索..."
              className="pl-8 w-full sm:w-[200px] md:w-[300px]"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="gold" onClick={openForm}>
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

        {isLoading ? (
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
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8">
            {searchQuery ? "検索条件に一致する巡視日誌はありません" : "巡視日誌データがありません"}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <PatrolCard
                key={log.id}
                log={log}
                getStatusIcon={getStatusIcon}
                formatDateString={formatDateString}
                countIssues={countIssues}
                onShowDetails={() => openDetail(log)}
              />
            ))}
          </div>
        )}

        {filteredLogs.length > 0 && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {filteredLogs.length}件の巡視日誌が表示されています
            {searchQuery && ` (検索条件: "${searchQuery}")`}
          </div>
        )}
      </CardContent>

      {/* 新規作成フォームダイアログ */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl p-0 bg-transparent border-none shadow-none">
          <SafetyInspectionForm onSuccess={handleFormSuccess} onCancel={closeForm} />
        </DialogContent>
      </Dialog>

      {/* 詳細表示ダイアログ */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>安全巡視詳細</DialogTitle>
            <DialogDescription>安全巡視の詳細情報を表示しています</DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">対象工事</h3>
                  <p className="mt-1">{selectedLog.projectName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">巡視日</h3>
                  <p className="mt-1">{formatDateString(selectedLog.inspectionDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">巡視者</h3>
                  <p className="mt-1">{selectedLog.inspectorName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">作成日時</h3>
                  <p className="mt-1">{formatDateString(selectedLog.createdAt)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">コメント</h3>
                <p className="mt-1 p-2 bg-gray-50 rounded-md">{selectedLog.comment || "コメントなし"}</p>
              </div>

              {selectedLog.checklist && selectedLog.checklist.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">チェックリスト</h3>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="px-4 py-2 text-left">項目</th>
                          <th className="px-4 py-2 text-left">カテゴリ</th>
                          <th className="px-4 py-2 text-left">状態</th>
                          <th className="px-4 py-2 text-left">環境項目</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedLog.checklist.map((item, index) => (
                          <tr key={index} className="border-b last:border-b-0">
                            <td className="px-4 py-2">{item.name}</td>
                            <td className="px-4 py-2">{item.category}</td>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-1">
                                {getStatusIcon(item.status)}
                                <span>
                                  {item.status === "good"
                                    ? "良好"
                                    : item.status === "warning" || item.status === "caution"
                                      ? "注意"
                                      : "危険"}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              {item.isEco ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">環境</Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedLog.photoUrls && selectedLog.photoUrls.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">写真</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedLog.photoUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`安全巡視写真 ${index + 1}`}
                          className="object-cover w-full h-full rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end mt-4">
            <Button variant="gold" onClick={closeDetail}>
              閉じる
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

// 巡視日誌カードコンポーネント
interface PatrolCardProps {
  log: any
  getStatusIcon: (status: string) => React.ReactNode
  formatDateString: (dateString: string | null | undefined) => string
  countIssues: (patrol: any) => { warningCount: number; dangerCount: number }
  onShowDetails: () => void
}

function PatrolCard({ log, getStatusIcon, formatDateString, countIssues, onShowDetails }: PatrolCardProps) {
  const { warningCount, dangerCount } = countIssues(log)

  // コメントの短縮表示用
  const getShortenedComment = () => {
    const content = log.comment || ""
    return content.length > 100 ? content.substring(0, 100) + "..." : content
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">{log.projectName}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1 flex-wrap">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {formatDateString(log.inspectionDate)}
              {(warningCount > 0 || dangerCount > 0) && (
                <>
                  <span className="mx-1">|</span>
                  {warningCount > 0 && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      注意 {warningCount}件
                    </Badge>
                  )}
                  {dangerCount > 0 && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 ml-1">
                      <XCircle className="h-3 w-3 mr-1" />
                      危険 {dangerCount}件
                    </Badge>
                  )}
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
            <Button variant="ghost" size="sm" className="text-darkgray hover:bg-darkgray/10">
              編集
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm text-muted-foreground mb-2">
          <span className="font-medium">巡視者:</span> {log.inspectorName}
        </div>
        <div className="text-sm mb-2">
          <span className="font-medium">コメント:</span>
        </div>
        <div className="text-sm whitespace-pre-wrap">{getShortenedComment()}</div>

        {log.photoUrls && log.photoUrls.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <img src="/placeholder.svg" className="h-3.5 w-3.5 text-muted-foreground" alt="" />
            <span className="text-xs text-muted-foreground">写真 {log.photoUrls.length}枚</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <FileText className="h-3 w-3 text-muted-foreground" />
          {formatDateString(log.createdAt)} 作成
        </div>
      </CardFooter>
    </Card>
  )
}
