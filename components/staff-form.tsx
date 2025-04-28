"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createStaff } from "@/lib/supabase-utils"
import { toast } from "@/components/ui/use-toast"

interface StaffFormProps {
  onSuccess?: () => void
}

export function StaffForm({ onSuccess }: StaffFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    department: "",
    employeeId: "",
    contactNumber: "",
    email: "",
    status: "active",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (!formData.name || !formData.position || !formData.employeeId) {
        throw new Error("名前、役職、従業員IDは必須です")
      }

      // Create staff in database
      await createStaff({
        name: formData.name,
        position: formData.position,
        department: formData.department,
        employee_id: formData.employeeId,
        contact_number: formData.contactNumber,
        email: formData.email,
        status: formData.status,
      })

      toast({
        title: "スタッフを追加しました",
        description: `${formData.name}さんがスタッフとして登録されました`,
      })

      // Reset form and close dialog
      setFormData({
        name: "",
        position: "",
        department: "",
        employeeId: "",
        contactNumber: "",
        email: "",
        status: "active",
      })
      setOpen(false)

      // Call success callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("スタッフの追加に失敗しました:", error)
      toast({
        title: "エラー",
        description: `スタッフの追加に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">スタッフを追加</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>新しいスタッフを追加</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">名前 *</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeId">従業員ID *</Label>
              <Input id="employeeId" name="employeeId" value={formData.employeeId} onChange={handleChange} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">役職 *</Label>
              <Input id="position" name="position" value={formData.position} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">部署</Label>
              <Input id="department" name="department" value={formData.department} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactNumber">連絡先</Label>
              <Input id="contactNumber" name="contactNumber" value={formData.contactNumber} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">ステータス</Label>
            <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="ステータスを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">在籍中</SelectItem>
                <SelectItem value="leave">休職中</SelectItem>
                <SelectItem value="retired">退職</SelectItem>
              </SelectContent>
            </Select>
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
