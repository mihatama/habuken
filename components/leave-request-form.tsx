"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAddLeaveRequest } from "@/hooks/use-leave-requests"
import { useToast } from "@/components/ui/use-toast"
import { getClientSupabase } from "@/lib/supabase-utils"

// フォームのバリデーションスキーマ
const formSchema = z.object({
  staffId: z.string({
    required_error: "スタッフを選択してください",
  }),
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

interface LeaveRequestFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function LeaveRequestForm({ open, onOpenChange, onSuccess }: LeaveRequestFormProps) {
  const { toast } = useToast()
  const addLeaveRequest = useAddLeaveRequest()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [staffList, setStaffList] = useState<Array<{ id: string; full_name: string }> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setIsLoading(true)
        const supabase = getClientSupabase()
        const { data, error } = await supabase.from("staff").select("id, full_name").order("full_name")

        if (error) throw error
        setStaffList(data || [])
      } catch (error) {
        console.error("スタッフデータ取得エラー:", error)
        toast({
          title: "エラー",
          description: "スタッフデータの取得に失敗しました",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (open) {
      fetchStaff()
    }
  }, [open, toast])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      staffId: "",
      leaveType: "",
      startDate: "",
      endDate: "",
      reason: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)

      // Supabaseクライアントを取得
      const supabase = getClientSupabase()

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
      const { error } = await supabase.from("leave_requests").insert({
        staff_id: values.staffId,
        start_date: values.startDate,
        end_date: values.endDate,
        leave_type: values.leaveType,
        reason: values.reason,
        status: "pending",
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: "申請完了",
        description: "休暇申請が送信されました",
      })

      // フォームをリセット
      form.reset()

      // ダイアログを閉じる
      onOpenChange(false)

      // 成功コールバックを呼び出す
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("休暇申請エラー:", error)
      toast({
        title: "エラー",
        description: "休暇申請の送信に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新規休暇申請</DialogTitle>
          <DialogDescription>
            休暇の申請内容を入力してください。申請後は承認されるまでお待ちください。
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="staffId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    申請者 <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="申請者を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoading ? (
                        <SelectItem value="loading" disabled>
                          読み込み中...
                        </SelectItem>
                      ) : staffList && staffList.length > 0 ? (
                        staffList.map((staff) => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {staff.full_name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="empty" disabled>
                          スタッフが見つかりません
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="leaveType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>休暇種類</FormLabel>
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
                  <FormLabel>
                    開始日 <span className="text-red-500">*</span>
                  </FormLabel>
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
                  <FormLabel>
                    終了日 <span className="text-red-500">*</span>
                  </FormLabel>
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
                  <FormLabel>
                    理由 <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="休暇の理由を入力してください" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting || isLoading}>
                申請
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
