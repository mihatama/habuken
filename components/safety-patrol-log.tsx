"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { RefreshCw, Search, Eye, Edit } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { updateClientData, getClientSupabase } from "@/lib/supabase-utils"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { SafetyInspectionForm } from "./safety-inspection-form"
import { format } from "date-fns"

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
  const [logs, setLogs] = useState<any[]>([]) // 実際のデータ構造に合わせて型を定義する

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
    queryKey: ["safetyPatrols", tableExists],
    queryFn: async () => {
      if (!tableExists) return []

      try {
        console.log("安全巡視データの取得を開始します...")
        const supabase = getClientSupabase()

        // 安全巡視データを取得（リレーションシップを使用せず）
        console.log("安全巡視データをクエリ実行中...")
        const { data, error } = await supabase
          .from("safety_inspections")
          .select("*")
          .order("created_at", { ascending: false })

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

        // ユーザーデータを取得
        const userIds = data
          .filter((item) => item.staff_id)
          .map((item) => item.staff_id)
          .filter((value, index, self) => self.indexOf(value) === index) // 重複を削除

        let usersMap = {}
        if (userIds.length > 0) {
          const { data: usersData, error: usersError } = await supabase
            .from("users")
            .select("id, email")
            .in("id", userIds)

          if (!usersError && usersData) {
            usersMap = usersData.reduce((acc, user) => {
              acc[user.id] = user.email
              return acc
            }, {})
          }
        }

        // データを整形
        const formattedData = data.map((item) => ({
          id: item.id,
          projectName: item.custom_project_name || (item.deal_id && dealsMap[item.deal_id]) || "不明な案件",
          inspectionDate: item.inspection_date,
          inspectorName: item.custom_inspector_name || (item.staff_id && usersMap[item.staff_id]) || "不明な巡視者",
          comment: item.comment || "",
          status: item.status || "pending",
          checklist: item.checklist_items || [],
          photoUrls: item.photo_urls || [],
          createdAt: item.created_at,
          rawData: item,
        }))

        // logsステート変数を更新
        setLogs(formattedData)

        return formattedData
      } catch (error) {
        console.error("安全巡視データ取得エラー:", error)
        toast({
          title: "エラー",
          description: "安全巡視データの取得に失敗しました",
          variant: "destructive",
        })
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

  const handleApprovePatrol = async (patrolId: string) => {
    try {
      await updateClientData("safety_inspections", patrolId, {
        status: "approved",
        updated_at: new Date().toISOString(),
      })

      toast({
        title: "成功",
        description: "安全巡視を承認しました",
      })

      // データを再取得
      queryClient.invalidateQueries({ queryKey: ["safetyPatrols"] })
    } catch (error) {
      console.error("安全巡視承認エラー:", error)
      toast({
        title: "エラー",
        description: "安全巡視の承認に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleRejectPatrol = async (patrolId: string) => {
    try {
      await updateClientData("safety_inspections", patrolId, {
        status: "rejected",
        updated_at: new Date().toISOString(),
      })

      toast({
        title: "成功",
        description: "安全巡視を差し戻しました",
      })

      // データを再取得
      queryClient.invalidateQueries({ queryKey: ["safetyPatrols"] })
    } catch (error) {
      console.error("安全巡視差し戻しエラー:", error)
      toast({
        title: "エラー",
        description: "安全巡視の差し戻しに失敗しました",
        variant: "destructive",
      })
    }
  }

  const getChecklistStatusBadge = (status: string) => {
    switch (status) {
      case "good":
        return <Badge className="bg-green-500 hover:bg-green-600">◎</Badge>
      case "warning":
      case "caution":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">△</Badge>
      case "danger":
        return <Badge className="bg-red-500 hover:bg-red-600">×</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
      case "completed":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">承認待ち</Badge>
      case "approved":
        return <Badge className="bg-green-500 hover:bg-green-600">承認済</Badge>
      case "rejected":
        return <Badge className="bg-red-500 hover:bg-red-600">差戻し</Badge>
      default:
        return <Badge>{status}</Badge>
    }
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">安全・環境巡視日誌</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="検索..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-8"
            />
          </div>
          <Button onClick={openForm} className="bg-blue-900 hover:bg-blue-800">
            <span className="mr-1">+</span> 新規作成
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left font-medium">対象工事</th>
                <th className="px-4 py-3 text-left font-medium">巡視日</th>
                <th className="px-4 py-3 text-left font-medium">巡視者</th>
                <th className="px-4 py-3 text-left font-medium">コメント</th>
                <th className="px-4 py-3 text-left font-medium">ステータス</th>
                <th className="px-4 py-3 text-left font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                    データを読み込み中...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    表示する巡視日誌はありません
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{log.projectName}</td>
                    <td className="px-4 py-3">{formatDateString(log.inspectionDate)}</td>
                    <td className="px-4 py-3">{log.inspectorName}</td>
                    <td className="px-4 py-3">
                      <div className="max-w-xs truncate">{log.comment || "コメントなし"}</div>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(log.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          <span>詳細</span>
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Edit className="h-3.5 w-3.5" />
                          <span>編集</span>
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl p-0 bg-transparent border-none shadow-none">
          <SafetyInspectionForm onSuccess={handleFormSuccess} onCancel={closeForm} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
