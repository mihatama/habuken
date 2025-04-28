"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAddVehicle } from "@/hooks/supabase/use-vehicles"

interface VehicleFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function VehicleForm({ open, onOpenChange, onSuccess }: VehicleFormProps) {
  const { toast } = useToast()
  const addVehicleMutation = useAddVehicle()

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    location: "",
    last_inspection_date: "",
    ownership_type: "自社保有" as const,
    daily_rate: null as number | null,
    weekly_rate: null as number | null,
    monthly_rate: null as number | null,
  })

  const handleSubmit = async () => {
    if (!formData.name) {
      toast({
        title: "入力エラー",
        description: "車両名は必須項目です",
        variant: "destructive",
      })
      return
    }

    try {
      await addVehicleMutation.mutateAsync({
        name: formData.name,
        type: formData.type || "",
        location: formData.location || "",
        last_inspection_date: formData.last_inspection_date || null,
        ownership_type: formData.ownership_type,
        daily_rate: formData.daily_rate,
        weekly_rate: formData.weekly_rate,
        monthly_rate: formData.monthly_rate,
      })

      toast({
        title: "成功",
        description: "車両を追加しました",
      })

      // フォームをリセット
      setFormData({
        name: "",
        type: "",
        location: "",
        last_inspection_date: "",
        ownership_type: "自社保有" as const,
        daily_rate: null,
        weekly_rate: null,
        monthly_rate: null,
      })

      // ダイアログを閉じる
      onOpenChange(false)

      // 成功コールバックを呼び出す
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("車両追加エラー:", error)
      toast({
        title: "エラー",
        description: "車両の追加に失敗しました",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新規車両登録</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">車両名 *</Label>
            <Input
              id="name"
              placeholder="例: トヨタ ハイエース"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">車両タイプ</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="車両タイプを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="バン">バン</SelectItem>
                <SelectItem value="SUV">SUV</SelectItem>
                <SelectItem value="ミニバン">ミニバン</SelectItem>
                <SelectItem value="トラック">トラック</SelectItem>
                <SelectItem value="セダン">セダン</SelectItem>
                <SelectItem value="その他">その他</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">配置場所</Label>
            <Input
              id="location"
              placeholder="例: 東京本社"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastMaintenance">最終点検日</Label>
            <Input
              id="lastMaintenance"
              type="date"
              value={formData.last_inspection_date}
              onChange={(e) => setFormData({ ...formData, last_inspection_date: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ownership">所有形態</Label>
            <Select
              value={formData.ownership_type}
              onValueChange={(value: "自社保有" | "リース" | "その他") =>
                setFormData({ ...formData, ownership_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="所有形態を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="自社保有">自社保有</SelectItem>
                <SelectItem value="リース">リース</SelectItem>
                <SelectItem value="その他">その他</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="daily_rate">日額料金</Label>
              <Input
                id="daily_rate"
                type="number"
                placeholder="0"
                value={formData.daily_rate === null ? "" : formData.daily_rate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    daily_rate: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="weekly_rate">週額料金</Label>
              <Input
                id="weekly_rate"
                type="number"
                placeholder="0"
                value={formData.weekly_rate === null ? "" : formData.weekly_rate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    weekly_rate: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="monthly_rate">月額料金</Label>
              <Input
                id="monthly_rate"
                type="number"
                placeholder="0"
                value={formData.monthly_rate === null ? "" : formData.monthly_rate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    monthly_rate: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={addVehicleMutation.isPending}>
            {addVehicleMutation.isPending ? "登録中..." : "登録"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
