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
import { ImageIcon, Camera, Plus, X, Loader2, Mic, MicOff } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getClientSupabase } from "@/lib/supabase-utils"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"

// バケット名を定数として定義
const STORAGE_BUCKET_NAME = "dailyreports"
const STORAGE_FOLDER_NAME = "public/daily_report_photos"

// 画像圧縮の設定
const IMAGE_COMPRESSION_SETTINGS = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.75, // JPEG品質 (0-1)
}

interface DailyReportFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

// 画像圧縮用のユーティリティ関数
async function compressImage(file: File): Promise<{ file: File; originalSize: number; compressedSize: number }> {
  return new Promise((resolve, reject) => {
    const originalSize = file.size
    const reader = new FileReader()

    reader.onload = (readerEvent) => {
      const img = new Image()

      img.onload = () => {
        // 画像のサイズを計算
        let width = img.width
        let height = img.height

        // 最大サイズを超える場合はリサイズ
        if (width > IMAGE_COMPRESSION_SETTINGS.maxWidth || height > IMAGE_COMPRESSION_SETTINGS.maxHeight) {
          const ratio = Math.min(
            IMAGE_COMPRESSION_SETTINGS.maxWidth / width,
            IMAGE_COMPRESSION_SETTINGS.maxHeight / height,
          )
          width = Math.floor(width * ratio)
          height = Math.floor(height * ratio)
        }

        // Canvasに描画して圧縮
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("Canvas context could not be created"))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // 画像形式を決定（元の形式を維持するが、基本的にJPEGを推奨）
        const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg"

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Blob could not be created"))
              return
            }

            // 新しいファイル名を生成（元のファイル名を維持しつつ、圧縮されたことを示す）
            const fileName = file.name.replace(/(\.[^.]+)$/, (match) => `-compressed${match}`)

            // 新しいFileオブジェクトを作成
            const compressedFile = new File([blob], fileName, {
              type: mimeType,
              lastModified: Date.now(),
            })

            resolve({
              file: compressedFile,
              originalSize,
              compressedSize: compressedFile.size,
            })
          },
          mimeType,
          IMAGE_COMPRESSION_SETTINGS.quality,
        )
      }

      img.onerror = () => {
        reject(new Error("Failed to load image"))
      }

      if (typeof readerEvent.target?.result === "string") {
        img.src = readerEvent.target.result
      } else {
        reject(new Error("Failed to read file"))
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsDataURL(file)
  })
}

