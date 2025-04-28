"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@supabase/supabase-js"

interface DailyReportFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DailyReportFormDialog({ open, onOpenChange, onSuccess }: DailyReportFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  const [formData, setFormData] = useState({
    projectId: "",
    userId: "",
    workDate: new Date().toISOString().split("T")[0],
    weather: "sunny",
    workContentText: "",
    speechRecognitionRaw: "",
    photos: [] as string[],
  })

  // プロジェクトとスタッフのデータを取得
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*")
      if (error) throw error
      return data || []
    },
  })

  const { data: staff = [] } = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const { data, error } = await supabase.from("staff").select("*")
      if (error) throw error
      return data || []
    },
  })

  const handleSubmit = async () => {
    if (!formData.projectId || !formData.userId || !formData.workContentText) {
      toast({
        title: "入力エラー",
        description: "必須項目を入力してください",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const { data, error } = await supabase
        .from("daily_reports")
        .insert({
          project_id: formData.projectId,
          staff_id: formData.userId,
          work_date: formData.workDate,
          weather: formData.weather,
          work_content: formData.workContentText,
          speech_recognition_raw: formData.speechRecognitionRaw,
          photos: formData.photos,
          status: "pending",
          created_at: new Date().toISOString(),
        })
        .select()

      if (error) throw error

      toast({
        title: "成功",
        description: "作業日報を追加しました",
      })

      // フォームをリセット
      setFormData({
        projectId: "",
        userId: "",
        workDate: new Date().toISOString().split("T")[0],
        weather: "sunny",
        workContentText: "",
        speechRecognitionRaw: "",
        photos: [],
      })

      // ダイアログを閉じる
      onOpenChange(false)

      // 成功コールバックを呼び出す
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("日報作成エラー:", error)
      toast({
        title: "エラー",
        description: "日報の作成に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>作業日報の作成</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="projectId">工事名 *</Label>
              <Select
                value={formData.projectId}
                onValueChange={(value) => setFormData({ ...formData, projectId: value })}
              >
                <SelectTrigger id="projectId">
                  <SelectValue placeholder="工事を選択" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project: any) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="userId">作業者 *</Label>
              <Select value={formData.userId} onValueChange={(value) => setFormData({ ...formData, userId: value })}>
                <SelectTrigger id="userId">
                  <SelectValue placeholder="作業者を選択" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="workDate">作業日 *</Label>
              <Input
                id="workDate"
                type="date"
                value={formData.workDate}
                onChange={(e) => setFormData({ ...formData, workDate: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="weather">天候</Label>
              <Select value={formData.weather} onValueChange={(value) => setFormData({ ...formData, weather: value })}>
                <SelectTrigger id="weather">
                  <SelectValue placeholder="天候を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunny">晴れ</SelectItem>
                  <SelectItem value="cloudy">曇り</SelectItem>
                  <SelectItem value="rainy">雨</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="workContentText">作業内容 *</Label>
            </div>
            <Textarea
              id="workContentText"
              value={formData.workContentText}
              onChange={(e) => setFormData({ ...formData, workContentText: e.target.value })}
              placeholder="作業内容を入力してください"
              className="min-h-[150px]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="photos">写真添付</Label>
            <div className="flex gap-2">
              <Input
                id="photos"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const fileNames = Array.from(e.target.files).map((file) => file.name)
                    setFormData({
                      ...formData,
                      photos: [...formData.photos, ...fileNames],
                    })
                  }
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.photos.map((photo, index) => (
                <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                  <span className="text-sm">{photo}</span>
                  <button
                    type="button"
                    className="ml-1 rounded-full hover:bg-muted p-1"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        photos: formData.photos.filter((_, i) => i !== index),
                      })
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
