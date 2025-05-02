"use client"

import type React from "react"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { sampleProjects } from "@/data/sample-data"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { X, ChevronDown, ChevronUp } from "lucide-react"

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
    inspectorId: "",
    inspectionDate: format(new Date(), "yyyy-MM-dd"),
    checklistItems: checklistItems,
    comment: "",
    photoFile: null,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  // 巡視者のサンプルデータ
  const inspectors = [
    { id: "1", name: "山田 太郎" },
    { id: "2", name: "佐藤 次郎" },
    { id: "3", name: "鈴木 三郎" },
  ]

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
      // ここでAPIに送信する処理を実装
      console.log("送信データ:", formData)

      // 送信データを整形
      const selectedProject = sampleProjects.find((p) => p.id.toString() === formData.projectId)
      const selectedInspector = inspectors.find((i) => i.id === formData.inspectorId)

      const submittedData = {
        id: Date.now().toString(), // 一時的なID
        projectId: formData.projectId,
        projectName: selectedProject?.name || "不明なプロジェクト",
        inspectorId: formData.inspectorId,
        inspectorName: selectedInspector?.name || "不明な巡視者",
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm max-w-2xl mx-auto max-h-[90vh] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">安全・環境巡視日誌の作成</h2>
        <button type="button" onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        <div className="space-y-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
                対象工事 <span className="text-red-500">*</span>
              </label>
              <select
                id="projectId"
                name="projectId"
                value={formData.projectId}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">工事を選択</option>
                {sampleProjects.map((project) => (
                  <option key={project.id} value={project.id.toString()}>
                    {project.name}
                  </option>
                ))}
              </select>
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
                <option value="">巡視者を選択</option>
                {inspectors.map((inspector) => (
                  <option key={inspector.id} value={inspector.id}>
                    {inspector.name}
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
                                  item.status === "good" ? "bg-green-200 border border-green-300" : "hover:bg-gray-100"
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
                            <div className="mt-2">
                              <Textarea
                                value={item.comment}
                                onChange={(e) => updateChecklistItemComment(item.id, e.target.value)}
                                placeholder="コメントを入力してください"
                                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
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
            <Textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              placeholder="指摘事項や改善点などを入力してください"
              className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
    </div>
  )
}
