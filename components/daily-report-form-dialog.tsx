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
import { getClientSupabase } from "@/lib/supabase-utils"

// バケット名を定数として定義
const STORAGE_BUCKET_NAME = "dailyreports"
const STORAGE_FOLDER_NAME = "private/daily_report_photos"

interface DailyReportFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DailyReportFormDialog({ open, onOpenChange, onSuccess }: DailyReportFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customProject, setCustomProject] = useState("")
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [deals, setDeals] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabase, setSupabase] = useState<any>(null)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [bucketExists, setBucketExists] = useState(false)

  const [formData, setFormData] = useState({
    projectId: "",
    userId: "",
    workDate: new Date().toISOString().split("T")[0],
    weather: "sunny",
    workContentText: "",
    speechRecognitionRaw: "",
    photos: [] as string[],
    startTime: "",
    endTime: "",
  })

  // Supabaseクライアントの初期化
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        console.log("Supabaseクライアントを初期化中...")
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
          console.error("Supabase環境変数が設定されていません")
          throw new Error("システム設定に問題があります")
        }

        const client = getClientSupabase()
        setSupabase(client)
        console.log("Supabaseクライアントの初期化に成功しました")

        // バケットの存在を確認するだけ（作成は試みない）
        const checkBucket = async () => {
          try {
            console.log(`${STORAGE_BUCKET_NAME}バケットを確認中...`)

            // バケットの存在を確認
            const { data: buckets, error } = await client.storage.listBuckets()

            if (error) {
              console.error("バケット一覧取得エラー:", error)
              toast({
                title: "警告",
                description: "ストレージへのアクセスに問題があります。写真機能が制限されます。",
                variant: "warning",
              })
              setBucketExists(false)
              return
            }

            // バケットが存在するか確認
            const exists = buckets?.some((bucket) => bucket.name === STORAGE_BUCKET_NAME)

            if (exists) {
              console.log(`${STORAGE_BUCKET_NAME}バケットが存在します`)
              setBucketExists(true)

              // バケットへのアクセス権限を確認
              try {
                const { data, error: accessError } = await client.storage
                  .from(STORAGE_BUCKET_NAME)
                  .list(STORAGE_FOLDER_NAME, { limit: 1 })

                if (accessError) {
                  console.warn("バケットアクセス権限エラー:", accessError)
                  toast({
                    title: "警告",
                    description: "ストレージへのアクセス権限に問題があります。写真機能が制限されます。",
                    variant: "warning",
                  })
                }
              } catch (accessErr) {
                console.warn("バケットアクセス確認エラー:", accessErr)
              }
            } else {
              console.log(`${STORAGE_BUCKET_NAME}バケットが見つかりません`)
              toast({
                title: "情報",
                description: "写真保存用のストレージが設定されていません。写真機能は利用できません。",
                variant: "default",
              })
              setBucketExists(false)
            }
          } catch (err) {
            console.error("バケット確認エラー:", err)
            setBucketExists(false)
          }
        }

        checkBucket()
      } catch (err) {
        console.error("Supabaseクライアントの初期化に失敗しました:", err)
        setError("システム設定に問題があります。管理者にお問い合わせください。")
        toast({
          title: "エラー",
          description: "システム設定に問題があります。管理者にお問い合わせください。",
          variant: "destructive",
        })
      }
    }
  }, [toast])

  // データの取得
  useEffect(() => {
    async function fetchData() {
      if (!supabase || !open) return // supabaseクライアントがない場合または開いていない場合は何もしない

      try {
        setLoading(true)
        console.log("データの取得を開始します...")

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
  }, [supabase, open, toast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setPhotoFiles((prevFiles) => [...prevFiles, ...newFiles])
    }
  }

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setPhotoFiles((prevFiles) => [...prevFiles, ...newFiles])
    }
  }

  const removePhoto = (index: number) => {
    setPhotoFiles((prevFiles) => {
      const updatedFiles = [...prevFiles]
      updatedFiles.splice(index, 1)
      return updatedFiles
    })
  }

  const handleProjectChange = (value: string) => {
    setFormData({ ...formData, projectId: value })
    setShowCustomInput(value === "custom")
    if (value === "custom") {
      setTimeout(() => document.getElementById("customProject")?.focus(), 100)
    } else {
      setCustomProject("")
    }
  }

  // 写真をアップロードする関数
  const uploadPhotos = async (files: File[]): Promise<string[]> => {
    if (!bucketExists || files.length === 0) {
      return []
    }

    const uploadedUrls: string[] = []

    try {
      // フォルダが存在するか確認
      const { data: folderExists, error: folderError } = await supabase.storage
        .from(STORAGE_BUCKET_NAME)
        .list(STORAGE_FOLDER_NAME)

      // フォルダが存在しない場合は空ファイルをアップロードして作成
      if (folderError) {
        console.warn("フォルダ確認エラー:", folderError)
        // フォルダ確認エラーがあっても続行を試みる
      } else if (!folderExists || folderExists.length === 0) {
        console.log(`${STORAGE_FOLDER_NAME}フォルダが存在しません。作成を試みます。`)

        try {
          // 空のファイルを作成してフォルダを作成
          const emptyBlob = new Blob([""], { type: "text/plain" })
          const placeholderFile = new File([emptyBlob], ".placeholder", { type: "text/plain" })

          const { error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET_NAME)
            .upload(`${STORAGE_FOLDER_NAME}/.placeholder`, placeholderFile)

          if (uploadError) {
            console.warn("フォルダ作成エラー:", uploadError)
            // エラーがあっても続行を試みる
          } else {
            console.log(`${STORAGE_FOLDER_NAME}フォルダを作成しました`)
          }
        } catch (err) {
          console.warn("フォルダ作成中にエラーが発生しました:", err)
          // エラーがあっても続行を試みる
        }
      }
    } catch (err) {
      console.warn("フォルダ確認/作成エラー:", err)
      // エラーがあっても続行を試みる
    }

    // 各ファイルをアップロード
    for (const file of files) {
      try {
        // ファイル名を生成
        const fileExt = file.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `${STORAGE_FOLDER_NAME}/${fileName}`

        // ファイルをアップロード
        const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET_NAME).upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

        if (uploadError) {
          console.error("写真のアップロードエラー:", uploadError)
          toast({
            title: "警告",
            description: `写真「${file.name}」のアップロードに失敗しました。`,
            variant: "warning",
          })
          continue // エラーがあっても次の写真を処理
        }

        // 公開URLを取得
        const { data: urlData } = supabase.storage.from(STORAGE_BUCKET_NAME).getPublicUrl(filePath)

        if (urlData?.publicUrl) {
          uploadedUrls.push(urlData.publicUrl)
          console.log(`写真をアップロードしました: ${urlData.publicUrl}`)
        }
      } catch (err) {
        console.error(`写真「${file.name}」のアップロード中にエラーが発生しました:`, err)
      }
    }

    return uploadedUrls
  }

  const handleSubmit = async () => {
    if (!supabase) {
      toast({
        title: "エラー",
        description: "システムに接続できません。ページを再読み込みしてください。",
        variant: "destructive",
      })
      return
    }

    // 案件選択の検証
    if (formData.projectId === "custom") {
      if (!customProject.trim()) {
        toast({
          title: "入力エラー",
          description: "案件名を入力してください",
          variant: "destructive",
        })
        return
      }
    } else if (formData.projectId === "" || formData.projectId === "placeholder") {
      toast({
        title: "入力エラー",
        description: "案件を選択してください",
        variant: "destructive",
      })
      return
    }

    if (
      !formData.userId ||
      formData.userId === "placeholder" ||
      !formData.workContentText ||
      !formData.startTime ||
      !formData.endTime
    ) {
      toast({
        title: "入力エラー",
        description: "必須項目を入力してください",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      console.log("日報データを追加中...")

      // 写真のアップロード処理
      let uploadedPhotoUrls: string[] = []

      if (photoFiles.length > 0) {
        if (!bucketExists) {
          toast({
            title: "情報",
            description: "写真保存用のストレージが利用できないため、写真なしで保存します。",
            variant: "default",
          })
        } else {
          uploadedPhotoUrls = await uploadPhotos(photoFiles)
        }
      }

      // 日報データを追加 - 既存のテーブル構造に合わせて修正
      const { data, error } = await supabase
        .from("daily_reports")
        .insert({
          project_id: formData.projectId !== "custom" ? formData.projectId : null,
          custom_project_name: formData.projectId === "custom" ? customProject : null,
          submitted_by: formData.userId,
          report_date: formData.workDate,
          weather: formData.weather,
          work_description: formData.workContentText,
          speech_recognition_raw: formData.speechRecognitionRaw,
          photo_urls: uploadedPhotoUrls,
          start_time: formData.startTime,
          end_time: formData.endTime,
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (error) throw error

      console.log("日報データの追加に成功しました:", data)
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
        startTime: "",
        endTime: "",
      })
      setCustomProject("")
      setPhotoFiles([])
      setShowCustomInput(false)

      // ダイアログを閉じる
      onOpenChange(false)

      // 成功コールバックを呼び出す
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error("日報作成エラー:", error)
      toast({
        title: "エラー",
        description: "日報の作成に失敗しました: " + (error.message || "不明なエラー"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // エラーがある場合はエラーメッセージを表示
  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>エラー</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center text-red-500">
            <p>{error}</p>
            <p className="mt-4">ページを再読み込みしてもう一度お試しください。</p>
          </div>
          <DialogFooter>
            <Button onClick={() => window.location.reload()}>ページを再読み込み</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>作業日報の作成</DialogTitle>
          <DialogDescription>作業日報の詳細情報を入力してください。*は必須項目です。</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="py-8 text-center">
            <p>データを読み込み中...</p>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>案件名 *</Label>
              <div className="space-y-2">
                <Select value={formData.projectId} onValueChange={handleProjectChange}>
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
                    <SelectItem value="custom">その他（手入力）</SelectItem>
                  </SelectContent>
                </Select>

                {showCustomInput && (
                  <Input
                    id="customProject"
                    placeholder="案件名を入力"
                    value={customProject}
                    onChange={(e) => setCustomProject(e.target.value)}
                  />
                )}
              </div>
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
                <Label htmlFor="startTime">作業開始時間 *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">作業終了時間 *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="weather">天候</Label>
                <Select
                  value={formData.weather}
                  onValueChange={(value) => setFormData({ ...formData, weather: value })}
                >
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
              {!bucketExists && (
                <div className="text-amber-500 text-sm mb-2">
                  ※ 写真保存用のストレージが設定されていません。写真は保存されません。
                </div>
              )}
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
                  disabled={!bucketExists}
                >
                  <Plus size={16} /> 写真を選択
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center gap-1"
                  disabled={!bucketExists}
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
        )}
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting || loading}>
            {isSubmitting ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
