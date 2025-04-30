"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getClientSupabase } from "@/lib/supabase-utils"
import { Loader2, CheckCircle } from "lucide-react"

export function DealRegistrationForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    dealName: "",
    clientName: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    estimatedValue: "",
    startDate: "",
    endDate: "",
    description: "",
    location: "",
    status: "pending",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
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

      // Insert deal into database
      const { data, error } = await supabase
        .from("deals")
        .insert([
          {
            name: formData.dealName,
            client_name: formData.clientName,
            contact_person: formData.contactPerson,
            contact_email: formData.contactEmail,
            contact_phone: formData.contactPhone,
            estimated_value: Number.parseFloat(formData.estimatedValue) || 0,
            start_date: formData.startDate,
            end_date: formData.endDate,
            description: formData.description,
            location: formData.location,
            status: formData.status,
            created_by: user.id,
          },
        ])
        .select()

      if (error) throw error

      setSuccess(true)

      // Reset form after successful submission
      setTimeout(() => {
        router.push("/deals")
      }, 2000)
    } catch (error) {
      console.error("案件登録エラー:", error)
      alert("案件の登録中にエラーが発生しました。もう一度お試しください。")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <Card className="p-6 max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">案件が正常に登録されました</h2>
          <p className="text-muted-foreground mb-6">案件一覧ページにリダイレクトします...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="dealName" className="text-sm font-medium">
              案件名 <span className="text-red-500">*</span>
            </label>
            <input
              id="dealName"
              name="dealName"
              type="text"
              required
              value={formData.dealName}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              placeholder="案件名を入力"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="clientName" className="text-sm font-medium">
              クライアント名 <span className="text-red-500">*</span>
            </label>
            <input
              id="clientName"
              name="clientName"
              type="text"
              required
              value={formData.clientName}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              placeholder="クライアント名を入力"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="contactPerson" className="text-sm font-medium">
              担当者名
            </label>
            <input
              id="contactPerson"
              name="contactPerson"
              type="text"
              value={formData.contactPerson}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              placeholder="担当者名を入力"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="contactEmail" className="text-sm font-medium">
              連絡先メール
            </label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              placeholder="example@email.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="contactPhone" className="text-sm font-medium">
              連絡先電話番号
            </label>
            <input
              id="contactPhone"
              name="contactPhone"
              type="tel"
              value={formData.contactPhone}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              placeholder="03-1234-5678"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="estimatedValue" className="text-sm font-medium">
              見積金額 (円)
            </label>
            <input
              id="estimatedValue"
              name="estimatedValue"
              type="number"
              value={formData.estimatedValue}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              placeholder="1000000"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="startDate" className="text-sm font-medium">
              開始予定日 <span className="text-red-500">*</span>
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              required
              value={formData.startDate}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="endDate" className="text-sm font-medium">
              終了予定日
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium">
              場所
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              placeholder="東京都新宿区..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">
              ステータス <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              required
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="pending">検討中</option>
              <option value="approved">承認済み</option>
              <option value="in_progress">進行中</option>
              <option value="completed">完了</option>
              <option value="cancelled">キャンセル</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            案件詳細
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            placeholder="案件の詳細情報を入力してください..."
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            キャンセル
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                送信中...
              </>
            ) : (
              "案件を登録"
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}
