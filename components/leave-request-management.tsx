"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Check, X, AlertCircle, Calendar, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { sampleStaff, leaveRequests, updateLeaveRequest, getLeaveTypeName } from "@/data/sample-data"

export function LeaveRequestManagement() {
  const [requests, setRequests] = useState(leaveRequests)
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
        getLeaveTypeName(request.leaveType).toLowerCase().includes(searchTerm.toLowerCase())) &&
      (activeTab === "all" ||
        (activeTab === "pending" && request.status === "pending") ||
        (activeTab === "approved" && request.status === "approved") ||
        (activeTab === "rejected" && request.status === "rejected")),
  )

  const handleAddRequest = () => {
    if (!newRequest.userId || !newRequest.startDate || !newRequest.endDate) return

    const userId = Number.parseInt(newRequest.userId)
    const user = sampleStaff.find((s) => s.id === userId)

    if (!user) return

    const request = {
      id: requests.length + 1,
      userId,
      userName: user.name,
      leaveType: newRequest.leaveType,
      startDate: new Date(newRequest.startDate),
      endDate: new Date(newRequest.endDate),
      reason: newRequest.reason,
      status: "pending",
      rejectReason: "",
      createdAt: new Date(),
    }

    const updatedRequests = [...requests, request]
    setRequests(updatedRequests)
    setNewRequest({
      userId: "",
      leaveType: "paid",
      startDate: "",
      endDate: "",
      reason: "",
    })
    setIsAddDialogOpen(false)
  }

  const handleApproveRequest = () => {
    if (!currentRequest) return

    const updatedRequest = { ...currentRequest, status: "approved" }

    // グローバルデータを更新（年休一覧に自動登録）
    updateLeaveRequest(updatedRequest)

    // ローカル状態を更新
    const updatedRequests = requests.map((request) => (request.id === currentRequest.id ? updatedRequest : request))
    setRequests(updatedRequests)
    setIsApproveDialogOpen(false)
  }

  const handleRejectRequest = () => {
    if (!currentRequest) return

    const updatedRequest = { ...currentRequest, status: "rejected", rejectReason }

    // グローバルデータを更新
    updateLeaveRequest(updatedRequest)

    // ローカル状態を更新
    const updatedRequests = requests.map((request) => (request.id === currentRequest.id ? updatedRequest : request))
    setRequests(updatedRequests)
    setRejectReason("")
    setIsRejectDialogOpen(false)
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>休暇申請管理</CardTitle>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[250px]"
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新規申請
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>休暇申請</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="userId">申請者</Label>
                  <Select
                    value={newRequest.userId}
                    onValueChange={(value) => setNewRequest({ ...newRequest, userId: value })}
                  >
                    <SelectTrigger id="userId">
                      <SelectValue placeholder="申請者を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {sampleStaff.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id.toString()}>
                          {staff.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="leaveType">休暇種類</Label>
                  <Select
                    value={newRequest.leaveType}
                    onValueChange={(value) => setNewRequest({ ...newRequest, leaveType: value })}
                  >
                    <SelectTrigger id="leaveType">
                      <SelectValue placeholder="休暇種類を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">有給休暇</SelectItem>
                      <SelectItem value="compensatory">振替休日</SelectItem>
                      <SelectItem value="special">特別休暇</SelectItem>
                      <SelectItem value="absent">欠勤</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">開始日</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newRequest.startDate}
                      onChange={(e) => setNewRequest({ ...newRequest, startDate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">終了日</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newRequest.endDate}
                      onChange={(e) => setNewRequest({ ...newRequest, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reason">理由</Label>
                  <Textarea
                    id="reason"
                    value={newRequest.reason}
                    onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                    placeholder="休暇の理由を入力してください"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddRequest}>
                  申請
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="pending">承認待ち</TabsTrigger>
            <TabsTrigger value="approved">承認済</TabsTrigger>
            <TabsTrigger value="rejected">否認</TabsTrigger>
            <TabsTrigger value="all">すべて</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>申請者</TableHead>
                  <TableHead>休暇種類</TableHead>
                  <TableHead>期間</TableHead>
                  <TableHead>理由</TableHead>
                  <TableHead>申請日</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.userName}</TableCell>
                    <TableCell>{getLeaveTypeName(request.leaveType)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {request.startDate.toLocaleDateString()}
                          {request.startDate.getTime() !== request.endDate.getTime() &&
                            ` 〜 ${request.endDate.toLocaleDateString()}`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{request.reason}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{request.createdAt.toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {request.status === "pending" && (
                          <>
                            <Dialog
                              open={isApproveDialogOpen && currentRequest?.id === request.id}
                              onOpenChange={(open) => {
                                setIsApproveDialogOpen(open)
                                if (open) setCurrentRequest(request)
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="bg-green-50 hover:bg-green-100 text-green-600"
                                  onClick={() => {
                                    setCurrentRequest(request)
                                    setIsApproveDialogOpen(true)
                                  }}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>休暇申請の承認</DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                  <p>
                                    {request.userName}さんの{getLeaveTypeName(request.leaveType)}申請を承認しますか？
                                  </p>
                                  <div className="mt-4 p-4 border rounded-md">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <span className="text-sm text-muted-foreground">期間:</span>
                                        <p>
                                          {request.startDate.toLocaleDateString()}
                                          {request.startDate.getTime() !== request.endDate.getTime() &&
                                            ` 〜 ${request.endDate.toLocaleDateString()}`}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-sm text-muted-foreground">申請日:</span>
                                        <p>{request.createdAt.toLocaleDateString()}</p>
                                      </div>
                                    </div>
                                    <div className="mt-2">
                                      <span className="text-sm text-muted-foreground">理由:</span>
                                      <p>{request.reason}</p>
                                    </div>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                                    キャンセル
                                  </Button>
                                  <Button onClick={handleApproveRequest}>承認する</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Dialog
                              open={isRejectDialogOpen && currentRequest?.id === request.id}
                              onOpenChange={(open) => {
                                setIsRejectDialogOpen(open)
                                if (open) setCurrentRequest(request)
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="bg-red-50 hover:bg-red-100 text-red-600"
                                  onClick={() => {
                                    setCurrentRequest(request)
                                    setIsRejectDialogOpen(true)
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>休暇申請の否認</DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                  <p>
                                    {request.userName}さんの{getLeaveTypeName(request.leaveType)}申請を否認しますか？
                                  </p>
                                  <div className="mt-4 p-4 border rounded-md">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <span className="text-sm text-muted-foreground">期間:</span>
                                        <p>
                                          {request.startDate.toLocaleDateString()}
                                          {request.startDate.getTime() !== request.endDate.getTime() &&
                                            ` 〜 ${request.endDate.toLocaleDateString()}`}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-sm text-muted-foreground">申請日:</span>
                                        <p>{request.createdAt.toLocaleDateString()}</p>
                                      </div>
                                    </div>
                                    <div className="mt-2">
                                      <span className="text-sm text-muted-foreground">理由:</span>
                                      <p>{request.reason}</p>
                                    </div>
                                  </div>
                                  <div className="mt-4">
                                    <Label htmlFor="rejectReason">否認理由</Label>
                                    <Textarea
                                      id="rejectReason"
                                      value={rejectReason}
                                      onChange={(e) => setRejectReason(e.target.value)}
                                      placeholder="否認の理由を入力してください"
                                      className="mt-2"
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                                    キャンセル
                                  </Button>
                                  <Button variant="destructive" onClick={handleRejectRequest}>
                                    否認する
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                        {request.status === "rejected" && (
                          <Button variant="outline" size="sm" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            否認理由を表示
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRequests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      該当する申請はありません
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
