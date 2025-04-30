"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getClientSupabase } from "@/lib/supabase-utils"
import { Loader2, Plus, Edit2, Trash2, Calendar } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import type { DealPeriod } from "@/types/supabase"

interface DealPeriodManagementProps {
  dealId: string
}

export function DealPeriodManagement({ dealId }: DealPeriodManagementProps) {
  const [periods, setPeriods] = useState<DealPeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingPeriod, setEditingPeriod] = useState<DealPeriod | null>(null)
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    description: "",
  })

  // 期間データの取得
  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        setLoading(true)
        const supabase = getClientSupabase()
        const { data, error } = await supabase
          .from("deal_periods")
          .select("*")
          .eq("deal_id", dealId)
          .order("start_date", { ascending: true })

        if (error) throw error
        setPeriods(data || [])
      } catch (error) {
        console.error("期間データ取得エラー:", error)
      } finally {
        setLoading(false)
      }
    }

    if (dealId) {
      fetchPeriods()
    }
  }, [dealId])

  // フォームの入力処理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // 新規作成ダイアログを開く
  const openCreateDialog = () => {
    setEditingPeriod(null)
    setFormData({
      startDate: "",
      endDate: "",
      description: "",
    })
    setDialogOpen(true)
  }

  // 編集ダイアログを開く
  const openEditDialog = (period: DealPeriod) => {
    setEditingPeriod(period)
    setFormData({
      startDate: period.start_date,
      endDate: period.end_date || "",
      description: period.description || "",
    })
    setDialogOpen(true)
  }

  // 期間の保存処理
  const handleSavePeriod = async () => {
    try {
      setIsSubmitting(true)
      const supabase = getClientSupabase()

      const periodData = {
        deal_id: dealId,
        start_date: formData.startDate,
        end_date: formData.endDate || null,
        description: formData.description || null,
      }

      if (editingPeriod) {
        // 更新
        const { data, error } = await supabase
          .from("deal_periods")
          .update(periodData)
          .eq("id", editingPeriod.id)
          .select()

        if (error) throw error

        setPeriods((prev) => prev.map((p) => (p.id === editingPeriod.id ? data[0] : p)))
      } else {
        // 新規作成
        const { data, error } = await supabase.from("deal_periods").insert(periodData).select()

        if (error) throw error

        setPeriods((prev) => [...prev, data[0]])
      }

      setDialogOpen(false)
    } catch (error) {
      console.error("期間保存エラー:", error)
      alert("期間の保存中にエラーが発生しました。")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 期間の削除処理
  const handleDeletePeriod = async (periodId: string) => {
    if (!confirm("この期間を削除してもよろしいですか？")) return

    try {
      setLoading(true)
      const supabase = getClientSupabase()
      const { error } = await supabase.from("deal_periods").delete().eq("id", periodId)

      if (error) throw error

      setPeriods((prev) => prev.filter((p) => p.id !== periodId))
    } catch (error) {
      console.error("期間削除エラー:", error)
      alert("期間の削除中にエラーが発生しました。")
    } finally {
      setLoading(false)
    }
  }

  // 日付のフォーマット
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return format(new Date(dateString), "yyyy年MM月dd日", { locale: ja })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>案件期間管理</CardTitle>
        <Button onClick={openCreateDialog} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          期間を追加
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : periods.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>登録されている期間はありません</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={openCreateDialog}>
              期間を追加する
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>開始日</TableHead>
                <TableHead>終了日</TableHead>
                <TableHead>説明</TableHead>
                <TableHead className="w-[100px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periods.map((period) => (
                <TableRow key={period.id}>
                  <TableCell>{formatDate(period.start_date)}</TableCell>
                  <TableCell>{formatDate(period.end_date)}</TableCell>
                  <TableCell>{period.description || "-"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(period)} className="h-8 w-8">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePeriod(period.id)}
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* 期間編集ダイアログ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPeriod ? "期間を編集" : "期間を追加"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start-date" className="text-right">
                開始日 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="start-date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end-date" className="text-right">
                終了日
              </Label>
              <Input
                id="end-date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                説明
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="期間の説明を入力"
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
              キャンセル
            </Button>
            <Button type="button" onClick={handleSavePeriod} disabled={isSubmitting || !formData.startDate}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                "保存"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
