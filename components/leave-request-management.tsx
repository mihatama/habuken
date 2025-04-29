"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Check, X, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { getClientSupabase } from "@/lib/supabase-utils"

export function LeaveRequestManagement() {
  const { toast } = useToast()
  const { user } = useAuth()
  const supabase = getClientSupabase() // シングルトンインスタンスを使用

  const [leaveRequests, setLeaveRequests] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [currentRequest, setCurrentRequest] = useState<any>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [newRequest, setNewRequest] = useState({
    start_date: "",
    end_date: "",
    leave_type: "annual",
    reason: "",
    status: "pending",
  })

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  async function fetchLeaveRequests() {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("leave_requests")
        .select("*, staff:staff_id(*)")
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setLeaveRequests(data || [])
    } catch (error) {
      console.error("休暇申請の取得に失敗しました:", error)
      toast({
        title: "エラー",
        description: "休暇申請の取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function addLeaveRequest() {
    try {
      if (!newRequest.start_date || !newRequest.end_date || !newRequest.reason) {
        toast({
          title: "入力エラー",
          description: "開始日、終了日、理由は必須です",
          variant: "destructive",
        })
        return
      }

      setIsLoading(true)
      const { data, error } = await supabase
        .from("leave_requests")
        .insert([
          {
            ...newRequest,
            staff_id: user?.id,
            created_by: user?.id,
          },
        ])
        .select()

      if (error) {
        throw error
      }

      toast({
        title: "成功",
        description: "休暇申請が正常に作成されました",
      })

      setNewRequest({
        start_date: "",
        end_date: "",
        leave_type: "annual",
        reason: "",
        status: "pending",
      })

      fetchLeaveRequests()
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("休暇申請の作成に失敗しました:", error)
      toast({
        title: "エラー",
        description: "休暇申請の作成に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function approveLeaveRequest(id: string) {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("leave_requests")
        .update({
          status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()

      if (error) {
        throw error
      }

      toast({
        title: "成功",
        description: "休暇申請が承認されました",
      })

      fetchLeaveRequests()
    } catch (error) {
      console.error("休暇申請の承認に失敗しました:", error)
      toast({
        title: "エラー",
        description: "休暇申請の承認に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function rejectLeaveRequest() {
    try {
      if (!currentRequest || !currentRequest.id) {
        throw new Error("申請IDが不明です")
      }

      if (!rejectReason) {
        toast({
          title: "入力エラー",
          description: "却下理由は必須です",
          variant: "destructive",
        })
        return
      }

      setIsLoading(true)
      const { data, error } = await supabase
        .from("leave_requests")
        .update({
          status: "rejected",
          reject_reason: rejectReason,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentRequest.id)
        .select()

      if (error) {
        throw error
      }

      toast({
        title: "成功",
        description: "休暇申請が却下されました",
      })

      setRejectReason("")
      setIsRejectDialogOpen(false)
      fetchLeaveRequests()
    } catch (error) {
      console.error("休暇申請の却下に失敗しました:", error)
      toast({
        title: "エラー",
        description: "休暇申請の却下に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredLeaveRequests = leaveRequests.filter(
    (request) =>
      request.staff?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.leave_type?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">審査中</Badge>
      case "approved":
        return <Badge className="bg-green-500 hover:bg-green-600">承認済</Badge>
      case "rejected":
        return <Badge className="bg-red-500 hover:bg-red-600">却下</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getLeaveTypeBadge = (type: string) => {
    switch (type) {
      case "annual":
        return <Badge variant="outline">年次有給休暇</Badge>
      case "sick":
        return <Badge variant="outline">病気休暇</Badge>
      case "special":
        return <Badge variant="outline">特別休暇</Badge>
      case "other":
        return <Badge variant="outline">その他</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("ja-JP")
  }

  const calculateDuration = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return "-"
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return `${diffDays}日間`
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>休暇申請一覧</CardTitle>
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
                <DialogTitle>新規休暇申請</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start_date">
                      開始日 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={newRequest.start_date}
                      onChange={(e) => setNewRequest({ ...newRequest, start_date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end_date">
                      終了日 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={newRequest.end_date}
                      onChange={(e) => setNewRequest({ ...newRequest, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="leave_type">休暇種類</Label>
                  <select
                    id="leave_type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newRequest.leave_type}
                    onChange={(e) => setNewRequest({ ...newRequest, leave_type: e.target.value })}
                  >
                    <option value="annual">年次有給休暇</option>
                    <option value="sick">病気休暇</option>
                    <option value="special">特別休暇</option>
                    <option value="other">その他</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reason">
                    理由 <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="reason"
                    value={newRequest.reason}
                    onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                    placeholder="休暇の理由を入力してください"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isLoading}>
                  キャンセル
                </Button>
                <Button type="submit" onClick={addLeaveRequest} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  申請
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && leaveRequests.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>申請者</TableHead>
                <TableHead>期間</TableHead>
                <TableHead>休暇種類</TableHead>
                <TableHead>理由</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>申請日</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeaveRequests.length > 0 ? (
                filteredLeaveRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.staff?.full_name || "-"}</TableCell>
                    <TableCell>
                      <div>
                        <div>
                          {formatDate(request.start_date)} 〜 {formatDate(request.end_date)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {calculateDuration(request.start_date, request.end_date)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getLeaveTypeBadge(request.leave_type)}</TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={request.reason}>
                        {request.reason}
                      </div>
                      {request.reject_reason && (
                        <div className="text-sm text-red-500 mt-1" title={request.reject_reason}>
                          却下理由: {request.reject_reason}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{formatDate(request.created_at)}</TableCell>
                    <TableCell className="text-right">
                      {request.status === "pending" && (
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="bg-green-50 hover:bg-green-100 text-green-600"
                            onClick={() => approveLeaveRequest(request.id)}
                            disabled={isLoading}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Dialog
                            open={isRejectDialogOpen && currentRequest?.id === request.id}
                            onOpenChange={(open) => {
                              setIsRejectDialogOpen(open)
                              if (open) setCurrentRequest(request)
                              else setRejectReason("")
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
                                <DialogTitle>休暇申請の却下</DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="reject-reason">
                                    却下理由 <span className="text-red-500">*</span>
                                  </Label>
                                  <Textarea
                                    id="reject-reason"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="却下理由を入力してください"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setIsRejectDialogOpen(false)}
                                  disabled={isLoading}
                                >
                                  キャンセル
                                </Button>
                                <Button
                                  type="submit"
                                  variant="destructive"
                                  onClick={rejectLeaveRequest}
                                  disabled={isLoading}
                                >
                                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                  却下
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    {searchTerm ? "検索条件に一致する休暇申請が見つかりません" : "休暇申請がありません"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
