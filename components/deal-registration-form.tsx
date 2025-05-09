"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { getClientSupabase } from "@/lib/supabase-utils"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResourceSelector } from "@/components/resource-selector"

// 案件登録フォームのスキーマ
const dealFormSchema = z.object({
  name: z.string().min(1, {
    message: "案件名を入力してください",
  }),
  client_name: z.string().optional(), // クライアント名を任意に変更
  start_date: z
    .date({
      required_error: "開始予定日を選択してください",
    })
    .refine(
      (date) => {
        // 開始日は本日以降であることを確認
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return date >= today
      },
      {
        message: "開始予定日は本日以降の日付を選択してください",
      },
    ),
  end_date: z
    .date({
      required_error: "終了予定日を選択してください",
    })
    .optional()
    .refine(
      (date, ctx) => {
        // 終了日が指定されている場合、開始日以降であることを確認
        if (date && ctx.parent && ctx.parent.start_date) {
          return date >= ctx.parent.start_date
        }
        return true
      },
      {
        message: "終了予定日は開始予定日以降の日付を選択してください",
      },
    ),
  location: z.string().optional(), // 場所を任意に変更
  status: z.string().optional(), // ステータスを任意に変更
  description: z.string().default(""),
})

type DealFormValues = z.infer<typeof dealFormSchema>

interface DealRegistrationFormProps {
  onSuccess?: () => void
}

