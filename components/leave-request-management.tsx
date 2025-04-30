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

type LeaveRequest = {
  id: string
  staff_id: string
  staff_name?: string
  start_date: string
  end_date: string
  leave_type: string | null
  reason: string
  status: "pending" | "approved" | "rejected"
  created_at: string
}

export function LeaveRequestManagement() {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

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
      setLeaveRequests(data.data)
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
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">すべて</TabsTrigger>
            <TabsTrigger value="pending">審査中</TabsTrigger>
            <TabsTrigger value="approved">承認済</TabsTrigger>
            <TabsTrigger value="rejected">却下</TabsTrigger>
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
                      <span className="font-medium">理由:</span> {request.reason}
                    </div>
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
