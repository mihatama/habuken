"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Textarea } from "../components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAddLeaveRequest, useLeaveRequests, useUpdateLeaveRequest } from "../hooks/use-leave-requests"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { useToast } from "../components/ui/use-toast"
import { getSupabaseClient } from "../lib/supabase/client" // 修正: 新しいインポートパスに変更

// フォームのバリデーションスキーマ
const formSchema = z.object({
  leaveType: z.string({
    required_error: "休暇タイプを選択してください",
  }),
  startDate: z.string({
    required_error: "開始日を入力してください",
  }),
  endDate: z.string({
    required_error: "終了日を入力してください",
  }),
  reason: z.string().min(5, {
    message: "理由は5文字以上で入力してください",
  }),
})

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
    full_name: string
  }
}

export function LeaveRequestManagement() {
  const [open, setOpen] = useState(false)
  const { data: leaveRequests, isLoading, error } = useLeaveRequests()
  const addLeaveRequest = useAddLeaveRequest()
  const updateLeaveRequest = useUpdateLeaveRequest()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      leaveType: "",
      startDate: "",
      endDate: "",
      reason: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Supabaseクライアントを取得
      const supabase = getSupabaseClient()

      // 現在のユーザー情報を取得
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "エラー",
          description: "ユーザー情報を取得できませんでした",
          variant: "destructive",
        })
        return
      }

      // 休暇申請を追加
      await addLeaveRequest.mutateAsync({
        userId: user.id,
        leaveType: values.leaveType,
        startDate: values.startDate,
        endDate: values.endDate,
        reason: values.reason,
      })

      toast({
        title: "申請完了",
        description: "休暇申請が送信されました",
      })

      setOpen(false)
      form.reset()
    } catch (error) {
      console.error("休暇申請エラー:", error)
      toast({
        title: "エラー",
        description: "休暇申請の送信に失敗しました",
        variant: "destructive",
      })
    }
  }

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
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>新規申請</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>休暇申請</DialogTitle>
              <DialogDescription>
                休暇の申請内容を入力してください。申請後は承認されるまでお待ちください。
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="leaveType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>休暇タイプ</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="休暇タイプを選択" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="annual">年次有給休暇</SelectItem>
                          <SelectItem value="sick">病気休暇</SelectItem>
                          <SelectItem value="special">特別休暇</SelectItem>
                          <SelectItem value="other">その他</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>開始日</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>終了日</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>理由</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={addLeaveRequest.isPending}>
                    {addLeaveRequest.isPending ? "送信中..." : "申請する"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
                {request.staff?.full_name || "名前なし"} -
                {request.status === "pending" ? "審査中" : request.status === "approved" ? "承認済" : "却下"}
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
