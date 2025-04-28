"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLeaveRequests, useUpdateLeaveRequest } from "../hooks/use-leave-requests"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { useToast } from "../components/ui/use-toast"
import { LeaveRequestForm } from "./leave-request-form"

type LeaveRequest = {
  id: string
  staff_id: string
  leave_type: string
  start_date: string
  end_date: string
  reason: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  staff?: {
    name: string
  }
}

export function LeaveRequestManagement() {
  const [open, setOpen] = useState(false)
  const { data: leaveRequests, isLoading, error, refetch } = useLeaveRequests()
  const updateLeaveRequest = useUpdateLeaveRequest()
  const { toast } = useToast()

  const handleStatusChange = async (requestId: string, newStatus: "approved" | "rejected") => {
    try {
      await updateLeaveRequest.mutateAsync({
        id: requestId,
        status: newStatus,
      })

      toast({
        title: "更新完了",
        description: `休暇申請が${newStatus === "approved" ? "承認" : "却下"}されました`,
      })
    } catch (error) {
      console.error("ステータス更新エラー:", error)
      toast({
        title: "エラー",
        description: "ステータスの更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div>読み込み中...</div>
  }

  if (error) {
    return <div>エラーが発生しました: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">休暇申請一覧</h2>
        <Button onClick={() => setOpen(true)}>新規申請</Button>
        <LeaveRequestForm open={open} onOpenChange={setOpen} onSuccess={() => refetch()} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {leaveRequests?.map((request: LeaveRequest) => (
          <Card key={request.id}>
            <CardHeader>
              <CardTitle>
                {request.leave_type === "annual"
                  ? "年次有給休暇"
                  : request.leave_type === "sick"
                    ? "病気休暇"
                    : request.leave_type === "special"
                      ? "特別休暇"
                      : "その他"}
              </CardTitle>
              <CardDescription>
                {request.staff?.name || "名前なし"} -
                {request.status === "pending" ? (
                  <Badge className="bg-yellow-500 hover:bg-yellow-600">審査中</Badge>
                ) : request.status === "approved" ? (
                  <Badge className="bg-green-500 hover:bg-green-600">承認済</Badge>
                ) : (
                  <Badge className="bg-red-500 hover:bg-red-600">却下</Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium">期間:</div>
                  <div className="text-sm">
                    {format(new Date(request.start_date), "yyyy年MM月dd日", { locale: ja })} -
                    {format(new Date(request.end_date), "yyyy年MM月dd日", { locale: ja })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium">申請日:</div>
                  <div className="text-sm">
                    {format(new Date(request.created_at), "yyyy年MM月dd日", { locale: ja })}
                  </div>
                </div>
                <div className="pt-2">
                  <div className="text-sm font-medium">理由:</div>
                  <div className="text-sm mt-1">{request.reason}</div>
                </div>
                {request.status === "pending" && (
                  <div className="flex space-x-2 pt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleStatusChange(request.id, "approved")}
                      disabled={updateLeaveRequest.isPending}
                    >
                      承認
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleStatusChange(request.id, "rejected")}
                      disabled={updateLeaveRequest.isPending}
                    >
                      却下
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {leaveRequests?.length === 0 && (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">休暇申請はありません</p>
          </div>
        )}
      </div>
    </div>
  )
}
