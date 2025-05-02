"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { RefreshCw, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { fetchClientData, updateClientData, getClientSupabase } from "@/lib/supabase-utils"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { SafetyInspectionForm } from "./safety-inspection-form"

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
    setLogs([...logs, newLog])
    closeForm()
  }

  // Check if safety_patrols table exists
  const checkTableExists = async () => {
    try {
      setIsCheckingTable(true)
      const supabase = getClientSupabase()

      const { error } = await supabase.from("safety_patrols").select("count(*)").limit(1).single()

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
        // 安全パトロールデータを取得
        const { data, error } = await fetchClientData("safety_patrols", {
          join: [
            { table: "projects", on: "project_id", select: ["name as projectName"] },
            { table: "staff", on: "inspector_id", select: ["full_name as inspectorName"] },
          ],
        })

        if (error) throw error
        return data || []
      } catch (error) {
        console.error("安全パトロールデータ取得エラー:", error)
        toast({
          title: "エラー",
          description: "安全パトロールデータの取得に失敗しました",
          variant: "destructive",
        })
        return []
      }
    },
    enabled: tableExists === true,
  })

  const filteredPatrols = patrols.filter(
    (patrol) =>
      (patrol.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patrol.inspectorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patrol.comment?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (activeTab === "all" ||
        (activeTab === "pending" && patrol.status === "pending") ||
        (activeTab === "approved" && patrol.status === "approved")),
  )

  const handleAddPatrolSuccess = () => {
    // データを再取得
    queryClient.invalidateQueries({ queryKey: ["safetyPatrols"] })
  }

  const handleApprovePatrol = async (patrolId: string) => {
    try {
      await updateClientData("safety_patrols", patrolId, {
        status: "approved",
        updated_at: new Date().toISOString(),
      })

      toast({
        title: "成功",
        description: "安全パトロールを承認しました",
      })

      // データを再取得
      queryClient.invalidateQueries({ queryKey: ["safetyPatrols"] })
    } catch (error) {
      console.error("安全パトロール承認エラー:", error)
      toast({
        title: "エラー",
        description: "安全パトロールの承認に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleRejectPatrol = async (patrolId: string) => {
    try {
      await updateClientData("safety_patrols", patrolId, {
        status: "rejected",
        updated_at: new Date().toISOString(),
      })

      toast({
        title: "成功",
        description: "安全パトロールを差し戻しました",
      })

      // データを再取得
      queryClient.invalidateQueries({ queryKey: ["safetyPatrols"] })
    } catch (error) {
      console.error("安全パトロール差し戻しエラー:", error)
      toast({
        title: "エラー",
        description: "安全パトロールの差し戻しに失敗しました",
        variant: "destructive",
      })
    }
  }

  const getChecklistStatusBadge = (status: string) => {
    switch (status) {
      case "good":
        return <Badge className="bg-green-500 hover:bg-green-600">◎</Badge>
      case "warning":
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
    const checklist = patrol.checklist_json
    let warningCount = 0
    let dangerCount = 0

    if (checklist) {
      Object.values(checklist).forEach((status: any) => {
        if (status === "warning") warningCount++
        if (status === "danger") dangerCount++
      })
    }

    return { warningCount, dangerCount }
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
              安全パトロールテーブルが存在しません。データベースが正しく設定されていることを確認してください。
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
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    表示する巡視日誌はありません
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b">
                    <td className="px-4 py-3">{log.projectName}</td>
                    <td className="px-4 py-3">{log.inspectionDate}</td>
                    <td className="px-4 py-3">{log.inspectorName}</td>
                    <td className="px-4 py-3">{log.comment}</td>
                    <td className="px-4 py-3">{log.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          詳細
                        </Button>
                        <Button variant="outline" size="sm">
                          編集
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
