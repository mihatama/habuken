"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getClientSupabase } from "@/lib/supabase-utils"
import { Loader2 } from "lucide-react"

interface DealDailyReportFormProps {
  dealId: string
}

const weatherOptions = [
  { value: "sunny", label: "晴れ" },
  { value: "cloudy", label: "曇り" },
  { value: "rainy", label: "雨" },
  { value: "thunderstorm", label: "雷雨" },
  { value: "snowy", label: "雪" },
]

export function DealDailyReportForm({ dealId }: DealDailyReportFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deal, setDeal] = useState<any>(null)
  const [formData, setFormData] = useState({
    reportDate: new Date().toISOString().slice(0, 10),
    weather: "sunny",
    temperature: "20",
    workDescription: "",
    issues: "",
  })

  useEffect(() => {
    async function fetchDealData() {
      try {
        const supabase = getClientSupabase()
        const { data, error } = await supabase.from("deals").select("*").eq("id", dealId).single()
        if (error) throw error
        setDeal(data)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
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

      // Insert daily report
      const { data, error } = await supabase.from("daily_reports").insert([
        {
          deal_id: dealId,
          report_date: formData.reportDate,
          weather: formData.weather,
          temperature: Number.parseFloat(formData.temperature),
          work_description: formData.workDescription,
          issues: formData.issues || null,
          submitted_by: user.id,
        },
      ])

      if (error) throw error

      toast({
        title: "成功しました",
        description: "日報が登録できました",
      })

      // Reset form
      setFormData({
        reportDate: new Date().toISOString().slice(0, 10),
        weather: "sunny",
        temperature: "20",
        workDescription: "",
        issues: "",
      })

      // Redirect to deal details
      router.push(`/deals/${dealId}`)
    } catch (error) {
      console.error("日報登録エラー:", error)
      toast({
        title: "エラー",
        description: "日報の登録ができませんでした",
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
        <CardTitle>日報登録 - {deal.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="reportDate">
                報告日 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="reportDate"
                name="reportDate"
                type="date"
                required
                value={formData.reportDate}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weather">天候</Label>
              <Select
                name="weather"
                value={formData.weather}
                onValueChange={(value) => handleSelectChange("weather", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="天候を選択" />
                </SelectTrigger>
                <SelectContent>
                  {weatherOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">気温 (°C)</Label>
              <Input
                id="temperature"
                name="temperature"
                type="number"
                value={formData.temperature}
                onChange={handleChange}
                placeholder="20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workDescription">
              作業内容 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="workDescription"
              name="workDescription"
              required
              rows={5}
              value={formData.workDescription}
              onChange={handleChange}
              placeholder="今日行った作業内容を入力してくださいね"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issues">問題点・課題</Label>
            <Textarea
              id="issues"
              name="issues"
              rows={3}
              value={formData.issues}
              onChange={handleChange}
              placeholder="問題点や課題があれば入力してくださいね"
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
                "日報を登録する"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
