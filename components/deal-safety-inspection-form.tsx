"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { getClientSupabase } from "@/lib/supabase-utils"
import { Loader2 } from "lucide-react"

interface DealSafetyInspectionFormProps {
  dealId: string
}

// チェックリスト項目の定義
const checklistItems = [
  { id: "machines", label: "機械・設備" },
  { id: "protectiveGear", label: "保護具着用" },
  { id: "waste", label: "廃棄物管理" },
  { id: "noise", label: "騒音・振動" },
  { id: "scaffolding", label: "足場・作業床" },
  { id: "electricity", label: "電気関係" },
  { id: "fire", label: "火災防止" },
  { id: "signage", label: "標識・表示" },
]

export function DealSafetyInspectionForm({ dealId }: DealSafetyInspectionFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deal, setDeal] = useState<any>(null)
  const [formData, setFormData] = useState({
    inspectionDate: new Date().toISOString().slice(0, 10),
    location: "",
    findings: "",
    actionItems: "",
    checklistJson: {
      machines: "good",
      protectiveGear: "good",
      waste: "good",
      noise: "good",
      scaffolding: "good",
      electricity: "good",
      fire: "good",
      signage: "good",
    },
  })

  useEffect(() => {
    async function fetchDealData() {
      try {
        const supabase = getClientSupabase()
        const { data, error } = await supabase.from("deals").select("*").eq("id", dealId).single()
        if (error) throw error
        setDeal(data)

        // Set location from deal if available
        if (data.location) {
          setFormData((prev) => ({
            ...prev,
            location: data.location,
          }))
        }
      } catch (error) {
        console.error("案件データ取得エラー:", error)
        toast({
          title: "エラー",
          description: "案件データの取得ができませんでした",
          variant: "destructive",
        })
      }
    }

    if (dealId) {
      fetchDealData()
    }
  }, [dealId, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleChecklistChange = (itemId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      checklistJson: {
        ...prev.checklistJson,
        [itemId]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = getClientSupabase()

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("認証されていません。再度ログインしてください。")
      }

      // Insert safety inspection
      const { data, error } = await supabase.from("safety_inspections").insert([
        {
          deal_id: dealId,
          inspection_date: formData.inspectionDate,
          location: formData.location,
          findings: formData.findings,
          action_items: formData.actionItems || null,
          checklist_json: formData.checklistJson,
          inspector: user.id,
          status: "pending",
        },
      ])

      if (error) throw error

      toast({
        title: "成功しました",
        description: "安全パトロール記録が登録できました",
      })

      // Reset form
      setFormData({
        inspectionDate: new Date().toISOString().slice(0, 10),
        location: deal?.location || "",
        findings: "",
        actionItems: "",
        checklistJson: {
          machines: "good",
          protectiveGear: "good",
          waste: "good",
          noise: "good",
          scaffolding: "good",
          electricity: "good",
          fire: "good",
          signage: "good",
        },
      })

      // Redirect to deal details
      router.push(`/deals/${dealId}`)
    } catch (error) {
      console.error("安全パトロール登録エラー:", error)
      toast({
        title: "エラー",
        description: "安全パトロール記録の登録ができませんでした",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!deal) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>安全パトロール記録 - {deal.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="inspectionDate">
                点検日 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="inspectionDate"
                name="inspectionDate"
                type="date"
                required
                value={formData.inspectionDate}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                場所 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="点検した場所を入力してくださいね"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>チェックリスト</Label>
            <div className="border rounded-md p-4 grid gap-4">
              {checklistItems.map((item) => (
                <div key={item.id} className="grid gap-2">
                  <Label htmlFor={item.id}>{item.label}</Label>
                  <RadioGroup
                    id={item.id}
                    value={(formData.checklistJson as any)[item.id]}
                    onValueChange={(value) => handleChecklistChange(item.id, value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="good" id={`${item.id}-good`} />
                      <Label htmlFor={`${item.id}-good`} className="text-green-600">
                        ◎ 良好です
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="warning" id={`${item.id}-warning`} />
                      <Label htmlFor={`${item.id}-warning`} className="text-yellow-600">
                        △ 注意が必要です
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="danger" id={`${item.id}-danger`} />
                      <Label htmlFor={`${item.id}-danger`} className="text-red-600">
                        × 危険です
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="findings">
              発見事項 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="findings"
              name="findings"
              required
              rows={5}
              value={formData.findings}
              onChange={handleChange}
              placeholder="安全パトロールで見つけたことを入力してくださいね"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="actionItems">対応事項</Label>
            <Textarea
              id="actionItems"
              name="actionItems"
              rows={3}
              value={formData.actionItems}
              onChange={handleChange}
              placeholder="必要な対応があれば入力してくださいね"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              戻る
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  送信中...
                </>
              ) : (
                "記録を登録する"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
