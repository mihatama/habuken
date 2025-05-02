"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { X, ChevronDown, ChevronUp, Mic, MicOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { getClientSupabase } from "@/lib/supabase-utils"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"

// チェックリスト項目の型定義
type ChecklistItem = {
  id: string
  category: string
  name: string
  status: "good" | "caution" | "danger"
  comment: string // コメントフィールドを追加
  isEco?: boolean
}

// フォームデータの型定義
type FormData = {
  projectId: string
  customProjectName: string // カスタムプロジェクト名を追加
  inspectorId: string
  inspectionDate: string
  checklistItems: ChecklistItem[]
  comment: string
  photoFile: File | null
}

// SafetyInspectionFormのプロパティ型定義
interface SafetyInspectionFormProps {
  onSuccess?: (data: any) => void
  onCancel?: () => void
}

// チェックリスト項目の定義
const checklistItems: ChecklistItem[] = [
  // 作業員カテゴリ
  {
    id: "protective_gear",
    category: "作業員",
    name: "保護帽、服装、はきもの",
    status: "good",
    comment: "",
    isEco: false,
  },
  {
    id: "protective_equipment",
    category: "作業員",
    name: "保護具の使用の状況",
    status: "good",
    comment: "",
    isEco: false,
  },
  { id: "danger_zone", category: "作業員", name: "立入禁止(危険)", status: "good", comment: "", isEco: false },
  {
    id: "environmental_instructions",
    category: "作業員",
    name: "環境指示を確認しているか",
    status: "good",
    comment: "",
    isEco: true,
  },
  {
    id: "environmental_goals",
    category: "作業員",
    name: "環境目標は達成したか",
    status: "good",
    comment: "",
    isEco: true,
  },

  // 機械器具カテゴリ
  { id: "work_area", category: "機械器具", name: "作業(掘削)場所の整備", status: "good", comment: "", isEco: false },
  {
    id: "operation_method",
    category: "機械器具",
    name: "操作(作業)方法・資格",
    status: "good",
    comment: "",
    isEco: false,
  },
  { id: "maintenance", category: "機械器具", name: "整備・点検状況", status: "good", comment: "", isEco: false },
  { id: "low_noise", category: "機械器具", name: "排対・低騒音型の機械か", status: "good", comment: "", isEco: true },
  {
    id: "noise_vibration",
    category: "機械器具",
    name: "周辺への騒音、振動対策は良いか",
    status: "good",
    comment: "",
    isEco: true,
  },
  {
    id: "abnormal_sound",
    category: "機械器具",
    name: "機械からの異常音は良いか",
    status: "good",
    comment: "",
    isEco: true,
  },
  {
    id: "fuel_oil_leak",
    category: "機械器具",
    name: "機械の燃料・オイル漏れは無いか",
    status: "good",
    comment: "",
    isEco: true,
  },
  {
    id: "pre_check",
    category: "機械器具",
    name: "車両・重機の使用前点検はしたか",
    status: "good",
    comment: "",
    isEco: true,
  },
  {
    id: "idling_stop",
    category: "機械器具",
    name: "アイドリングストップをしたか",
    status: "good",
    comment: "",
    isEco: true,
  },

  // 交通安全カテゴリ
  { id: "signs", category: "交通安全", name: "標識の保全", status: "good", comment: "", isEco: false },
  {
    id: "traffic_facilities",
    category: "交通安全",
    name: "交通安全施設の保全",
    status: "good",
    comment: "",
    isEco: false,
  },
  { id: "traffic_control", category: "交通安全", name: "交通整理の状況", status: "good", comment: "", isEco: false },
  { id: "road_condition", category: "交通安全", name: "路面状況(段差)", status: "good", comment: "", isEco: false },

  // 工事現場カテゴリ
  { id: "scaffolding", category: "工事現場", name: "型枠、足場工、昇降路", status: "good", comment: "", isEco: false },
  { id: "excavation", category: "工事現場", name: "掘削方法", status: "good", comment: "", isEco: false },
  { id: "passage", category: "工事現場", name: "通路・出入口", status: "good", comment: "", isEco: false },
  { id: "dust_measures", category: "工事現場", name: "ホコリ対策は良いか", status: "good", comment: "", isEco: true },
  { id: "water_measures", category: "工事現場", name: "濁水対策は良いか", status: "good", comment: "", isEco: true },
  { id: "odor_measures", category: "工事現場", name: "悪臭対策は良いか", status: "good", comment: "", isEco: true },
  { id: "waste_disposal", category: "工事現場", name: "廃棄物の適正処理", status: "good", comment: "", isEco: true },
  { id: "complaints", category: "工事現場", name: "苦情は無いか", status: "good", comment: "", isEco: true },
  { id: "cleanup", category: "工事現場", name: "跡片付、整理、清掃状況", status: "good", comment: "", isEco: true },
  {
    id: "electrical",
    category: "工事現場",
    name: "電気のつっぱなし・消し忘れはないか",
    status: "good",
    comment: "",
    isEco: true,
  },
  {
    id: "water_leakage",
    category: "工事現場",
    name: "水の出しっぱなし・閉め忘れはないか",
    status: "good",
    comment: "",
    isEco: true,
  },
]

