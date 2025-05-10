"use client"

import type React from "react"

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
import { useToast } from "@/components/ui/use-toast"
import { getClientSupabase } from "@/lib/supabase-utils"

// フォームのバリデーションスキーマを更新します
// 既存のformSchemaを以下のコードに置き換えてください：

const formSchema = z
  .object({
    staffId: z.string({
      required_error: "スタッフを選択してください",
    }),
    leaveType: z.string({
      required_error: "休暇タイプを選択してください",
    }),
    leaveDuration: z.string({
      required_error: "休暇の時間帯を選択してください",
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
  .refine(
    (data) => {
      // 開始日と終了日が入力されている場合のみ比較
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate)
        const end = new Date(data.endDate)
        return end >= start // 終了日が開始日以降であることを確認
      }
      return true
    },
    {
      message: "終了日は開始日と同じか、それ以降の日付を選択してください",
      path: ["endDate"], // エラーを表示するフィールド
    },
  )

interface LeaveRequestFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function LeaveRequestForm({ open, onOpenChange, onSuccess }: LeaveRequestFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [staffList, setStaffList] = useState<Array<{ id: string; full_name: string }> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      staffId: "",
      leaveType: "",
      leaveDuration: "full_day", // Default to full day
      startDate: "",
      endDate: "",
      reason: "",
    },
  })

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const supabase = getClientSupabase()
        console.log("Fetching staff data...")

        const { data, error } = await supabase.from("staff").select("id, full_name").order("full_name")

        if (error) {
          console.error("Staff fetch error:", error)
          throw error
        }

        console.log(`Fetched ${data?.length || 0} staff records`)
        setStaffList(data || [])
      } catch (err: any) {
        console.error("スタッフデータ取得エラー:", err)
        setError(err.message || "スタッフデータの取得に失敗しました")
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

  // onSubmit関数の前に、日付変更時のハンドラーを追加します
  // useFormの後、onSubmit関数の前に以下のコードを追加：

  // 開始日が変更されたときに終了日を自動的に更新
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = e.target.value
    form.setValue("startDate", startDate)

    // 終了日が空か、開始日より前の場合は終了日を開始日と同じに設定
    const endDate = form.getValues("endDate")
    if (!endDate || new Date(endDate) < new Date(startDate)) {
      form.setValue("endDate", startDate)
    }

    // バリデーションを実行
    form.trigger("endDate")
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)
      setError(null)

      console.log("Submitting form with values:", values)

      // APIエンドポイントを使用して休暇申請を作成
      const response = await fetch("/api/leave-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          staff_id: values.staffId,
          start_date: values.startDate,
          end_date: values.endDate,
          reason: values.reason,
          leave_type: values.leaveType,
          leave_duration: values.leaveDuration,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "休暇申請の送信に失敗しました")
      }

      console.log("Leave request submitted successfully", result.data)

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
    } catch (err: any) {
      console.error("休暇申請エラー:", err)
      setError(err.message || "休暇申請の送信に失敗しました")
      toast({
        title: "エラー",
        description: "休暇申請の送信に失敗しました: " + (err.message || err),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // If there's an error with the dialog, render a fallback UI
  if (error && !isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">エラーが発生しました</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>閉じる</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" allowScroll={true}>
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
              name="leaveDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>休暇時間帯</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="休暇の時間帯を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="full_day">終日</SelectItem>
                      <SelectItem value="am_only">午前のみ</SelectItem>
                      <SelectItem value="pm_only">午後のみ</SelectItem>
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
                    <Input
                      type="date"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        handleStartDateChange(e)
                      }}
                    />
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
