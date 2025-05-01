"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, Camera, Plus, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { insertClientData, getClientSupabase } from "@/lib/supabase-utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DailyReportFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DailyReportFormDialog({ open, onOpenChange, onSuccess }: DailyReportFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customProject, setCustomProject] = useState("")
  const [selectedTab, setSelectedTab] = useState("existing")
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [deals, setDeals] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    projectId: "",
    userId: "",
    workDate: new Date().toISOString().split("T")[0],
    weather: "sunny",
    workContentText: "",
    speechRecognitionRaw: "",
    photos: [] as string[],
  })

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const supabase = getClientSupabase()

        // 案件データを取得
        console.log("案件データを取得中...")
        const { data: dealsData, error: dealsError } = await supabase
          .from("deals")
          .select("*")
          .order("created_at", { ascending: false })

        if (dealsError) {
          console.error("案件データの取得エラー:", dealsError)
          throw dealsError
        }

        console.log("取得した案件データ:", dealsData)
        setDeals(dealsData || [])

        // スタッフデータを取得
        console.log("スタッフデータを取得中...")
        const { data: staffData, error: staffError } = await supabase
          .from("staff")
          .select("*")
          .order("full_name", { ascending: true })

        if (staffError) {
          console.error("スタッフ取得エラー:", staffError)
          throw staffError
        }

        console.log("取得したスタッフデータ:", staffData)
        setStaff(staffData || [])
      } catch (err: any) {
        console.error("データ取得中にエラーが発生しました:", err)
        setError(err.message || "データの取得に失敗しました")
        toast({
          title: "エラー",
          description: "データの取得に失敗しました: " + (err.message || "不明なエラー"),
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setPhotoFiles([...photoFiles, ...newFiles])

      // ファイル名を保存
      const fileNames = newFiles.map((file) => file.name)
      setFormData({
        ...formData,
        photos: [...formData.photos, ...fileNames],
      })
    }
  }

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setPhotoFiles([...photoFiles, ...newFiles])

      // 撮影した写真のファイル名を生成して保存
      const fileNames = newFiles.map(
        (file, index) => `camera_capture_${Date.now()}_${index}.${file.type.split("/")[1]}`,
      )
      setFormData({
        ...formData,
        photos: [...formData.photos, ...fileNames],
      })
    }
  }

  const removePhoto = (index: number) => {
    const updatedFiles = [...photoFiles]
    updatedFiles.splice(index, 1)
    setPhotoFiles(updatedFiles)

    const updatedPhotoNames = [...formData.photos]
    updatedPhotoNames.splice(index, 1)
    setFormData({
      ...formData,
      photos: updatedPhotoNames,
    })
  }

  const handleSubmit = async () => {
    // 案件選択の検証
    let projectIdentifier = formData.projectId

    if (selectedTab === "custom" && !customProject.trim()) {
      toast({
        title: "入力エラー",
        description: "案件名を入力してください",
        variant: "destructive",
      })
      return
    }

    if (selectedTab === "custom") {
      projectIdentifier = customProject
    } else if (selectedTab === "existing" && (formData.projectId === "" || formData.projectId === "placeholder")) {
      toast({
        title: "入力エラー",
        description: "案件を選択してください",
        variant: "destructive",
      })
      return
    }

    if (!formData.userId || formData.userId === "placeholder" || !formData.workContentText) {
      toast({
        title: "入力エラー",
        description: "必須項目を入力してください",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // 日報データを追加
      await insertClientData("daily_reports", {
        project_id: selectedTab === "existing" ? formData.projectId : null,
        custom_project_name: selectedTab === "custom" ? customProject : null,
        staff_id: formData.userId,
        work_date: formData.workDate,
        weather: formData.weather,
        work_content: formData.workContentText,
        speech_recognition_raw: formData.speechRecognitionRaw,
        photos: formData.photos,
        status: "pending",
        created_at: new Date().toISOString(),
      })

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
      setCustomProject("")
      setSelectedTab("existing")
      setPhotoFiles([])

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
          <DialogDescription>作業日報の詳細情報を入力してください。*は必須項目です。</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>案件名 *</Label>
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="existing">既存の案件から選択</TabsTrigger>
                <TabsTrigger value="custom">手入力</TabsTrigger>
              </TabsList>
              <TabsContent value="existing" className="pt-2">
                <Select
                  value={formData.projectId}
                  onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                >
                  <SelectTrigger id="projectId">
                    <SelectValue placeholder="案件を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>
                      案件を選択してください
                    </SelectItem>
                    {deals.map((deal: any) => (
                      <SelectItem key={`deal-${deal.id}`} value={deal.id}>
                        {deal.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TabsContent>
              <TabsContent value="custom" className="pt-2">
                <Input
                  placeholder="案件名を入力"
                  value={customProject}
                  onChange={(e) => setCustomProject(e.target.value)}
                />
              </TabsContent>
            </Tabs>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="userId">登録者 *</Label>
              <Select value={formData.userId} onValueChange={(value) => setFormData({ ...formData, userId: value })}>
                <SelectTrigger id="userId">
                  <SelectValue placeholder="登録者を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder" disabled>
                    登録者を選択してください
                  </SelectItem>
                  {staff.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="workDate">作業日 *</Label>
              <Input
                id="workDate"
                type="date"
                value={formData.workDate}
                onChange={(e) => setFormData({ ...formData, workDate: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
                  <SelectItem value="snowy">雪</SelectItem>
                  <SelectItem value="windy">強風</SelectItem>
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
            <Label>写真添付</Label>
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleCameraCapture}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1"
              >
                <Plus size={16} /> 写真を選択
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-1"
              >
                <Camera size={16} /> カメラで撮影
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {photoFiles.map((file, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1 p-1">
                  <ImageIcon className="h-3 w-3 mr-1" />
                  <span className="max-w-[150px] truncate">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 ml-1"
                    onClick={() => removePhoto(index)}
                  >
                    <X size={12} />
                  </Button>
                </Badge>
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