export function DealRegistrationForm({ onSuccess }: DealRegistrationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<{ id: string; startDate: string; endDate: string | null }[]>([])
  const [selectedMachinery, setSelectedMachinery] = useState<
    { id: string; startDate: string; endDate: string | null }[]
  >([])
  const [selectedVehicles, setSelectedVehicles] = useState<{ id: string; startDate: string; endDate: string | null }[]>(
    [],
  )
  const [selectedTools, setSelectedTools] = useState<{ id: string; startDate: string; endDate: string | null }[]>([])

  // 新規案件作成時のデフォルト値を「pendding」から「未選択」に変更
  const defaultValues: Partial<DealFormValues> = {
    name: "",
    client_name: "",
    status: "未選択",
    description: "",
    location: "",
  }

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    defaultValues,
  })

  // フォームの値を監視して、リソースの日付を更新
  const watchStartDate = form.watch("start_date")
  const watchEndDate = form.watch("end_date")

  // 日付が変更されたときにリソースの日付を更新する関数
  const updateResourceDates = () => {
    const startDate = watchStartDate ? format(watchStartDate, "yyyy-MM-dd") : ""
    const endDate = watchEndDate ? format(watchEndDate, "yyyy-MM-dd") : null

    // 各リソースの日付を更新
    if (startDate) {
      setSelectedStaff((prev) =>
        prev.map((item) => ({
          ...item,
          startDate: item.startDate || startDate,
          endDate: item.endDate || endDate,
        })),
      )
      setSelectedMachinery((prev) =>
        prev.map((item) => ({
          ...item,
          startDate: item.startDate || startDate,
          endDate: item.endDate || endDate,
        })),
      )
      setSelectedVehicles((prev) =>
        prev.map((item) => ({
          ...item,
          startDate: item.startDate || startDate,
          endDate: item.endDate || endDate,
        })),
      )
      setSelectedTools((prev) =>
        prev.map((item) => ({
          ...item,
          startDate: item.startDate || startDate,
          endDate: item.endDate || endDate,
        })),
      )
    }
  }

  // Helper function to handle resource assignments with error handling
  const handleResourceAssignment = async (
    supabase: any,
    tableName: string,
    resources: any[],
    dealId: string,
    resourceIdField: string,
    includeStartEndDates = true,
  ) => {
    if (resources.length === 0) return

    try {
      const assignments = resources.map((resource) => {
        // Base assignment with just the IDs
        const assignment: Record<string, any> = {
          deal_id: dealId,
          [resourceIdField]: resource.id,
        }

        // Only include dates if specified
        if (includeStartEndDates) {
          assignment.start_date = resource.startDate
          assignment.end_date = resource.endDate
        }

        return assignment
      })

      const { error } = await supabase.from(tableName).insert(assignments)

      if (error) {
        console.error(`${tableName} assignment error:`, error)
        toast({
          title: "警告",
          description: `${tableName}の割り当てに問題がありましたが、案件は登録されました。`,
          variant: "warning",
        })
      }
    } catch (error) {
      console.error(`Failed to assign ${tableName}:`, error)
      toast({
        title: "警告",
        description: `${tableName}の割り当てに失敗しましたが、案件は登録されました。`,
        variant: "warning",
      })
    }
  }

  async function onSubmit(data: DealFormValues) {
    setIsSubmitting(true)
    try {
      const supabase = getClientSupabase()

      // ユーザー情報を取得
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "エラー",
          description: "ユーザー情報が取得できませんでした。再ログインしてください。",
          variant: "destructive",
        })
        return
      }

      // 案件データを登録
      const { data: deal, error } = await supabase
        .from("deals")
        .insert({
          name: data.name,
          client_name: data.client_name || "", // nullではなく空文字列を使用
          start_date: format(data.start_date, "yyyy-MM-dd"),
          end_date: data.end_date ? format(data.end_date, "yyyy-MM-dd") : null,
          location: data.location || "", // nullではなく空文字列を使用
          status: data.status || "計画中", // 未選択の場合はデフォルト値を使用
          description: data.description || "",
          created_by: user.id,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // リソースの割り当て - 各リソースタイプごとに処理
      // スタッフの割り当て
      await handleResourceAssignment(supabase, "deal_staff", selectedStaff, deal.id, "staff_id", true)

      // 重機の割り当て
      await handleResourceAssignment(supabase, "deal_machinery", selectedMachinery, deal.id, "machinery_id", true)

      // 車両の割り当て - 日付フィールドを含める
      await handleResourceAssignment(supabase, "deal_vehicles", selectedVehicles, deal.id, "vehicle_id", true)

      // 備品の割り当て
      await handleResourceAssignment(supabase, "deal_tools", selectedTools, deal.id, "tool_id", true)

      toast({
        title: "案件登録完了",
        description: "案件情報が正常に登録されました。",
      })

      // フォームをリセット
      form.reset()
      setSelectedStaff([])
      setSelectedMachinery([])
      setSelectedVehicles([])
      setSelectedTools([])

      // 成功時のコールバックがあれば実行（モーダルを閉じるなど）
      if (onSuccess) {
        onSuccess()
      }

      // 画面を更新
      router.refresh()
    } catch (error: any) {
      console.error("案件登録エラー:", error)
      toast({
        title: "エラー",
        description: `案件の登録に失敗しました: ${error.message || "不明なエラー"}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="py-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="basic">基本情報</TabsTrigger>
              <TabsTrigger value="staff">スタッフ</TabsTrigger>
              <TabsTrigger value="machinery">重機</TabsTrigger>
              <TabsTrigger value="vehicles">車両</TabsTrigger>
              <TabsTrigger value="tools">備品</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>案件名 *</FormLabel>
                      <FormControl>
                        <Input placeholder="例: ○○ビル建設工事" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="client_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>クライアント名</FormLabel>
                      <FormControl>
                        <Input placeholder="例: 株式会社○○" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>開始予定日 *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                              onClick={() => updateResourceDates()}
                            >
                              {field.value ? (
                                format(field.value, "yyyy年MM月dd日", { locale: ja })
                              ) : (
                                <span>日付を選択</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date)
                              updateResourceDates()
                            }}
                            disabled={(date) => {
                              // 本日より前の日付を無効化
                              const today = new Date()
                              today.setHours(0, 0, 0, 0)
                              return date < today
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>終了予定日</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                              onClick={() => updateResourceDates()}
                            >
                              {field.value ? (
                                format(field.value, "yyyy年MM月dd日", { locale: ja })
                              ) : (
                                <span>日付を選択</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={(date) => {
                              field.onChange(date)
                              updateResourceDates()
                            }}
                            disabled={(date) => {
                              // 開始日より前の日付を無効化
                              const startDate = form.getValues("start_date")
                              // 開始日が設定されていない場合は本日より前の日付を無効化
                              if (!startDate) {
                                const today = new Date()
                                today.setHours(0, 0, 0, 0)
                                return date < today
                              }
                              return date < startDate
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>終了日が未定の場合は空欄でも構いません</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>場所</FormLabel>
                      <FormControl>
                        <Input placeholder="例: 東京都新宿区○○" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ステータス</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="ステータスを選択" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="未選択">未選択</SelectItem>
                          <SelectItem value="計画中">計画中</SelectItem>
                          <SelectItem value="準備中">準備中</SelectItem>
                          <SelectItem value="進行中">進行中</SelectItem>
                          <SelectItem value="完了">完了</SelectItem>
                          <SelectItem value="中断">中断</SelectItem>
                          <SelectItem value="キャンセル">キャンセル</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>案件詳細</FormLabel>
                    <FormControl>
                      <Textarea placeholder="案件の詳細情報を入力してください" className="min-h-[120px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="staff" className="pt-4">
              <ResourceSelector
                resourceType="staff"
                selectedResources={selectedStaff}
                onSelectedResourcesChange={setSelectedStaff}
                startDate={watchStartDate ? format(watchStartDate, "yyyy-MM-dd") : ""}
                endDate={watchEndDate ? format(watchEndDate, "yyyy-MM-dd") : null}
              />
            </TabsContent>

            <TabsContent value="machinery" className="pt-4">
              <ResourceSelector
                resourceType="machinery"
                selectedResources={selectedMachinery}
                onSelectedResourcesChange={setSelectedMachinery}
                startDate={watchStartDate ? format(watchStartDate, "yyyy-MM-dd") : ""}
                endDate={watchEndDate ? format(watchEndDate, "yyyy-MM-dd") : null}
              />
            </TabsContent>

            <TabsContent value="vehicles" className="pt-4">
              <ResourceSelector
                resourceType="vehicles"
                selectedResources={selectedVehicles}
                onSelectedResourcesChange={setSelectedVehicles}
                startDate={watchStartDate ? format(watchStartDate, "yyyy-MM-dd") : ""}
                endDate={watchEndDate ? format(watchEndDate, "yyyy-MM-dd") : null}
              />
            </TabsContent>

            <TabsContent value="tools" className="pt-4">
              <ResourceSelector
                resourceType="tools"
                selectedResources={selectedTools}
                onSelectedResourcesChange={setSelectedTools}
                startDate={watchStartDate ? format(watchStartDate, "yyyy-MM-dd") : ""}
                endDate={watchEndDate ? format(watchEndDate, "yyyy-MM-dd") : null}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onSuccess} disabled={isSubmitting}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              登録する
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
