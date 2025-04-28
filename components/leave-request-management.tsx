"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Check, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { getLeaveRequestsData, updateLeaveRequestData, getLeaveTypeName } from "@/lib/supabase-utils"
import { LeaveRequestForm } from "./leave-request-form"

export function LeaveRequestManagement() {
  const [leaveRequests, setLeaveRequests] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [currentRequest, setCurrentRequest] = useState<any>(null)
  const [rejectReason, setRejectReason] = useState("")

  const fetchLeaveRequests = async () => {
    setLoading(true)
    try {
      const { data } = await getLeaveRequestsData()
      setLeaveRequests(data || [])
    } catch (error) {
      console.error("休暇申請データ取得エラー:", error)
      toast({
        title: "エラー",
        description: "休暇申請データの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  const handleApproveRequest = async (id: string) => {
    try {
      await updateLeaveRequestData({ id, status: "approved" })
      toast({
        title: "成功",
        description: "休暇申請を承認しました",
      })
      fetchLeaveRequests()
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
      await updateLeaveRequestData({
        id: currentRequest.id,
        status: "rejected",
        rejectReason,
      })
      toast({
        title: "成功",
        description: "休暇申請を却下しました",
      })
      setIsRejectDialogOpen(false)
      setRejectReason("")
      fetchLeaveRequests()
    } catch (error) {
      console.error("休暇申請却下エラー:", error)
      toast({
        title: "エラー",
        description: "休暇申請の却下に失敗しました",
        variant: "destructive",
      })
    }
  }

  const filteredRequests = leaveRequests.filter(
    (request) =>
      request.staff?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">承認待ち</Badge>
      case "approved":
        return <Badge className="bg-green-500 hover:bg-green-600">承認済</Badge>
      case "rejected":
        return <Badge className="bg-red-500 hover:bg-red-600">却下</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>休暇申請管理</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="検索..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新規申請
          </Button>
          <LeaveRequestForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSuccess={fetchLeaveRequests} />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>スタッフ</TableHead>
              <TableHead>休暇種類</TableHead>
              <TableHead>開始日</TableHead>
              <TableHead>終了日</TableHead>
              <TableHead>理由</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  休暇申請が見つかりません
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.staff.name}</TableCell>
                  <TableCell>{getLeaveTypeName(request.leave_type)}</TableCell>
                  <TableCell>{new Date(request.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(request.end_date).toLocaleDateString()}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{request.reason}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-right">
                    {request.status === "pending" && (
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-50 hover:bg-red-100 text-red-600"
                          onClick={() => {
                            setCurrentRequest(request)
                            setIsRejectDialogOpen(true)
                          }}
                        >
                          <X className="h-4 w-4 mr-1" />
                          却下
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-50 hover:bg-green-100 text-green-600"
                          onClick={() => handleApproveRequest(request.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          承認
                        </Button>
                      </div>
                    )}
                    {request.status === "rejected" && request.reject_reason && (
                      <span className="text-sm text-muted-foreground">
                        理由: {request.reject_reason.substring(0, 20)}
                        {request.reject_reason.length > 20 ? "..." : ""}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* 却下理由ダイアログ */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>却下理由</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="rejectReason">却下理由</Label>
                <Textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="却下理由を入力してください"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                キャンセル
              </Button>
              <Button variant="destructive" onClick={handleRejectRequest}>
                却下する
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
