"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LeaveRequestForm } from "./leave-request-form"
import { useToast } from "@/components/ui/use-toast"
import { getLeaveTypeName } from "@/lib/supabase-utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { useAuth } from "@/contexts/auth-context"

type LeaveRequest = {
  id: string
  staff_id: string
  staff_name?: string
  start_date: string
  end_date: string
  leave_type: string | null
  leave_duration: string | null
  reason: string
  status: "pending" | "approved" | "rejected"
  created_at: string
}

export function LeaveRequestManagement() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null)

  // ユーザーが管理者かどうかを確認
  const isAdmin = user?.user_metadata?.role === "admin"

  // 一般ユーザーの場合は、初期タブを「承認済み」に設定
  useEffect(() => {
    if (!isAdmin) {
      setActiveTab("approved")
    }
  }, [isAdmin])

  const fetchLeaveRequests = async () => {
    try {
      setIsLoading(true)

      // APIエンドポイントを使用してデータを取得
      const response = await fetch("/api/leave-requests", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("休暇申請データの取得に失敗しました")
      }

      const data = await response.json()
      console.log("Fetched leave requests:", data.data)

      // 一般ユーザーの場合は承認済みの申請のみをフィルタリング
      if (!isAdmin) {
        setLeaveRequests(data.data.filter((request: LeaveRequest) => request.status === "approved"))
      } else {
        setLeaveRequests(data.data)
      }
    } catch (error) {
      console.error("休暇申請データ取得エラー:", error)
      toast({
        title: "エラー",
        description: "休暇申請データの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveRequest = async (requestId: string) => {
    try {
      setProcessingRequestId(requestId)

      // APIエンドポイントを使用して承認処理を実行
      const response = await fetch(`/api/leave-requests/${requestId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "休暇申請の承認に失敗しました")
      }

      toast({
        title: "承認完了",
        description: "休暇申請が承認されました",
        variant: "default",
      })

      // データを再取得して表示を更新
      fetchLeaveRequests()
    } catch (error: any) {
      console.error("休暇申請承認エラー:", error)
      toast({
        title: "エラー",
        description: error.message || "休暇申請の承認に失敗しました",
        variant: "destructive",
      })
    } finally {
      setProcessingRequestId(null)
    }
  }

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
  }

  const handleSuccess = () => {
    fetchLeaveRequests()
  }

  const getLeaveTypeBadge = (type: string | null) => {
    if (!type) return "未分類"

    return getLeaveTypeName(type)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            審査中
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
            却下
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getLeaveDurationText = (duration: string | null | undefined) => {
    if (!duration) return "終日"

    switch (duration) {
      case "am_only":
        return "午前のみ"
      case "pm_only":
        return "午後のみ"
      case "full_day":
      default:
        return "終日"
    }
  }

  const filteredRequests =
    activeTab === "all" ? leaveRequests : leaveRequests.filter((request) => request.status === activeTab)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>休暇申請管理</CardTitle>
          <CardDescription>休暇申請の作成と管理を行います</CardDescription>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>新規申請</Button>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue={isAdmin ? "all" : "approved"}
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-4">
            {/* 管理者のみ全てのタブを表示 */}
            {isAdmin ? (
              <>
                <TabsTrigger value="all">すべて</TabsTrigger>
                <TabsTrigger value="pending">審査中</TabsTrigger>
                <TabsTrigger value="approved">承認済</TabsTrigger>
                <TabsTrigger value="rejected">却下</TabsTrigger>
              </>
            ) : (
              // 一般ユーザーは承認済みタブのみ表示
              <TabsTrigger value="approved">承認済</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="text-center py-8">読み込み中...</div>
            ) : filteredRequests.length > 0 ? (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{request.staff_name}</div>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      {format(new Date(request.start_date), "yyyy年MM月dd日", { locale: ja })} 〜{" "}
                      {format(new Date(request.end_date), "yyyy年MM月dd日", { locale: ja })}
                    </div>
                    <div className="text-sm mb-2">
                      <span className="font-medium">休暇種類:</span> {getLeaveTypeBadge(request.leave_type)}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">時間帯: </span>
                      {request.leave_duration === "am_only"
                        ? "午前のみ"
                        : request.leave_duration === "pm_only"
                          ? "午後のみ"
                          : "終日"}
                    </div>
                    <div className="text-sm mb-3">
                      <span className="font-medium">理由:</span> {request.reason}
                    </div>

                    {/* 管理者のみ審査中の申請に対して承認ボタンを表示 */}
                    {isAdmin && request.status === "pending" && (
                      <div className="flex justify-end mt-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveRequest(request.id)}
                          disabled={processingRequestId === request.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {processingRequestId === request.id ? "処理中..." : "承認する"}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">表示する休暇申請がありません</div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Dialog component rendered directly */}
      {isDialogOpen && (
        <LeaveRequestForm open={isDialogOpen} onOpenChange={handleDialogOpenChange} onSuccess={handleSuccess} />
      )}
    </Card>
  )
}
