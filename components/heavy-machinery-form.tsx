"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getClientSupabase } from "@/lib/supabase-utils"
import { OwnershipType, ResourceStatus } from "@/types/enums"

interface HeavyMachineryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function HeavyMachineryForm({ open, onOpenChange, onSuccess }: HeavyMachineryFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    model: "",
    manufacturer: "",
    year: new Date().getFullYear(),
    status: ResourceStatus.Available,
    ownership: OwnershipType.OwnedByCompany,
    last_maintenance: "",
    next_maintenance: "",
  })

  const handleSubmit = async () => {
    if (!formData.name || !formData.type || !formData.model || !formData.manufacturer) {
      toast({
        title: "入力エラー",
        description: "名称、種類、型式、メーカーは必須項目です",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const supabase = getClientSupabase()

      const { data, error } = await supabase
        .from("heavy_machinery")
        .insert({
          name: formData.name,
          type: formData.type,
          model: formData.model,
          manufacturer: formData.manufacturer,
          year: formData.year,
          status: formData.status,
          ownership: formData.ownership,
          last_maintenance: formData.last_maintenance || null,
          next_maintenance: formData.next_maintenance || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (error) throw error

      toast({
        title: "成功",
        description: "重機を登録しました",
      })

      // フォームをリセット
      setFormData({
        name: "",
        type: "",
        model: "",
        manufacturer: "",
        year: new Date().getFullYear(),
        status: ResourceStatus.Available,
        ownership: OwnershipType.OwnedByCompany,
        last_maintenance: "",
        next_maintenance: "",
      })

      // ダイアログを閉じる
      onOpenChange(false)

      // 成功コールバックを呼び出す
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("重機登録エラー:", error)
      toast({
        title: "エラー",
        description: "重機の登録に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>新規重機登録</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="油圧ショベル A"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">種類 *</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="油圧ショベル"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="model">型式 *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="PC200-10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="manufacturer">メーカー *</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="コマツ"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="year">年式</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number.parseInt(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">状態</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as ResourceStatus })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="状態を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ResourceStatus.Available}>利用可能</SelectItem>
                  <SelectItem value={ResourceStatus.InUse}>利用中</SelectItem>
                  <SelectItem value={ResourceStatus.UnderMaintenance}>メンテナンス中</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ownership">所有形態</Label>
            <Select
              value={formData.ownership}
              onValueChange={(value) => setFormData({ ...formData, ownership: value as OwnershipType })}
            >
              <SelectTrigger id="ownership">
                <SelectValue placeholder="所有形態を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={OwnershipType.OwnedByCompany}>自社保有</SelectItem>
                <SelectItem value={OwnershipType.Leased}>リース</SelectItem>
                <SelectItem value={OwnershipType.Other}>その他</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="last_maintenance">前回点検日</Label>
              <Input
                id="last_maintenance"
                type="date"
                value={formData.last_maintenance}
                onChange={(e) => setFormData({ ...formData, last_maintenance: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="next_maintenance">次回点検日</Label>
              <Input
                id="next_maintenance"
                type="date"
                value={formData.next_maintenance}
                onChange={(e) => setFormData({ ...formData, next_maintenance: e.target.value })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "登録中..." : "登録"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
