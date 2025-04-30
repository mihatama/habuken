"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getClientSupabase } from "@/lib/supabase-utils"
import { useAuth } from "@/hooks/use-auth"

interface ToolFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ToolForm({ open, onOpenChange, onSuccess }: ToolFormProps) {
  const { user } = useAuth() // 認証情報を取得
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    name: "",
    type: "hand_tool", // hand_tool, power_tool, equipment, other
    model: "",
    manufacturer: "",
    serialNumber: "",
    purchaseDate: "",
    purchasePrice: "",
    status: "available", // available, in_use, maintenance, broken
    location: "",
    notes: "",
  })

  const resetForm = () => {
    setFormData({
      name: "",
      type: "hand_tool",
      model: "",
      manufacturer: "",
      serialNumber: "",
      purchaseDate: "",
      purchasePrice: "",
      status: "available",
      location: "",
      notes: "",
    })
    setFormErrors({})
  }

  // フォームバリデーション関数
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name || formData.name.trim() === "") {
      errors.name = "備品名は必須です"
    }

    if (formData.purchaseDate) {
      const purchaseDate = new Date(formData.purchaseDate)
      if (isNaN(purchaseDate.getTime()) || purchaseDate > new Date()) {
        errors.purchaseDate = "有効な購入日を入力してください"
      }
    }

    if (formData.purchasePrice && isNaN(Number(formData.purchasePrice))) {
      errors.purchasePrice = "購入価格は数値で入力してください"
    }

    return errors
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()

    if (!user) {
      toast({
        title: "認証エラー",
        description: "ログインしてください",
        variant: "destructive",
      })
      return
    }

    // フォームバリデーション
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})
    setSubmitting(true)

    try {
      const supabase = getClientSupabase()

      // 実際のデータベーススキーマに合わせたデータ構造
      const toolData = {
        name: formData.name,
        type: "工具", // リソースタイプを「工具」に固定
        status: formData.status,
        description:
          formData.notes ||
          `型式: ${formData.model || "未設定"}, メーカー: ${
            formData.manufacturer || "未設定"
          }, シリアル番号: ${formData.serialNumber || "未設定"}, 購入日: ${
            formData.purchaseDate || "未設定"
          }, 購入価格: ${formData.purchasePrice || "未設定"}, 保管場所: ${formData.location || "未設定"}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("resources").insert([toolData]).select()

      if (error) {
        throw error
      }

      toast({
        title: "成功",
        description: "備品を追加しました",
      })

      resetForm()
      setTimeout(() => {
        onOpenChange(false)
        if (onSuccess) onSuccess()
      }, 100)
    } catch (error) {
      console.error("備品追加エラー:", error)
      toast({
        title: "エラー",
        description: `備品の追加に失敗しました: ${error.message || "不明なエラー"}`,
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
          <DialogTitle>備品の追加</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                備品名 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例: 電動ドリル"
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">備品タイプ</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="備品タイプを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hand_tool">手工具</SelectItem>
                  <SelectItem value="power_tool">電動工具</SelectItem>
                  <SelectItem value="equipment">機器</SelectItem>
                  <SelectItem value="other">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="manufacturer">メーカー</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="例: マキタ"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="model">モデル</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="例: DF001G"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="serialNumber">シリアル番号</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="例: ABC123456"
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
                  <SelectItem value="broken">故障</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="purchaseDate">購入日</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className={formErrors.purchaseDate ? "border-red-500" : ""}
              />
              {formErrors.purchaseDate && <p className="text-red-500 text-sm">{formErrors.purchaseDate}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="purchasePrice">購入価格</Label>
              <Input
                id="purchasePrice"
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                placeholder="例: 15000"
                className={formErrors.purchasePrice ? "border-red-500" : ""}
              />
              {formErrors.purchasePrice && <p className="text-red-500 text-sm">{formErrors.purchasePrice}</p>}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">保管場所</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="例: 倉庫A棚3"
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
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault()
              onOpenChange(false)
            }}
            disabled={submitting}
          >
            キャンセル
          </Button>
          <Button type="button" onClick={(e) => handleSubmit(e)} disabled={submitting}>
            {submitting ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
