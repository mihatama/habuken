"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { X, Mic, MicOff, Loader2 } from "lucide-react"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { getClientSupabase } from "@/lib/supabase-utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// バケット名を定数として定義
const STORAGE_BUCKET_NAME = "dailyreports"
const STORAGE_FOLDER_NAME = "public/safety_inspection_photos"

// チェックリスト項目の型定義
type ChecklistItem = {
  id: string
  category: string
  name: string
  status: "good" | "caution" | "danger"
  isEco?: boolean
}

// フォームデータの型定義
type FormData = {
  projectId: string
  customProjectName: string
  inspectorId: string
  customInspectorName: string
  inspectionDate: string
  checklistItems: ChecklistItem[]
  comment: string
  photoFiles: File[]
}

// SafetyInspectionFormのプロパティ型定義
interface SafetyInspectionFormProps {
  onSuccess?: (data: any) => void
  onCancel?: () => void
}

// 画像圧縮の設定
const IMAGE_COMPRESSION_SETTINGS = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.75, // JPEG品質 (0-1)
}

// チェックリスト項目の定義
const checklistItems: ChecklistItem[] = [
  // 作業員カテゴリ
  {
    id: "protective_gear",
    category: "作業員",
    name: "保護帽、服装、はきもの",
    status: "good",
    isEco: false,
  },
  {
    id: "protective_equipment",
    category: "作業員",
    name: "保護具の使用の状況",
    status: "good",
    isEco: false,
  },
  { id: "danger_zone", category: "作業員", name: "立入禁止(危険)", status: "good", isEco: false },
  {
    id: "environmental_instructions",
    category: "作業員",
    name: "環境指示を確認しているか",
    status: "good",
    isEco: true,
  },
  {
    id: "environmental_goals",
    category: "作業員",
    name: "環境目標は達成したか",
    status: "good",
    isEco: true,
  },

  // 機械器具カテゴリ
  { id: "work_area", category: "機械器具", name: "作業(掘削)場所の整備", status: "good", isEco: false },
  {
    id: "operation_method",
    category: "機械器具",
    name: "操作(作業)方法・資格",
    status: "good",
    isEco: false,
  },
  { id: "maintenance", category: "機械器具", name: "整備・点検状況", status: "good", isEco: false },
  { id: "low_noise", category: "機械器具", name: "排対・低騒音型の機械か", status: "good", isEco: true },
  {
    id: "noise_vibration",
    category: "機械器具",
    name: "周辺への騒音、振動対策は良いか",
    status: "good",
    isEco: true,
  },
  {
    id: "abnormal_sound",
    category: "機械器具",
    name: "機械からの異常音は良いか",
    status: "good",
    isEco: true,
  },
  {
    id: "fuel_oil_leak",
    category: "機械器具",
    name: "機械の燃料・オイル漏れは無いか",
    status: "good",
    isEco: true,
  },
  {
    id: "pre_check",
    category: "機械器具",
    name: "車両・重機の使用前点検はしたか",
    status: "good",
    isEco: true,
  },
  {
    id: "idling_stop",
    category: "機械器具",
    name: "アイドリングストップをしたか",
    status: "good",
    isEco: true,
  },

  // 交通安全カテゴリ
  { id: "signs", category: "交通安全", name: "標識の保全", status: "good", isEco: false },
  {
    id: "traffic_facilities",
    category: "交通安全",
    name: "交通安全施設の保全",
    status: "good",
    isEco: false,
  },
  { id: "traffic_control", category: "交通安全", name: "交通整理の状況", status: "good", isEco: false },
  { id: "road_condition", category: "交通安全", name: "路面状況(段差)", status: "good", isEco: false },

  // 工事現場カテゴリ
  { id: "scaffolding", category: "工事現場", name: "型枠、足場工、昇降路", status: "good", isEco: false },
  { id: "excavation", category: "工事現場", name: "掘削方法", status: "good", isEco: false },
  { id: "passage", category: "工事現場", name: "通路・出入口", status: "good", isEco: false },
  { id: "dust_measures", category: "工事現場", name: "ホコリ対策は良いか", status: "good", isEco: true },
  { id: "water_measures", category: "工事現場", name: "濁水対策は良いか", status: "good", isEco: true },
  { id: "odor_measures", category: "工事現場", name: "悪臭対策は良いか", status: "good", isEco: true },
  { id: "waste_disposal", category: "工事現場", name: "廃棄物の適正処理", status: "good", isEco: true },
  { id: "complaints", category: "工事現場", name: "苦情は無いか", status: "good", isEco: true },
  { id: "cleanup", category: "工事現場", name: "跡片付、整理、清掃状況", status: "good", isEco: true },
  {
    id: "electrical",
    category: "工事現場",
    name: "電気のつっぱなし・消し忘れはないか",
    status: "good",
    isEco: true,
  },
  {
    id: "water_leakage",
    category: "工事現場",
    name: "水の出しっぱなし・閉め忘れはないか",
    status: "good",
    isEco: true,
  },
]

