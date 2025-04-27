"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { getLeaveTypeName } from "@/lib/data-utils"
import { useLeaveRequests, useStaff, useAddLeaveRequest, useUpdateLeaveRequest } from "@/hooks/use-leave-requests"

export function LeaveRequestManagement() {
  // React Queryフックを使用してデータを取得
  const { data: requests = [], isLoading } = useLeaveRequests()
  const { data: staff = [] } = useStaff()
  const addLeaveRequestMutation = useAddLeaveRequest()
  const updateLeaveRequestMutation = useUpdateLeaveRequest()

  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [currentRequest, setCurrentRequest] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("pending")
  const [rejectReason, setRejectReason] = useState("")
  const [newRequest, setNewRequest] = useState({
    userId: "",
    leaveType: "paid",
    startDate: "",
    endDate: "",
    reason: "",
  })

  const filteredRequests = requests.filter(
    (request) =>
      (request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getLeaveTypeName(request.leave_type).toLowerCase().includes(searchTerm.toLowerCase())) &&
      (activeTab === "all" ||
        (activeTab === "pending" && request.status === "pending") ||
        (activeTab === "approved" && request.status === "approved") ||
        (activeTab === "rejected" && request.status === "rejected")),
  )

  const handleAddRequest = async () => {
    if (!newRequest.userId || !newRequest.startDate || !newRequest.endDate) return

    try {
      await addLeaveRequestMutation.mutateAsync(newRequest)

      toast({
        title: "成功",
        description: "休暇申請を送信しました",
      })

      setIsAddDialogOpen(false)
      setNewRequest({
        userId: "",
        leaveType: "paid",
        startDate: "",
        endDate: "",
        reason: "",
      })
    } catch (error) {
      console.error("休暇申請エラー:", error)
      toast({
        title: "エラー",
        description: "休暇申請の送信に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleApproveRequest = async () => {
    if (!currentRequest) return

    try {
      await updateLeaveRequestMutation.mutateAsync({
        id: currentRequest.id,
        status: "approved",
        userId: currentRequest.staff_id,
        startDate: currentRequest.start_date,
        endDate: currentRequest.end_date,
        leaveType: currentRequest.leave_type,
      })

      toast({
        title: "成功",
        description: "休暇申請を承認しました",
      })

      setIsApproveDialogOpen(false)
    } catch (error) {
      console.error("休暇申請承認エラー:", error)
      toast({
        title: "エラー",
        description: "休暇申請の承認に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleRejectRequest = async () => {
    if (!currentRequest) return

    try {
      await updateLeaveRequestMutation.mutateAsync({
        id: currentRequest.id,
        status: "rejected",
        rejectReason: rejectReason,
      })

      toast({
        title: "成功",
        description: "休暇申請を否認しました",
      })

      setRejectReason("")
      setIsRejectDialogOpen(false)
    } catch (error) {
      console.error("休暇申請否認エラー:", error)
      toast({
        title: "エラー",
        description: "休暇申請の否認に失敗しました",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">承認待ち</Badge>
      case "approved":
        return <Badge className="bg-green-500 hover:bg-green-600">承認済</Badge>
      case "rejected":
        return <Badge className="bg-red-500 hover:bg-red-600">否認</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // 残りのコンポーネントコードは同じ...

  return <Card>{/* 既存のJSXコードをそのまま使用 */}</Card>
}
