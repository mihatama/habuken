"use client"

import { useState, useEffect } from "react"
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResourceSelector } from "@/components/resource-selector"

// 案件編集フォームのスキーマ
const dealFormSchema = z.object({
  name: z.string().min(1, {
    message: "案件名を入力してください",
  }),
  client_name: z.string().optional(), // クライアント名を任意に変更
  start_date: z.date({
    required_error: "開始予定日を選択してください",
  }),
  end_date: z
    .date({
      required_error: "終了予定日を選択してください",
    })
    .optional(),
  location: z.string().optional(), // 場所を任意に変更
  status: z.string().optional(), // ステータスを任意に変更
  description: z.string().default(""),
  contract_amount: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseFloat(val) : null)),
})

type DealFormValues = z.infer<typeof dealFormSchema>

interface DealEditFormProps {
  dealId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function DealEditForm({ dealId, onSuccess, onCancel }: DealEditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStaff, setSelectedStaff] = useState<string[]>([])
  const [selectedMachinery, setSelectedMachinery] = useState<string[]>([])
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([])
  const [selectedTools, setSelectedTools] = useState<string[]>([])

  // デフォルト値の設定
  const defaultValues: Partial<DealFormValues> = {
    name: "",
    client_name: "",
    status: "未選択",
    description: "",
    location: "",
    contract_amount: "",
  }

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    defaultValues,
  })

  // フォームの値を監視して、リソースの日付を更新
  const watchStartDate = form.watch("start_date")
  const watchEndDate = form.watch("end_date")

  // 案件データを取得
  useEffect(() => {
    async function fetchDealData() {
      try {
        setIsLoading(true)
        const supabase = getClientSupabase()

        // 案件データを取得
        const { data: dealData, error: dealError } = await supabase.from("deals").select("*").eq("id", dealId).single()

        if (dealError) throw dealError

        // フォームに値をセット
        form.reset({
          name: dealData.name,
          client_name: dealData.client_name || "",
          start_date: dealData.start_date ? new Date(dealData.start_date) : new Date(),
          end_date: dealData.end_date ? new Date(dealData.end_date) : undefined,
          location: dealData.location || "",
          status: dealData.status || "計画中",
          description: dealData.description || "",
          contract_amount: dealData.contract_amount ? String(dealData.contract_amount) : "",
        })

        // スタッフデータを取得
        const { data: staffData, error: staffError } = await supabase
          .from("deal_staff")
          .select("staff_id")
          .eq("deal_id", dealId)

        if (staffError) throw staffError
        setSelectedStaff(staffData?.map((item) => item.staff_id) || [])

        // 重機データを取得
        const { data: machineryData, error: machineryError } = await supabase
          .from("deal_machinery")
          .select("machinery_id")
          .eq("deal_id", dealId)

        if (machineryError) throw machineryError
        setSelectedMachinery(machineryData?.map((item) => item.machinery_id) || [])

        // 車両データを取得
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from("deal_vehicles")
          .select("vehicle_id")
          .eq("deal_id", dealId)

        if (vehiclesError) throw vehiclesError
        setSelectedVehicles(vehiclesData?.map((item) => item.vehicle_id) || [])

        // 備品データを取得
        const { data: toolsData, error: toolsError } = await supabase
          .from("deal_tools")
          .select("tool_id")
          .eq("deal_id", dealId)

        if (toolsError) throw toolsError
        setSelectedTools(toolsData?.map((item) => item.tool_id) || [])
      } catch (error) {
        console.error("現場データ取得エラー:", error)
        toast({
          title: "エラー",
          description: "現場データの取得に失敗しました。",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (dealId) {
      fetchDealData()
    }
  }, [dealId, form])

  // Helper function to handle resource assignments with error handling
  const handleResourceAssignment = async (
    supabase: any,
    tableName: string,
    resources: string[],
    dealId: string,
    resourceIdField: string,
  ) => {
    try {
      // 既存のリソース割り当てを削除
      const { error: deleteError } = await supabase.from(tableName).delete().eq("deal_id", dealId)

      if (deleteError) {
        console.error(`${tableName} deletion error:`, deleteError)
        throw deleteError
      }

      // リソースがない場合は終了
      if (resources.length === 0) return

      // 新しいリソース割り当てを追加
      const assignments = resources.map((resourceId) => ({
        deal_id: dealId,
        [resourceIdField]: resourceId,
      }))

      const { error } = await supabase.from(tableName).insert(assignments)

      if (error) {
        console.error(`${tableName} assignment error:`, error)
        throw error
      }
    } catch (error) {
      console.error(`Failed to update ${tableName}:`, error)
      throw error
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

      // 案件データを更新
      const { error } = await supabase
        .from("deals")
        .update({
          name: data.name,
          client_name: data.client_name || "", // nullではなく空文字列を使用
          start_date: data.start_date.toISOString().split("T")[0],
          end_date: data.end_date ? data.end_date.toISOString().split("T")[0] : null,
          location: data.location || "", // nullではなく空文字列を使用
          status: data.status || "計画中", // 未選択の場合はデフォルト値を使用
          description: data.description || "",
          contract_amount: data.contract_amount,
          updated_at: new Date().toISOString(),
          // updated_by field removed as it doesn't exist in the schema
        })
        .eq("id", dealId)

      if (error) {
        throw error
      }

      // リソースの割り当て - 各リソースタイプごとに処理
      // スタッフの割り当て
      await handleResourceAssignment(supabase, "deal_staff", selectedStaff, dealId, "staff_id")

      // 重機の割り当て
      await handleResourceAssignment(supabase, "deal_machinery", selectedMachinery, dealId, "machinery_id")

      // 車両の割り当て
      await handleResourceAssignment(supabase, "deal_vehicles", selectedVehicles, dealId, "vehicle_id")

      // 備品の割り当て
      await handleResourceAssignment(supabase, "deal_tools", selectedTools, dealId, "tool_id")

      toast({
        title: "現場更新完了",
        description: "現場情報が正常に更新されました。",
      })

      console.log("[現場編集] 現場更新成功 - 通知がトリガーされるはずです")

      // 成功時のコールバックがあれば実行（モーダルを閉じるなど）
      if (onSuccess) {
        onSuccess()
      }

      // 画面を更新
      router.refresh()
    } catch (error: any) {
      console.error("現場更新エラー:", error)
      toast({
        title: "エラー",
        description: `現場の更新に失敗しました: ${error.message || "不明なエラー"}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // リソースセレクターのダミーデータ変換関数
  const convertToResourceSelectorFormat = (
    ids: string[],
  ): { id: string; startDate: string; endDate: string | null }[] => {
    const startDate = watchStartDate ? format(watchStartDate, "yyyy-MM-dd") : ""
    const endDate = watchEndDate ? format(watchEndDate, "yyyy-MM-dd") : null

    return ids.map((id) => ({
      id,
      startDate,
      endDate,
    }))
  }

  // ResourceSelectorからの更新を処理する関数
  const handleStaffChange = (resources: { id: string; startDate: string; endDate: string | null }[]) => {
    setSelectedStaff(resources.map((r) => r.id))
  }

  const handleMachineryChange = (resources: { id: string; startDate: string; endDate: string | null }[]) => {
    setSelectedMachinery(resources.map((r) => r.id))
  }

  const handleVehiclesChange = (resources: { id: string; startDate: string; endDate: string | null }[]) => {
    setSelectedVehicles(resources.map((r) => r.id))
  }

  const handleToolsChange = (resources: { id: string; startDate: string; endDate: string | null }[]) => {
    setSelectedTools(resources.map((r) => r.id))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
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
                      <FormLabel>現場名 *</FormLabel>
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
                              type="button"
                              variant={"outline"}
                              className="w-full border border-input bg-background px-3 py-2 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "yyyy年MM月dd日", { locale: ja })
                              ) : (
                                <span className="text-muted-foreground">日付を選択</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
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
                              type="button"
                              variant={"outline"}
                              className="w-full border border-input bg-background px-3 py-2 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "yyyy年MM月dd日", { locale: ja })
                              ) : (
                                <span className="text-muted-foreground">日付を選択</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            disabled={(date) => {
                              const startDate = form.getValues("start_date")
                              return startDate && date < startDate
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
                  name="contract_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>請負金額（税込）</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="例: 1000000" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>円単位で入力してください（カンマなし）</FormDescription>
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
                    <FormLabel>現場詳細</FormLabel>
                    <FormControl>
                      <Textarea placeholder="現場の詳細情報を入力してください" className="min-h-[120px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="staff" className="pt-4">
              <ResourceSelector
                resourceType="staff"
                selectedResources={convertToResourceSelectorFormat(selectedStaff)}
                onSelectedResourcesChange={handleStaffChange}
                startDate={watchStartDate ? format(watchStartDate, "yyyy-MM-dd") : ""}
                endDate={watchEndDate ? format(watchEndDate, "yyyy-MM-dd") : null}
              />
            </TabsContent>

            <TabsContent value="machinery" className="pt-4">
              <ResourceSelector
                resourceType="machinery"
                selectedResources={convertToResourceSelectorFormat(selectedMachinery)}
                onSelectedResourcesChange={handleMachineryChange}
                startDate={watchStartDate ? format(watchStartDate, "yyyy-MM-dd") : ""}
                endDate={watchEndDate ? format(watchEndDate, "yyyy-MM-dd") : null}
              />
            </TabsContent>

            <TabsContent value="vehicles" className="pt-4">
              <ResourceSelector
                resourceType="vehicles"
                selectedResources={convertToResourceSelectorFormat(selectedVehicles)}
                onSelectedResourcesChange={handleVehiclesChange}
                startDate={watchStartDate ? format(watchStartDate, "yyyy-MM-dd") : ""}
                endDate={watchEndDate ? format(watchEndDate, "yyyy-MM-dd") : null}
              />
            </TabsContent>

            <TabsContent value="tools" className="pt-4">
              <ResourceSelector
                resourceType="tools"
                selectedResources={convertToResourceSelectorFormat(selectedTools)}
                onSelectedResourcesChange={handleToolsChange}
                startDate={watchStartDate ? format(watchStartDate, "yyyy-MM-dd") : ""}
                endDate={watchEndDate ? format(watchEndDate, "yyyy-MM-dd") : null}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              更新する
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
