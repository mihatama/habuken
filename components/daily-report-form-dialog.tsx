"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function DailyReportFormDialog({ onSuccess, isOpen, onOpenChange }) {
  const { toast } = useToast()
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deals, setDeals] = useState([])
  const [staff, setStaff] = useState([])
  const [formData, setFormData] = useState({
    deal_id: "",
    custom_project_name: "",
    staff_id: "",
    report_date: new Date().toISOString().split("T")[0],
    work_description: "",
    weather: "晴れ",
    temperature: "",
    workers_count: "",
    photo_urls: [],
  })
  const [photos, setPhotos] = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchDeals()
    fetchStaff()
  }, [])

  async function fetchDeals() {
    try {
      console.log("案件データを取得中...")
      const { data, error } = await supabase.from("deals").select("*")

      if (error) throw error

      console.log("取得した案件データ:", data)
      setDeals(data || [])
    } catch (error) {
      console.error("案件データの取得に失敗しました:", error)
      toast({
        title: "エラー",
        description: "案件データの取得に失敗しました",
        variant: "destructive",
      })
    }
  }

  async function fetchStaff() {
    try {
      console.log("スタッフデータを取得中...")
      const { data, error } = await supabase.from("staff").select("*")

      if (error) throw error

      console.log("取得したスタッフデータ:", data)
      setStaff(data || [])
    } catch (error) {
      console.error("スタッフデータの取得に失敗しました:", error)
      toast({
        title: "エラー",
        description: "スタッフデータの取得に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // 案件が選択された場合、案件名を自動入力
    if (name === "deal_id" && value !== "custom") {
      const selectedDeal = deals.find((deal) => deal.id === value)
      if (selectedDeal) {
        setFormData((prev) => ({ ...prev, custom_project_name: selectedDeal.name }))
      }
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setPhotos(files)
  }

  const uploadPhotos = async () => {
    if (photos.length === 0) return []

    setIsUploading(true)
    setUploadProgress(0)

    try {
      console.log("dailyreportsバケットにアクセスできるか確認中...")
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      if (bucketsError) throw bucketsError

      console.log("dailyreportsバケットにアクセスできました:", buckets)

      // private/daily_report_photosフォルダへのアクセス権限を確認
      console.log("private/daily_report_photosフォルダのアクセス権限を確認中...")
      const { data: folderFiles, error: folderError } = await supabase.storage
        .from("daily_reports")
        .list("private/daily_report_photos")

      if (folderError && folderError.message !== "The resource was not found") {
        throw folderError
      }

      console.log("private/daily_report_photosフォルダにアクセスできました:", folderFiles)

      const uploadPromises = photos.map(async (file, index) => {
        const timestamp = Date.now()
        const fileExt = file.name.split(".").pop()
        const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `private/daily_report_photos/${fileName}`

        const { data, error } = await supabase.storage.from("daily_reports").upload(filePath, file)

        if (error) throw error

        // 進捗状況を更新
        setUploadProgress(Math.round(((index + 1) / photos.length) * 100))

        // 公開URLを取得
        const { data: publicUrl } = supabase.storage.from("daily_reports").getPublicUrl(filePath)

        return publicUrl.publicUrl
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setIsUploading(false)
      return uploadedUrls
    } catch (error) {
      console.error("写真のアップロードに失敗しました:", error)
      setIsUploading(false)
      throw error
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // バリデーション
      if (!formData.report_date) {
        throw new Error("日付は必須です")
      }

      if (!formData.work_description) {
        throw new Error("作業内容は必須です")
      }

      if (formData.deal_id === "custom" && !formData.custom_project_name) {
        throw new Error("カスタムプロジェクト名を入力してください")
      }

      // 写真をアップロード
      let photoUrls = []
      if (photos.length > 0) {
        photoUrls = await uploadPhotos()
      }

      // 日報データを作成
      const reportData = {
        ...formData,
        photo_urls: photoUrls,
        user_id: user?.id, // ユーザーIDを追加
      }

      console.log("日報データを追加中...")
      const response = await fetch("/api/daily-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(`API経由の挿入エラー: ${result.error}`)
      }

      toast({
        title: "成功",
        description: "日報が正常に追加されました",
      })

      // フォームをリセット
      setFormData({
        deal_id: "",
        custom_project_name: "",
        staff_id: "",
        report_date: new Date().toISOString().split("T")[0],
        work_description: "",
        weather: "晴れ",
        temperature: "",
        workers_count: "",
        photo_urls: [],
      })
      setPhotos([])

      // ダイアログを閉じる
      onOpenChange(false)

      // 成功コールバックを呼び出す
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("日報の追加に失敗しました:", error)
      toast({
        title: "エラー",
        description: `日報の追加に失敗しました: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>日報の追加</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report_date">日付 *</Label>
              <Input
                id="report_date"
                name="report_date"
                type="date"
                value={formData.report_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deal_id">案件</Label>
              <Select value={formData.deal_id} onValueChange={(value) => handleSelectChange("deal_id", value)}>
                <SelectTrigger id="deal_id">
                  <SelectValue placeholder="案件を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">カスタム案件</SelectItem>
                  {deals.map((deal) => (
                    <SelectItem key={deal.id} value={deal.id}>
                      {deal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.deal_id === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="custom_project_name">カスタム案件名 *</Label>
              <Input
                id="custom_project_name"
                name="custom_project_name"
                value={formData.custom_project_name}
                onChange={handleChange}
                required={formData.deal_id === "custom"}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="staff_id">担当者</Label>
              <Select value={formData.staff_id} onValueChange={(value) => handleSelectChange("staff_id", value)}>
                <SelectTrigger id="staff_id">
                  <SelectValue placeholder="担当者を選択" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weather">天気</Label>
              <Select value={formData.weather} onValueChange={(value) => handleSelectChange("weather", value)}>
                <SelectTrigger id="weather">
                  <SelectValue placeholder="天気を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="晴れ">晴れ</SelectItem>
                  <SelectItem value="曇り">曇り</SelectItem>
                  <SelectItem value="雨">雨</SelectItem>
                  <SelectItem value="雪">雪</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temperature">気温（℃）</Label>
              <Input
                id="temperature"
                name="temperature"
                type="number"
                value={formData.temperature}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workers_count">作業員数</Label>
              <Input
                id="workers_count"
                name="workers_count"
                type="number"
                value={formData.workers_count}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="work_description">作業内容 *</Label>
            <Textarea
              id="work_description"
              name="work_description"
              value={formData.work_description}
              onChange={handleChange}
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photos">写真</Label>
            <Input id="photos" type="file" multiple onChange={handleFileChange} accept="image/*" />
            {isUploading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}
            {photos.length > 0 && <p className="text-sm text-gray-500">{photos.length}枚の写真が選択されています</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