export function DailyReportFormDialog({ open, onOpenChange, onSuccess }: DailyReportFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customProject, setCustomProject] = useState("")
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [photoSizes, setPhotoSizes] = useState<{ [key: string]: { original: number; compressed: number } }>({})
  const [isCompressing, setIsCompressing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [deals, setDeals] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabase, setSupabase] = useState<any>(null)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [bucketExists, setBucketExists] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // 作業者の型定義
  interface Worker {
    id: string
    name: string
    startTime: string
    endTime: string
  }

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
    workers: [] as Worker[], // 作業者配列を追加
  })

  const { isRecording, activeId, startRecording, stopRecording } = useSpeechRecognition()

  // 音声認識の結果を処理する関数
  const handleSpeechResult = (text: string) => {
    // 既存のテキストに追記する形で更新
    setFormData((prev) => ({
      ...prev,
      workContentText: prev.workContentText ? `${prev.workContentText} ${text}` : text,
      speechRecognitionRaw: prev.speechRecognitionRaw ? `${prev.speechRecognitionRaw} ${text}` : text,
    }))
  }

  // 音声入力の開始/停止を切り替える関数
  const toggleSpeechRecognition = () => {
    if (isRecording) {
      stopRecording()
    } else {
      // 1 は任意のID。複数の入力フィールドがある場合に区別するために使用
      startRecording(1, handleSpeechResult)
    }
  }

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

        // 現在のユーザー情報を取得
        const getCurrentUser = async () => {
          try {
            const {
              data: { user },
              error: userError,
            } = await client.auth.getUser()

            if (userError) {
              console.error("ユーザー取得エラー:", userError)
              return
            }

            if (user) {
              console.log("現在のユーザー:", user)
              setCurrentUser(user)

              // ユーザーIDが取得できたら、自動的にフォームにセット
              const { data: staffData, error: staffError } = await client
                .from("staff")
                .select("id")
                .eq("user_id", user.id)
                .single()

              if (staffData && !staffError) {
                console.log("ユーザーに関連するスタッフを自動設定:", staffData)
                setFormData((prev) => ({ ...prev, userId: staffData.id }))
              }
            } else {
              console.log("ユーザーはログインしていません")
            }
          } catch (err) {
            console.error("ユーザー情報取得エラー:", err)
          }
        }

        getCurrentUser()

        // バケットの存在を確認するだけ（作成は試みない）
        const checkBucket = async () => {
          try {
            console.log(`${STORAGE_BUCKET_NAME}バケットを直接アクセスして確認中...`)

            // バケット一覧を取得せず、直接バケットにアクセスを試みる
            try {
              // バケットのルートフォルダにアクセスを試みる
              const { data, error: accessError } = await client.storage.from(STORAGE_BUCKET_NAME).list("", { limit: 1 })

              if (accessError) {
                console.warn("バケットアクセスエラー:", accessError)
                console.warn("エラーコード:", accessError.code)
                console.warn("エラーメッセージ:", accessError.message)

                // バケットが存在しないエラーの場合
                if (accessError.message.includes("does not exist") || accessError.code === "404") {
                  console.log(`${STORAGE_BUCKET_NAME}バケットが存在しません`)
                  toast({
                    title: "情報",
                    description: "写真保存用のストレージが設定されていません。写真機能は利用できません。",
                    variant: "default",
                  })
                  setBucketExists(false)
                  return
                }

                // その他のアクセスエラーの場合
                toast({
                  title: "警告",
                  description: `ストレージへのアクセス権限に問題があります: ${accessError.message}`,
                  variant: "warning",
                })
                setBucketExists(false)
                return
              }

              // バケットにアクセスできた場合
              console.log(`${STORAGE_BUCKET_NAME}バケットにアクセスできました:`, data)
              setBucketExists(true)

              // 次に特定のフォルダへのアクセスを確認
              try {
                console.log(`${STORAGE_FOLDER_NAME}フォルダのアクセス権限を確認中...`)
                const { data: folderData, error: folderError } = await client.storage
                  .from(STORAGE_BUCKET_NAME)
                  .list(STORAGE_FOLDER_NAME, { limit: 1 })

                if (folderError) {
                  console.warn("フォルダアクセスエラー:", folderError)

                  // フォルダが存在しない場合は作成を試みる
                  if (folderError.message.includes("not found") || folderError.code === "404") {
                    console.log(`${STORAGE_FOLDER_NAME}フォルダが存在しません。作成を試みます。`)

                    try {
                      // 空のファイルを作成してフォルダを作成
                      const emptyBlob = new Blob([""], { type: "text/plain" })
                      const placeholderFile = new File([emptyBlob], ".placeholder", { type: "text/plain" })

                      const { error: uploadError } = await client.storage
                        .from(STORAGE_BUCKET_NAME)
                        .upload(`${STORAGE_FOLDER_NAME}/.placeholder`, placeholderFile)

                      if (uploadError) {
                        console.warn("フォルダ作成エラー:", uploadError)
                      } else {
                        console.log(`${STORAGE_FOLDER_NAME}フォルダを作成しました`)
                      }
                    } catch (createErr) {
                      console.warn("フォルダ作成エラー:", createErr)
                    }
                  } else {
                    // その他のフォルダアクセスエラー
                    toast({
                      title: "警告",
                      description: `フォルダへのアクセス権限に問題があります: ${folderError.message}`,
                      variant: "warning",
                    })
                  }
                } else {
                  console.log(`${STORAGE_FOLDER_NAME}フォルダにアクセスできました:`, folderData)
                }
              } catch (folderErr) {
                console.warn("フォルダアクセス確認エラー:", folderErr)
              }
            } catch (err) {
              console.error("バケットアクセスエラー:", err)
              toast({
                title: "警告",
                description: "ストレージへのアクセスに問題があります。写真機能が制限されます。",
                variant: "warning",
              })
              setBucketExists(false)
            }
          } catch (err) {
            console.error("バケット確認処理エラー:", err)
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

        // スタッフデータ取得後に追加するコード
        // 以下のコードを「setStaff(staffData || [])」の直後に追加

        // 現在選択されているスタッフIDが有効かどうか確認
        if (formData.userId) {
          const staffExists = staffData?.some((s) => s.id === formData.userId)
          if (!staffExists) {
            console.warn("選択されているスタッフIDが存在しません:", formData.userId)
            // 無効なスタッフIDをリセット
            setFormData((prev) => ({ ...prev, userId: "" }))

            // 最初のスタッフを自動選択（オプション）
            if (staffData && staffData.length > 0) {
              console.log("最初のスタッフを自動選択します:", staffData[0].id)
              setFormData((prev) => ({ ...prev, userId: staffData[0].id }))
            }
          }
        }
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
  }, [supabase, open, toast, formData.userId])

  // 画像を圧縮して追加する関数
  const processAndAddImages = async (files: File[]) => {
    if (files.length === 0) return

    setIsCompressing(true)

    try {
      const compressedResults = await Promise.all(
        files.map(async (file) => {
          // 画像ファイルのみ圧縮
          if (file.type.startsWith("image/")) {
            try {
              return await compressImage(file)
            } catch (err) {
              console.error(`画像「${file.name}」の圧縮に失敗しました:`, err)
              // 圧縮に失敗した場合は元のファイルを使用
              return { file, originalSize: file.size, compressedSize: file.size }
            }
          } else {
            // 画像以外のファイルはそのまま
            return { file, originalSize: file.size, compressedSize: file.size }
          }
        }),
      )

      // 圧縮結果を保存
      const newPhotoSizes = { ...photoSizes }
      compressedResults.forEach(({ file, originalSize, compressedSize }) => {
        newPhotoSizes[file.name] = { original: originalSize, compressed: compressedSize }
      })
      setPhotoSizes(newPhotoSizes)

      // 圧縮された画像をセット
      const compressedFiles = compressedResults.map((result) => result.file)
      setPhotoFiles((prevFiles) => [...prevFiles, ...compressedFiles])

      // 圧縮率の高い画像があれば通知
      const significantCompressions = compressedResults.filter(
        ({ originalSize, compressedSize }) => (originalSize - compressedSize) / originalSize > 0.5,
      )

      if (significantCompressions.length > 0) {
        const totalOriginal = significantCompressions.reduce((sum, { originalSize }) => sum + originalSize, 0)
        const totalCompressed = significantCompressions.reduce((sum, { compressedSize }) => sum + compressedSize, 0)
        const savingsPercent = Math.round(((totalOriginal - totalCompressed) / totalOriginal) * 100)

        toast({
          title: "画像を最適化しました",
          description: `${significantCompressions.length}枚の画像を約${savingsPercent}%圧縮しました`,
          variant: "default",
        })
      }
    } catch (err) {
      console.error("画像処理中にエラーが発生しました:", err)
      toast({
        title: "警告",
        description: "一部の画像の処理に失敗しました。元のサイズで追加します。",
        variant: "warning",
      })
    } finally {
      setIsCompressing(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      await processAndAddImages(newFiles)
    }
  }

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      await processAndAddImages(newFiles)
    }
  }

  const removePhoto = (index: number) => {
    setPhotoFiles((prevFiles) => {
      const updatedFiles = [...prevFiles]
      const removedFile = updatedFiles[index]

      // 削除されたファイルのサイズ情報も削除
      if (removedFile) {
        setPhotoSizes((prev) => {
          const updated = { ...prev }
          delete updated[removedFile.name]
          return updated
        })
      }

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
      // 各ファイルをAPIルート経由でアップロード
      for (const file of files) {
        try {
          // ファイルをBase64エンコード
          const base64Image = await fileToBase64(file)

          // APIルートを使用してアップロード
          const response = await fetch("/api/upload-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              base64Image,
              fileName: file.name,
              contentType: file.type,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            console.error("画像アップロードAPIエラー:", errorData)
            toast({
              title: "警告",
              description: `写真「${file.name}」のアップロードに失敗しました。`,
              variant: "warning",
            })
            continue // エラーがあっても次の写真を処理
          }

          const result = await response.json()

          if (result.success && result.url) {
            uploadedUrls.push(result.url)
            console.log(`写真をアップロードしました: ${result.url}`)
          }
        } catch (err) {
          console.error(`写真「${file.name}」のアップロード中にエラーが発生しました:`, err)
        }
      }

      return uploadedUrls
    } catch (err) {
      console.error("画像アップロード処理中にエラーが発生しました:", err)
      return []
    }
  }

  // ファイルをBase64に変換する関数を追加
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  // 作業者を追加する関数
  const addWorker = () => {
    // 選択されているスタッフを取得
    const selectedStaff = staff.find((s) => s.id === formData.userId)

    if (!selectedStaff) {
      toast({
        title: "エラー",
        description: "登録者を先に選択してください",
        variant: "destructive",
      })
      return
    }

    // 新しい作業者を追加（初期値は登録者の情報と時間）
    setFormData((prev) => ({
      ...prev,
      workers: [
        ...prev.workers,
        {
          id: selectedStaff.id,
          name: selectedStaff.full_name,
          startTime: prev.startTime,
          endTime: prev.endTime,
        },
      ],
    }))
  }

  // 作業者を削除する関数
  const removeWorker = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      workers: prev.workers.filter((_, i) => i !== index),
    }))
  }

  // 作業者の情報を更新する関数
  const updateWorker = (index: number, field: keyof Worker, value: string) => {
    setFormData((prev) => {
      const updatedWorkers = [...prev.workers]
      updatedWorkers[index] = {
        ...updatedWorkers[index],
        [field]: value,
      }
      return {
        ...prev,
        workers: updatedWorkers,
      }
    })
  }

  // 作業者のスタッフを変更する関数
  const changeWorkerStaff = (index: number, staffId: string) => {
    const selectedStaff = staff.find((s) => s.id === staffId)
    if (!selectedStaff) return

    setFormData((prev) => {
      const updatedWorkers = [...prev.workers]
      updatedWorkers[index] = {
        ...updatedWorkers[index],
        id: selectedStaff.id,
        name: selectedStaff.full_name,
      }
      return {
        ...prev,
        workers: updatedWorkers,
      }
    })
  }

  // フォームリセット関数
  const resetForm = () => {
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
      workers: [], // 作業者配列をリセット
    })
    setCustomProject("")
    setPhotoFiles([])
    setPhotoSizes({})
    setShowCustomInput(false)
  }

  // 音声認識の互換性チェック
  const [speechSupported, setSpeechSupported] = useState(true)

  useEffect(() => {
    // ブラウザが音声認識をサポートしているか確認
    const isSpeechRecognitionSupported =
      typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)

    setSpeechSupported(isSpeechRecognitionSupported)
  }, [])

  // ファイルサイズを読みやすい形式に変換する関数
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B"

    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
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

  // 登録者の開始時間が変更されたときのハンドラ
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value
    setFormData((prev) => ({
      ...prev,
      startTime: newStartTime,
    }))
  }

  // 登録者の終了時間が変更されたときのハンドラ
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value
    setFormData((prev) => ({
      ...prev,
      endTime: newEndTime,
    }))
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

    // 必須項目のみをチェック
    const requiredFields = {
      userId: "登録者",
      workDate: "作業日",
      workContentText: "作業内容",
      startTime: "作業開始時間",
      endTime: "作業終了時間",
    }

    const missingFields = Object.entries(requiredFields).filter(([key, _]) => !formData[key as keyof typeof formData])

    if (missingFields.length > 0) {
      toast({
        title: "入力エラー",
        description: `以下の必須項目を入力してください: ${missingFields.map(([_, label]) => label).join(", ")}`,
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      console.log("日報データを追加中...")

      // ユーザー情報を取得 - 案件登録と同じパターン
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "エラー",
          description: "ユーザー情報が取得できませんでした。再ログインしてください。",
          variant: "destructive",
        })
        return
      }

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

      // 選択した案件名を取得
      let projectName = null
      if (formData.projectId !== "custom" && formData.projectId !== "" && formData.projectId !== "placeholder") {
        const selectedDeal = deals.find((deal) => deal.id === formData.projectId)
        if (selectedDeal) {
          projectName = selectedDeal.name
        }
      } else if (formData.projectId === "custom") {
        projectName = customProject
      }

      // 選択したスタッフIDからスタッフ情報を取得
      const selectedStaff = staff.find((s) => s.id === formData.userId)
      if (!selectedStaff) {
        toast({
          title: "エラー",
          description: "選択したスタッフ情報が見つかりません。別のスタッフを選択してください。",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // テーブル構造に合わせてデータを準備
      const reportData = {
        // project_idは常にnullに設定（外部キー制約エラーを回避するため）
        project_id: null,
        // deal_idは案件選択時のみ設定
        deal_id:
          formData.projectId !== "custom" && formData.projectId !== "" && formData.projectId !== "placeholder"
            ? formData.projectId
            : null,
        // カスタムプロジェクト名
        custom_project_name: projectName,
        // スタッフID（APIに渡す）
        staff_id: formData.userId,
        // 登録者の名前を追加
        full_name: selectedStaff.full_name,
        // 日付と時間
        report_date: formData.workDate,
        start_time: formData.startTime,
        end_time: formData.endTime,
        // 天候と作業内容
        weather: formData.weather,
        work_description: formData.workContentText,
        speech_recognition_raw: formData.speechRecognitionRaw,
        // 写真URL
        photo_urls: uploadedPhotoUrls,
        // 作成者
        created_by: user.id,
        // 現在のユーザーIDを明示的に送信
        user_id: user.id,
        // 作業者情報を追加
        workers: formData.workers.map((worker) => ({
          id: worker.id,
          name: worker.name,
          start_time: worker.startTime,
          end_time: worker.endTime,
        })),
      }

      console.log("挿入するデータ:", reportData)

      // APIルートを使用して日報データを追加
      console.log("APIルートを使用して日報データを追加します...")

      try {
        const response = await fetch("/api/daily-reports", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reportData),
        })

        if (!response.ok) {
          const errorData = await response.json()

          // バリデーションエラーの場合
          if (response.status === 400 && errorData.missingFields) {
            toast({
              title: "入力エラー",
              description: errorData.error || "必須項目を入力してください",
              variant: "destructive",
            })
            return
          }

          throw new Error(`APIエラー: ${errorData.error || response.statusText}`)
        }

        const result = await response.json()
        console.log("APIを使用した日報データの追加に成功しました:", result)

        // 成功処理
        toast({
          title: "成功",
          description: "作業日報を追加しました",
        })

        // フォームをリセット
        resetForm()

        // ダイアログを閉じる
        onOpenChange(false)

        // 成功コールバックを呼び出す
        console.log("onSuccess コールバックを呼び出します")
        if (onSuccess) {
          setTimeout(() => {
            onSuccess()
          }, 500) // 少し遅延を入れてUIの更新が完了してから再取得
        }
      } catch (apiError: any) {
        console.error("API経由の挿入エラー:", apiError)

        let errorMessage = "日報の作成に失敗しました"

        try {
          // APIからのエラーレスポンスを解析
          const errorData = (await apiError.json?.()) || {}

          if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch (parseError) {
          console.error("エラーレスポンスの解析に失敗:", parseError)
        }

        toast({
          title: "エラー",
          description: errorMessage,
          variant: "destructive",
        })
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl flex flex-col h-screen sm:h-auto">
        <DialogHeader>
          <DialogTitle>作業日報の作成</DialogTitle>
          <DialogDescription>作業日報の詳細情報を入力してください。*は必須項目です。</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="py-8 text-center">
            <p>データを読み込み中...</p>
          </div>
        ) : (
          <div className="overflow-auto flex-1 px-4 space-y-4">
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
                  <Select
                    value={formData.userId}
                    onValueChange={(value) => setFormData({ ...formData, userId: value })}
                  >
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
                  <Input id="startTime" type="time" value={formData.startTime} onChange={handleStartTimeChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">作業終了時間 *</Label>
                  <Input id="endTime" type="time" value={formData.endTime} onChange={handleEndTimeChange} />
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
                  <Button
                    type="button"
                    size="sm"
                    variant={isRecording ? "destructive" : "outline"}
                    onClick={toggleSpeechRecognition}
                    className={`flex items-center gap-1 ${isRecording ? "animate-pulse" : ""}`}
                  >
                    {isRecording ? (
                      <>
                        <MicOff size={16} /> 録音停止
                      </>
                    ) : (
                      <>
                        <Mic size={16} /> 音声入力
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  id="workContentText"
                  value={formData.workContentText}
                  onChange={(e) => setFormData({ ...formData, workContentText: e.target.value })}
                  placeholder="作業内容を入力してください"
                  className="min-h-[150px]"
                />
                {isRecording && (
                  <div className="text-sm text-green-600 animate-pulse">
                    音声を認識中... マイクに向かって話してください
                  </div>
                )}
                {!speechSupported && (
                  <div className="text-sm text-amber-500">
                    お使いのブラウザは音声入力に対応していません。Chrome、Safari、Edgeなどの最新ブラウザをお試しください。
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>作業者</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addWorker}
                    className="flex items-center gap-1"
                  >
                    <Plus size={16} /> 作業者を追加
                  </Button>
                </div>

                {formData.workers.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-2">
                    作業者が登録されていません。登録者が作業者として自動的に記録されます。
                  </div>
                ) : (
                  <div className="space-y-3 mt-2">
                    {formData.workers.map((worker, index) => (
                      <div key={index} className="border rounded-md p-3 relative">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => removeWorker(index)}
                        >
                          <X size={14} />
                        </Button>

                        <div className="grid gap-3">
                          <div className="grid gap-2">
                            <Label htmlFor={`worker-${index}-name`}>名前</Label>
                            <Select value={worker.id} onValueChange={(value) => changeWorkerStaff(index, value)}>
                              <SelectTrigger id={`worker-${index}-name`}>
                                <SelectValue placeholder="作業者を選択" />
                              </SelectTrigger>
                              <SelectContent>
                                {staff.map((s) => (
                                  <SelectItem key={`worker-staff-${s.id}`} value={s.id}>
                                    {s.full_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                              <Label htmlFor={`worker-${index}-start`}>開始時間</Label>
                              <Input
                                id={`worker-${index}-start`}
                                type="time"
                                value={worker.startTime}
                                onChange={(e) => updateWorker(index, "startTime", e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor={`worker-${index}-end`}>終了時間</Label>
                              <Input
                                id={`worker-${index}-end`}
                                type="time"
                                value={worker.endTime}
                                onChange={(e) => updateWorker(index, "endTime", e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                    disabled={!bucketExists || isCompressing}
                  >
                    {isCompressing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus size={16} />} 写真を選択
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center gap-1"
                    disabled={!bucketExists || isCompressing}
                  >
                    {isCompressing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Camera size={16} />}{" "}
                    カメラで撮影
                  </Button>
                </div>
                {isCompressing && (
                  <div className="text-sm text-blue-600 animate-pulse mt-2">
                    写真を最適化中... しばらくお待ちください
                  </div>
                )}
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
          </div>
        )}
        <DialogFooter className="flex-none bg-white p-4">
          <Button onClick={handleSubmit} disabled={isSubmitting || loading || isCompressing} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 保存中...
              </>
            ) : (
              "保存"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
