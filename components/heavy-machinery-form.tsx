"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createHeavyMachinery } from "@/lib/supabase-utils"
import { toast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"

interface HeavyMachineryFormProps {
  onSuccess?: () => void
}

export function HeavyMachineryForm({ onSuccess }: HeavyMachineryFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    model: "",
    type: "",
    serialNumber: "",
    manufacturer: "",
    purchaseDate: "",
    status: "available",
    notes: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      // Validate form data
      if (!formData.name || !formData.model || !formData.type) {
        throw new Error("名前、モデル、タイプは必須です")
      }

      // Create heavy machinery in database
      await createHeavyMachinery({
        name: formData.name,
        model: formData.model,
        type: formData.type,
        serial_number: formData.serialNumber,
        manufacturer: formData.manufacturer,
        purchase_date: formData.purchaseDate,
        status: formData.status,
        notes: formData.notes,
      })

      toast({
        title: "重機を登録しました",
        description: `${formData.name}が登録されました`,
      })

      // Reset form and close dialog
      setFormData({
        name: "",
        model: "",
        type: "",
        serialNumber: "",
        manufacturer: "",
        purchaseDate: "",
        status: "available",
        notes: "",
      })
      setOpen(false)

      // Call success callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("重機の登録に失敗しました:", error)
      toast({
        title: "エラー",
        description: `重機の登録に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" onClick={() => setOpen(true)}>
          重機を登録
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>新しい重機を登録</DialogTitle>
          <DialogDescription>重機の詳細情報を入力してください。*は必須項目です。</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">名前 *</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">モデル *</Label>
              <Input id="model" name="model" value={formData.model} onChange={handleChange} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">タイプ *</Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="タイプを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excavator">掘削機</SelectItem>
                  <SelectItem value="bulldozer">ブルドーザー</SelectItem>
                  <SelectItem value="crane">クレーン</SelectItem>
                  <SelectItem value="loader">ローダー</SelectItem>
                  <SelectItem value="other">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="serialNumber">シリアル番号</Label>
              <Input id="serialNumber" name="serialNumber" value={formData.serialNumber} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">製造元</Label>
              <Input id="manufacturer" name="manufacturer" value={formData.manufacturer} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">購入日</Label>
              <Input
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">ステータス</Label>
            <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="ステータスを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">利用可能</SelectItem>
                <SelectItem value="in_use">使用中</SelectItem>
                <SelectItem value="maintenance">メンテナンス中</SelectItem>
                <SelectItem value="out_of_service">使用不可</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">備考</Label>
            <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