// カテゴリーのリスト
const categories = ["作業員", "機械器具", "交通安全", "工事現場"]

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

export function SafetyInspectionForm({ onSuccess, onCancel }: SafetyInspectionFormProps) {
  // 状態管理
  const [deals, setDeals] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabase, setSupabase] = useState<any>(null)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const { toast } = useToast()
  const [bucketExists, setBucketExists] = useState(false)

  // 状態管理
  const [formData, setFormData] = useState<FormData>({
    projectId: "",
    customProjectName: "",
    inspectorId: "",
    customInspectorName: "",
    inspectionDate: format(new Date(), "yyyy-MM-dd"),
    checklistItems: checklistItems,
    comment: "",
    photoFiles: [],
  })

  // 音声入力の状態管理
  const { isRecording, activeId, startRecording, stopRecording } = useSpeechRecognition()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photoSizes, setPhotoSizes] = useState<{ [key: string]: { original: number; compressed: number } }>({})
  const [isCompressing, setIsCompressing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Supabaseクライアントの初期化
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        console.log("Supabaseクライアントを初期化中...")
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
                setFormData((prev) => ({ ...prev, inspectorId: staffData.id }))
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
      if (!supabase) return // supabaseクライアントがない場合は何もしない

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

        // 現在選択されているスタッフIDが有効かどうか確認
        if (formData.inspectorId) {
          const staffExists = staffData?.some((s) => s.id === formData.inspectorId)
          if (!staffExists) {
            console.warn("選択されているスタッフIDが存在しません:", formData.inspectorId)
            // 無効なスタッフIDをリセット
            setFormData((prev) => ({ ...prev, inspectorId: "" }))

            // 最初のスタッフを自動選択（オプション）
            if (staffData && staffData.length > 0) {
              console.log("最初のスタッフを自動選択します:", staffData[0].id)
              setFormData((prev) => ({ ...prev, inspectorId: staffData[0].id }))
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
  }, [supabase, toast, formData.inspectorId])

  // チェックリスト項目のステータス更新
  const updateChecklistItemStatus = (id: string, status: "good" | "caution" | "danger") => {
    setFormData((prev) => ({
      ...prev,
      checklistItems: prev.checklistItems.map((item) => (item.id === id ? { ...item, status } : item)),
    }))
  }

  // 入力フィールドの変更を処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

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
      setFormData((prevData) => ({
        ...prevData,
        photoFiles: [...prevData.photoFiles, ...compressedFiles],
      }))

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

  // ファイル選択の処理
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      await processAndAddImages(newFiles)
    }
  }

  // カメラ撮影の処理
  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      await processAndAddImages(newFiles)
    }
  }

  // 写真の削除
  const removePhoto = (index: number) => {
    setFormData((prevData) => {
      const updatedFiles = [...prevData.photoFiles]
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
      return { ...prevData, photoFiles: updatedFiles }
    })
  }

  // 音声認識の結果を処理する関数
  const handleSpeechResult = (text: string) => {
    // 総合コメントに追記する形で更新
    setFormData((prev) => ({
      ...prev,
      comment: prev.comment ? `${prev.comment} ${text}` : text,
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

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording()
      }
    }
  }, [isRecording, stopRecording])

  // ファイルをBase64に変換する関数
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
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
              folderName: STORAGE_FOLDER_NAME, // 安全巡視用のフォルダを指定
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

  // フォーム送信前のバリデーション
  const validateForm = () => {
    // 案件名のバリデーション
    if (formData.projectId === "custom" && !formData.customProjectName.trim()) {
      toast({
        title: "入力エラー",
        description: "カスタム案件名を入力してください",
        variant: "destructive",
      })
      return false
    }

    // 巡視者のバリデーション
    if (formData.inspectorId === "custom" && !formData.customInspectorName.trim()) {
      toast({
        title: "入力エラー",
        description: "巡視者名を入力してください",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!supabase) {
      toast({
        title: "エラー",
        description: "システムに接続できません。ページを再読み込みしてください。",
        variant: "destructive",
      })
      return
    }

    // バリデーションチェック
    if (!validateForm()) {
      return
    }

    // 案件選択の検証
    if (formData.projectId === "custom") {
      if (!formData.customProjectName.trim()) {
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

    if (!formData.inspectorId || formData.inspectorId === "placeholder") {
      toast({
        title: "入力エラー",
        description: "巡視者を選択してください",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // ユーザー情報を取得
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

      if (formData.photoFiles.length > 0) {
        if (!bucketExists) {
          toast({
            title: "情報",
            description: "写真保存用のストレージが利用できないため、写真なしで保存します。",
            variant: "default",
          })
        } else {
          uploadedPhotoUrls = await uploadPhotos(formData.photoFiles)
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
        projectName = formData.customProjectName
      }

      // 選択したスタッフIDからスタッフ情報を取得
      const selectedStaff = staff.find((s) => s.id === formData.inspectorId)
      if (!selectedStaff && formData.inspectorId !== "custom") {
        toast({
          title: "エラー",
          description: "選択したスタッフ情報が見つかりません。別のスタッフを選択してください。",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // スタッフに関連するユーザーIDを取得（外部キー制約のため）
      let inspectorUserId = user.id // デフォルトは現在のユーザーID

      if (formData.inspectorId !== "custom") {
        // スタッフテーブルからuser_idを取得
        const { data: staffUserData, error: staffUserError } = await supabase
          .from("staff")
          .select("user_id")
          .eq("id", formData.inspectorId)
          .single()

        if (staffUserData && !staffUserError && staffUserData.user_id) {
          inspectorUserId = staffUserData.user_id
          console.log("スタッフに関連するユーザーID:", inspectorUserId)
        } else {
          console.log("スタッフに関連するユーザーIDが見つからないため、現在のユーザーIDを使用:", user.id)
        }
      }

      // テーブル構造に合わせてデータを準備
      const inspectionData = {
        deal_id:
          formData.projectId !== "custom" && formData.projectId !== "" && formData.projectId !== "placeholder"
            ? formData.projectId
            : null,
        custom_project_name: formData.projectId === "custom" ? formData.customProjectName : projectName,
        staff_id: inspectorUserId, // ユーザーIDを設定
        inspector_id: formData.inspectorId !== "custom" ? formData.inspectorId : null, // スタッフテーブルのIDを設定
        custom_inspector_name:
          formData.inspectorId === "custom"
            ? formData.customInspectorName
            : selectedStaff
              ? selectedStaff.full_name
              : null, // スタッフ名を保存
        inspection_date: formData.inspectionDate,
        checklist_items: formData.checklistItems,
        comment: formData.comment,
        photo_urls: uploadedPhotoUrls,
        status: "completed",
        created_by: user.id,
        user_id: user.id,
      }

      console.log("挿入するデータ:", inspectionData)

      // APIルートを使用して安全巡視データを追加
      try {
        const response = await fetch("/api/safety-inspections", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(inspectionData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`APIエラー: ${errorData.error || response.statusText}`)
        }

        const result = await response.json()
        console.log("APIを使用した安全巡視データの追加に成功しました:", result)

        toast({
          title: "保存完了",
          description: "安全・環境巡視日誌が保存されました",
        })

        // 成功コールバックを呼び出し
        if (onSuccess) {
          onSuccess(result)
        }
      } catch (apiError: any) {
        console.error("API経由の挿入エラー:", apiError)

        // APIが利用できない場合はSupabaseに直接挿入を試みる
        console.log("APIが利用できないため、Supabaseに直接挿入を試みます")
        const { data, error } = await supabase.from("safety_inspections").insert([inspectionData]).select()

        if (error) {
          console.error("安全巡視記録の保存エラー:", error)
          toast({
            title: "エラー",
            description: `安全巡視記録の保存に失敗しました: ${error.message}`,
            variant: "destructive",
          })
          return
        }

        console.log("安全巡視記録を保存しました:", data)

        toast({
          title: "保存完了",
          description: "安全・環境巡視日誌が保存されました",
        })

        // 成功コールバックを呼び出し
        if (onSuccess) {
          onSuccess(data[0])
        }
      }
    } catch (error: any) {
      console.error("保存エラー:", error)
      toast({
        title: "保存エラー",
        description: "安全・環境巡視日誌の保存に失敗しました: " + (error.message || "不明なエラー"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ステータスに応じた背景色を取得
  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "good":
        return "bg-green-100 dark:bg-green-900/30"
      case "caution":
        return "bg-yellow-100 dark:bg-yellow-900/30"
      case "danger":
        return "bg-red-100 dark:bg-red-900/30"
      default:
        return ""
    }
  }

  // プロジェクト選択時の処理
  const handleProjectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      projectId: value,
      // その他以外を選択した場合はカスタム名をリセット
      customProjectName: value === "custom" ? prev.customProjectName : "",
    }))
    setShowCustomInput(value === "custom")
  }

  // 巡視者選択時の処理
  const handleInspectorChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      inspectorId: value,
      // その他以外を選択した場合はカスタム名をリセット
      customInspectorName: value === "custom" ? prev.customInspectorName : "",
    }))
  }

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
      <div className="bg-white p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
        <div className="py-6 text-center text-red-500">
          <p>{error}</p>
          <p className="mt-4">ページを再読み込みしてもう一度お試しください。</p>
        </div>
        <div className="flex justify-center mt-4">
          <Button onClick={() => window.location.reload()}>ページを再読み込み</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">安全・環境巡視日誌の作成</h2>
        <button type="button" onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pr-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="projectId">
              案件名 <span className="text-red-500">*</span>
            </Label>
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

              {loading && (
                <div className="text-xs text-blue-500 mt-1 flex items-center">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  案件データを読み込み中...
                </div>
              )}

              {showCustomInput && (
                <div className="mt-2">
                  <Input
                    id="customProjectName"
                    name="customProjectName"
                    value={formData.customProjectName}
                    onChange={handleInputChange}
                    placeholder="案件名を入力してください"
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inspectorId">
              巡視者 <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.inspectorId} onValueChange={handleInspectorChange}>
              <SelectTrigger id="inspectorId">
                <SelectValue placeholder="巡視者を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="placeholder" disabled>
                  巡視者を選択してください
                </SelectItem>
                {staff.map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.full_name}
                  </SelectItem>
                ))}
                <SelectItem value="custom">その他（手入力）</SelectItem>
              </SelectContent>
            </Select>
            {loading && (
              <div className="text-xs text-blue-500 mt-1 flex items-center">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                スタッフデータを読み込み中...
              </div>
            )}
            {formData.inspectorId === "custom" && (
              <div className="mt-2">
                <Input
                  type="text"
                  id="customInspectorName"
                  name="customInspectorName"
                  value={formData.customInspectorName}
                  onChange={handleInputChange}
                  placeholder="巡視者名を入力してください"
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="inspectionDate">
            巡視日 <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            id="inspectionDate"
            name="inspectionDate"
            value={formData.inspectionDate}
            onChange={handleInputChange}
            className="w-full mt-1"
            required
          />
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">チェックリスト</h3>
          <div className="space-y-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-md p-4 max-h-[50vh] overflow-y-auto">
            {categories.map((category) => (
              <div key={category} className="space-y-3">
                <h4 className="font-medium text-sm border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 pb-1">
                  {category}
                </h4>
                <div className="space-y-4">
                  {formData.checklistItems
                    .filter((item) => item.category === category)
                    .map((item) => (
                      <div key={item.id} className={`rounded-md ${getStatusBgColor(item.status)} p-2`}>
                        <div className="flex items-center justify-between">
                          <div className="w-64 text-sm flex items-center">
                            <span className="text-gray-900 dark:text-gray-100">{item.name}</span>
                            {item.isEco && (
                              <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-1.5 py-0.5 rounded-full">
                                エコ
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => updateChecklistItemStatus(item.id, "good")}
                              className={`flex items-center px-2 py-1 rounded-md transition-colors ${
                                item.status === "good"
                                  ? "bg-green-200 dark:bg-green-900 border border-green-300 dark:border-green-700"
                                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
                              }`}
                            >
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500 dark:bg-green-600 text-white text-xs">
                                ○
                              </span>
                              <span className="ml-1 text-xs text-green-600 dark:text-green-400">良好</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => updateChecklistItemStatus(item.id, "caution")}
                              className={`flex items-center px-2 py-1 rounded-md transition-colors ${
                                item.status === "caution"
                                  ? "bg-yellow-200 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700"
                                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
                              }`}
                            >
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-yellow-500 dark:bg-yellow-600 text-white text-xs">
                                △
                              </span>
                              <span className="ml-1 text-xs text-yellow-600 dark:text-yellow-400">注意</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => updateChecklistItemStatus(item.id, "danger")}
                              className={`flex items-center px-2 py-1 rounded-md transition-colors ${
                                item.status === "danger"
                                  ? "bg-red-200 dark:bg-red-900 border border-red-300 dark:border-red-700"
                                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
                              }`}
                            >
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 dark:bg-red-600 text-white text-xs">
                                ○
                              </span>
                              <span className="ml-1 text-xs text-red-600 dark:text-red-400">危険</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="comment">総合コメント</Label>
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
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            placeholder="指摘事項や改善点などを入力してください"
            className="w-full mt-1 min-h-[100px]"
          />
          {isRecording && (
            <div className="text-sm text-green-600 animate-pulse">音声を認識中... マイクに向かって話してください</div>
          )}
        </div>

        <div>
          <Label>写真添付</Label>
          {!bucketExists}


\
