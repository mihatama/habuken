"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Check, X, AlertTriangle, Calendar, ImageIcon, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SafetyPatrolForm } from "./safety-patrol-form"
import { useToast } from "@/hooks/use-toast"
import { fetchClientData, updateClientData, getClientSupabase } from "@/lib/supabase-utils"
import { useQuery, useQueryClient } from "@tanstack/react-query"

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>安全・環境巡視日誌</CardTitle>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[250px]"
          />
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新規作成
          </Button>
          <SafetyPatrolForm
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onSuccess={handleAddPatrolSuccess}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">すべて</TabsTrigger>
            <TabsTrigger value="pending">承認待ち</TabsTrigger>
            <TabsTrigger value="approved">承認済</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>対象工事</TableHead>
                  <TableHead>巡視日</TableHead>
                  <TableHead>巡視者</TableHead>
                  <TableHead>指摘事項</TableHead>
                  <TableHead>コメント</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      読み込み中...
                    </TableCell>
                  </TableRow>
                ) : filteredPatrols.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      該当する巡視日誌はありません
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatrols.map((patrol) => {
                    const { warningCount, dangerCount } = countIssues(patrol)
                    return (
                      <TableRow key={patrol.id}>
                        <TableCell className="font-medium">{patrol.projectName}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{new Date(patrol.patrol_date).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>{patrol.inspectorName}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {dangerCount > 0 && (
                              <Badge className="bg-red-500">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                危険: {dangerCount}
                              </Badge>
                            )}
                            {warningCount > 0 && (
                              <Badge className="bg-yellow-500">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                注意: {warningCount}
                              </Badge>
                            )}
                            {dangerCount === 0 && warningCount === 0 && (
                              <Badge className="bg-green-500">
                                <Check className="h-3 w-3 mr-1" />
                                良好
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{patrol.comment}</TableCell>
                        <TableCell>{getStatusBadge(patrol.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Dialog
                              open={isViewDialogOpen && currentPatrol?.id === patrol.id}
                              onOpenChange={(open) => {
                                setIsViewDialogOpen(open)
                                if (open) setCurrentPatrol(patrol)
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setCurrentPatrol(patrol)
                                    setIsViewDialogOpen(true)
                                  }}
                                >
                                  詳細
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>安全・環境巡視日誌詳細</DialogTitle>
                                </DialogHeader>
                                {currentPatrol && (
                                  <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="border rounded-md p-4">
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">対象工事</h3>
                                        <p className="font-medium">{currentPatrol.projectName}</p>
                                      </div>
                                      <div className="border rounded-md p-4">
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">巡視者</h3>
                                        <p className="font-medium">{currentPatrol.inspectorName}</p>
                                      </div>
                                    </div>
                                    <div className="border rounded-md p-4">
                                      <h3 className="text-sm font-medium text-muted-foreground mb-1">巡視日</h3>
                                      <p className="font-medium">
                                        {new Date(currentPatrol.patrol_date).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div className="border rounded-md p-4">
                                      <h3 className="text-sm font-medium text-muted-foreground mb-1">チェックリスト</h3>
                                      <div className="grid grid-cols-2 gap-4 mt-2">
                                        {checklistItems.map((item) => (
                                          <div key={item.id} className="flex justify-between items-center">
                                            <span>{item.label}</span>
                                            {getChecklistStatusBadge(
                                              (currentPatrol.checklist_json as any)?.[item.id] || "good",
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="border rounded-md p-4">
                                      <h3 className="text-sm font-medium text-muted-foreground mb-1">コメント</h3>
                                      <p>{currentPatrol.comment}</p>
                                    </div>
                                    <div className="border rounded-md p-4">
                                      <h3 className="text-sm font-medium text-muted-foreground mb-1">添付写真</h3>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {currentPatrol.photos && currentPatrol.photos.length > 0 ? (
                                          currentPatrol.photos.map((photo: string, index: number) => (
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
                                    {currentPatrol.status === "pending" && (
                                      <div className="flex justify-end space-x-2 mt-4">
                                        <Button
                                          variant="outline"
                                          className="bg-red-50 hover:bg-red-100 text-red-600"
                                          onClick={() => {
                                            handleRejectPatrol(currentPatrol.id)
                                            setIsViewDialogOpen(false)
                                          }}
                                        >
                                          <X className="h-4 w-4 mr-2" />
                                          差戻し
                                        </Button>
                                        <Button
                                          className="bg-green-600 hover:bg-green-700"
                                          onClick={() => {
                                            handleApprovePatrol(currentPatrol.id)
                                            setIsViewDialogOpen(false)
                                          }}
                                        >
                                          <Check className="h-4 w-4 mr-2" />
                                          承認
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            {patrol.status === "pending" && (
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="bg-red-50 hover:bg-red-100 text-red-600"
                                  onClick={() => handleRejectPatrol(patrol.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="bg-green-50 hover:bg-green-100 text-green-600"
                                  onClick={() => handleApprovePatrol(patrol.id)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