// カテゴリーのリスト
const categories = ["作業員", "機械器具", "交通安全", "工事現場"]

export function SafetyInspectionForm({ onSuccess, onCancel }: SafetyInspectionFormProps) {
  // 状態管理
  const [formData, setFormData] = useState<FormData>({
    projectId: "",
    customProjectName: "",
    inspectorId: "",
    inspectionDate: format(new Date(), "yyyy-MM-dd"),
    checklistItems: checklistItems,
    comment: "",
    photoFile: null,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [deals, setDeals] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabase, setSupabase] = useState<any>(null)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const { toast } = useToast()

  const { isRecording, activeId, startRecording, stopRecording } = useSpeechRecognition()

  // 音声入力の処理
  const handleVoiceInput = (id: string) => {
    if (isRecording && activeId === id) {
      stopRecording()
    } else {
      startRecording(id, (text) => {
        updateChecklistItemComment(id, formData.checklistItems.find((item) => item.id === id)?.comment + text)
      })
    }
  }

  // 総合コメント用の音声入力処理
  const handleGeneralCommentVoiceInput = () => {
    const generalCommentId = "general-comment"
    if (isRecording && activeId === generalCommentId) {
      stopRecording()
    } else {
      startRecording(generalCommentId, (text) => {
        setFormData((prev) => ({ ...prev, comment: prev.comment + text }))
      })
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

        // スタッフデータ取得後に追加するコード
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

    // 注意または危険を選択した場合、コメント入力欄を自動的に展開
    if (status === "caution" || status === "danger") {
      setExpandedItems((prev) => ({ ...prev, [id]: true }))
    }
  }

  // チェックリスト項目のコメント更新
  const updateChecklistItemComment = (id: string, comment: string) => {
    setFormData((prev) => ({
      ...prev,
      checklistItems: prev.checklistItems.map((item) => (item.id === id ? { ...item, comment } : item)),
    }))
  }

  // コメント入力欄の表示/非表示を切り替え
  const toggleCommentField = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // 案件選択の処理
  const handleProjectChange = (value: string) => {
    setFormData({ ...formData, projectId: value })
    setShowCustomInput(value === "custom")
    if (value === "custom") {
      setTimeout(() => document.getElementById("customProjectName")?.focus(), 100)
    } else {
      setFormData((prev) => ({ ...prev, customProjectName: "" }))
    }
  }

  // 入力フィールドの変更を処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // ファイル選択の処理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, photoFile: e.target.files![0] }))
    }
  }

  // ファイルの削除
  const removeFile = () => {
    setFormData((prev) => ({ ...prev, photoFile: null }))
  }

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // 案件選択の検証
      if (formData.projectId === "custom") {
        if (!formData.customProjectName.trim()) {
          toast({
            title: "入力エラー",
            description: "案件名を入力してください",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }
      } else if (formData.projectId === "" || formData.projectId === "placeholder") {
        toast({
          title: "入力エラー",
          description: "案件を選択してください",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (!formData.inspectorId || formData.inspectorId === "placeholder") {
        toast({
          title: "入力エラー",
          description: "巡視者を選択してください",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // ここでAPIに送信する処理を実装
      console.log("送信データ:", formData)

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
      if (!selectedStaff) {
        toast({
          title: "エラー",
          description: "選択したスタッフ情報が見つかりません。別のスタッフを選択してください。",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // 送信データを整形
      const submittedData = {
        id: Date.now().toString(), // 一時的なID
        projectId: formData.projectId === "custom" ? null : formData.projectId,
        projectName: projectName || "不明なプロジェクト",
        customProjectName: formData.projectId === "custom" ? formData.customProjectName : null,
        inspectorId: formData.inspectorId,
        inspectorName: selectedStaff?.full_name || "不明な巡視者",
        inspectionDate: formData.inspectionDate,
        checklistItems: formData.checklistItems,
        comment: formData.comment,
        photoFile: formData.photoFile,
        status: "完了",
        createdAt: new Date().toISOString(),
      }

      toast({
        title: "保存完了",
        description: "安全・環境巡視日誌が保存されました",
      })

      // 成功コールバックを呼び出し
      if (onSuccess) {
        onSuccess(submittedData)
      }
    } catch (error) {
      console.error("保存エラー:", error)
      toast({
        title: "保存エラー",
        description: "安全・環境巡視日誌の保存に失敗しました",
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
        return "bg-green-100"
      case "caution":
        return "bg-yellow-100"
      case "danger":
        return "bg-red-100"
      default:
        return ""
    }
  }

  // エラーがある場合はエラーメッセージを表示
  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
        <div className="py-6 text-center text-red-500">
          <p>{error}</p>
          <p className="mt-4">ページを再読み込みしてもう一度お試しください。</p>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => window.location.reload()}>ページを再読み込み</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm max-w-2xl mx-auto max-h-[90vh] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">安全・環境巡視日誌の作成</h2>
        <button type="button" onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center">
          <p>データを読み込み中...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="projectId" className="block text-sm font-medium text-gray-700">
                  案件名 <span className="text-red-500">*</span>
                </label>
                <select
                  id="projectId"
                  value={formData.projectId}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="placeholder" disabled>
                    案件を選択してください
                  </option>
                  {deals.map((deal: any) => (
                    <option key={`deal-${deal.id}`} value={deal.id}>
                      {deal.name}
                    </option>
                  ))}
                  <option value="custom">その他（手入力）</option>
                </select>

                {showCustomInput && (
                  <Input
                    id="customProjectName"
                    placeholder="案件名を入力"
                    value={formData.customProjectName}
                    onChange={(e) => setFormData({ ...formData, customProjectName: e.target.value })}
                  />
                )}
              </div>

              <div>
                <label htmlFor="inspectorId" className="block text-sm font-medium text-gray-700 mb-1">
                  巡視者 <span className="text-red-500">*</span>
                </label>
                <select
                  id="inspectorId"
                  name="inspectorId"
                  value={formData.inspectorId}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="placeholder" disabled>
                    巡視者を選択してください
                  </option>
                  {staff.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="inspectionDate" className="block text-sm font-medium text-gray-700 mb-1">
                巡視日 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="inspectionDate"
                name="inspectionDate"
                value={formData.inspectionDate}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <h3 className="text-sm font-medium text-gray-700 mb-2">チェックリスト</h3>
            <div className="border rounded-md flex-1 overflow-hidden flex flex-col">
              <div className="p-4 overflow-y-auto flex-1">
                {categories.map((category) => (
                  <div key={category} className="space-y-3 mb-6">
                    <h4 className="font-medium text-sm border-b pb-1 sticky top-0 bg-white z-10">{category}</h4>
                    <div className="space-y-4">
                      {formData.checklistItems
                        .filter((item) => item.category === category)
                        .map((item) => (
                          <div key={item.id} className={`rounded-md ${getStatusBgColor(item.status)} p-2`}>
                            <div className="flex items-center justify-between">
                              <div className="w-64 text-sm flex items-center">
                                <span>{item.name}</span>
                                {item.isEco && (
                                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
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
                                      ? "bg-green-200 border border-green-300"
                                      : "hover:bg-gray-100"
                                  }`}
                                >
                                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white text-xs">
                                    ○
                                  </span>
                                  <span className="ml-1 text-xs">良好</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => updateChecklistItemStatus(item.id, "caution")}
                                  className={`flex items-center px-2 py-1 rounded-md transition-colors ${
                                    item.status === "caution"
                                      ? "bg-yellow-200 border border-yellow-300"
                                      : "hover:bg-gray-100"
                                  }`}
                                >
                                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-yellow-500 text-white text-xs">
                                    △
                                  </span>
                                  <span className="ml-1 text-xs">注意</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => updateChecklistItemStatus(item.id, "danger")}
                                  className={`flex items-center px-2 py-1 rounded-md transition-colors ${
                                    item.status === "danger" ? "bg-red-200 border border-red-300" : "hover:bg-gray-100"
                                  }`}
                                >
                                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs">
                                    ○
                                  </span>
                                  <span className="ml-1 text-xs">危険</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => toggleCommentField(item.id)}
                                  className="ml-2 text-gray-500 hover:text-gray-700"
                                >
                                  {expandedItems[item.id] ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {expandedItems[item.id] && (
                              <div className="mt-2 relative">
                                <Textarea
                                  value={item.comment}
                                  onChange={(e) => updateChecklistItemComment(item.id, e.target.value)}
                                  placeholder="コメントを入力してください"
                                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleVoiceInput(item.id)}
                                  className={`absolute right-2 bottom-2 p-1 rounded-full ${
                                    isRecording && activeId === item.id
                                      ? "bg-red-100 text-red-500"
                                      : "bg-gray-100 text-gray-500"
                                  }`}
                                >
                                  {isRecording && activeId === item.id ? (
                                    <MicOff className="h-4 w-4" />
                                  ) : (
                                    <Mic className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-4">
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                総合コメント
              </label>
              <div className="relative">
                <Textarea
                  id="comment"
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  placeholder="指摘事項や改善点などを入力してください"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleGeneralCommentVoiceInput}
                  className={`absolute right-2 bottom-2 p-1 rounded-full ${
                    isRecording && activeId === "general-comment"
                      ? "bg-red-100 text-red-500"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {isRecording && activeId === "general-comment" ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">写真添付</label>
              {formData.photoFile ? (
                <div className="flex items-center justify-between border rounded-md p-2">
                  <span className="text-sm truncate">{formData.photoFile.name}</span>
                  <button type="button" onClick={removeFile} className="text-gray-500 hover:text-gray-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="border border-dashed border-gray-300 rounded-md p-4">
                  <input type="file" id="photoFile" accept="image/*" onChange={handleFileChange} className="hidden" />
                  <label htmlFor="photoFile" className="flex flex-col items-center justify-center cursor-pointer">
                    <span className="text-sm text-gray-500">ファイルは選択されていません</span>
                    <span className="mt-1 text-sm text-blue-500">ファイルを選択</span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
              >
                {isSubmitting ? "保存中..." : "保存"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
