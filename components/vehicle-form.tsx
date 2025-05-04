"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { insertClientData } from "@/lib/supabase-utils"

interface VehicleFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function VehicleForm({ open, onOpenChange, onSuccess }: VehicleFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "truck", // トラック、バス、乗用車など
    registrationNumber: "",
    manufacturer: "",
    model: "",
    year: new Date().getFullYear().toString(),
    capacity: "",
    status: "available", // available, in_use, maintenance
    notes: "",
  })

  const resetForm = () => {
    setFormData({
      name: "",
      type: "truck",
      registrationNumber: "",
      manufacturer: "",
      model: "",
      year: new Date().getFullYear().toString(),
      capacity: "",
      status: "available",
      notes: "",
    })
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.registrationNumber) {
      toast({
        title: "入力エラー",
        description: "車両名と登録番号は必須です",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      await insertClientData("vehicles", {
        vehicle_number: formData.registrationNumber, // vehicle_number カラムに変更
        vehicle_type: formData.type, // vehicle_type カラムに変更
        manufacturer: formData.manufacturer,
        model: formData.model,
        year: Number.parseInt(formData.year),
        status: formData.status,
        notes: formData.notes,
        next_inspection_date: new Date().toISOString().split("T")[0], // 仮の点検日を設定
        last_maintenance_date: new Date().toISOString().split("T")[0], // 仮の整備日を設定
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      toast({
        title: "成功",
        description: "車両を追加しました",
      })

      resetForm()
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("車両追加エラー:", error)
      toast({
        title: "エラー",
        description: "車両の追加に失敗しました",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>車両の追加</DialogTitle>
          <DialogDescription>車両の詳細情報を入力してください。車両名と登録番号は必須です。</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">車両名</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例: 4tダンプ1号車"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">車両タイプ</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="車両タイプを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="truck">トラック</SelectItem>
                  <SelectItem value="bus">バス</SelectItem>
                  <SelectItem value="car">乗用車</SelectItem>
                  <SelectItem value="van">バン</SelectItem>
                  <SelectItem value="other">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="registrationNumber">登録番号</Label>
              <Input
                id="registrationNumber"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                placeholder="例: 品川 500 あ 1234"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">状態</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="状態を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">利用可能</SelectItem>
                  <SelectItem value="in_use">使用中</SelectItem>
                  <SelectItem value="maintenance">メンテナンス中</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="manufacturer">メーカー</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="例: トヨタ"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="model">モデル</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="例: ダイナ"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="year">年式</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="例: 2020"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="capacity">積載量/定員</Label>
            <Input
              id="capacity"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              placeholder="例: 4t / 5人"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">備考</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="備考を入力してください"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            キャンセル
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
