"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAddStaff } from "@/hooks/supabase/use-staff"

interface StaffFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function StaffForm({ open, onOpenChange, onSuccess }: StaffFormProps) {
  const { toast } = useToast()
  const addStaffMutation = useAddStaff()

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    hire_date: "",
  })

  const handleSubmit = async () => {
    if (!formData.full_name) {
      toast({
        title: "入力エラー",
        description: "名前は必須項目です",
        variant: "destructive",
      })
      return
    }

    try {
      await addStaffMutation.mutateAsync({
        full_name: formData.full_name,
        email: formData.email || null,
        phone: formData.phone || null,
        position: formData.position || null,
        department: formData.department || null,
        hire_date: formData.hire_date || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      toast({
        title: "成功",
        description: "スタッフを追加しました",
      })

      // フォームをリセット
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        position: "",
        department: "",
        hire_date: "",
      })

      // ダイアログを閉じる
      onOpenChange(false)

      // 成功コールバックを呼び出す
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("スタッフ追加エラー:", error)
      toast({
        title: "エラー",
        description: "スタッフの追加に失敗しました",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>スタッフ追加</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="full_name">名前 *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="山田 太郎"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@company.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">電話番号</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="090-1234-5678"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="position">役職</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="現場監督"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="department">部署</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="工事部"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="hire_date">入社日</Label>
            <Input
              id="hire_date"
              type="date"
              value={formData.hire_date}
              onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={addStaffMutation.isPending}>
            {addStaffMutation.isPending ? "追加中..." : "追加"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
