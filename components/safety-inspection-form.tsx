"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { sampleProjects } from "@/data/sample-data"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { TextField, SelectField } from "@/components/ui/form-field"
import { DataTable } from "@/components/ui/data-table"
import { WeatherIcon } from "@/components/ui/weather-display"
import { ActionButtons } from "@/components/ui/action-buttons"
import { PreviewContainer, PreviewSection, PreviewHeader, PreviewTable } from "@/components/ui/preview-container"
import { getDayOfWeek, getReiwaYear } from "@/utils/date-utils"
import { validateWithSchema, inspectionFormSchema, type ValidationErrors } from "@/utils/form-validation"

// InspectionItem型を追加
type InspectionItem = {
  id: number
  category: string
  item: string
  status: "ok" | "ng" | "na"
  notes: string
}

// 状態の型定義
type FormData = {
  projectId: string
  date: string
  weather: string
  inspector: string
  generalNotes: string
}

export function SafetyInspectionForm() {
  // 状態管理
  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([
    { id: 1, category: "作業環境", item: "作業場所の整理整頓", status: "ok", notes: "" },
    { id: 2, category: "安全対策", item: "安全帯の着用", status: "ok", notes: "" },
    { id: 3, category: "機械設備", item: "重機の点検状況", status: "ok", notes: "" },
  ])
  const [formData, setFormData] = useState<FormData>({
    projectId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    weather: "sunny",
    inspector: "",
    generalNotes: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const { toast } = useToast()

  // 点検項目を追加
  const addInspectionItem = () => {
    const newId = inspectionItems.length > 0 ? Math.max(...inspectionItems.map((item) => item.id)) + 1 : 1
    setInspectionItems([...inspectionItems, { id: newId, category: "", item: "", status: "ok", notes: "" }])
  }

  // 点検項目を削除
  const removeInspectionItem = (id: number) => {
    setInspectionItems(inspectionItems.filter((item) => item.id !== id))
  }

  // 点検項目情報の更新
  const updateInspectionItem = (id: number, field: string, value: string) => {
    setInspectionItems(inspectionItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  // フォームの値を更新
  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: "" })
    }
  }

  // 安全巡視記録を保存
  const saveInspection = async () => {
    const { isValid, errors } = validateWithSchema(inspectionFormSchema, formData)

    if (!isValid) {
      setValidationErrors(errors)
      toast({
        title: "入力エラー",
        description: "必須項目を入力してください",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const inspectionData = {
        ...formData,
        inspectionItems,
        createdAt: new Date(),
      }
      console.log("保存された安全巡視記録:", inspectionData)
      // ここで実際のAPIに保存処理を実装

      toast({
        title: "保存完了",
        description: "安全巡視記録が保存されました",
      })
    } catch (error) {
      console.error("保存エラー:", error)
      toast({
        title: "保存エラー",
        description: "安全巡視記録の保存に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Excelとして出力
  const exportToExcel = () => {
    try {
      console.log("Excel出力:", { ...formData, inspectionItems })
      toast({
        title: "Excel出力",
        description: "Excelファイルがダウンロードされます",
      })
    } catch (error) {
      console.error("Excel出力エラー:", error)
      toast({
        title: "出力エラー",
        description: "Excelファイルの出力に失敗しました",
        variant: "destructive",
      })
    }
  }

  // 写真を撮影
  const takePhoto = () => {
    toast({
      title: "カメラ機能",
      description: "カメラ機能は実装中です",
    })
  }

  // 選択されたプロジェクト名を取得
  const selectedProject = formData.projectId
    ? sampleProjects.find((p) => p.id.toString() === formData.projectId)
    : undefined

  // 天気オプションの設定
  const weatherOptions = [
    { value: "sunny", label: "晴れ" },
    { value: "cloudy", label: "曇り" },
    { value: "rainy", label: "雨" },
  ]

  // 点検項目のテーブル列定義
  const inspectionColumns = [
    { header: "No.", accessor: (_, index: number) => index + 1, className: "w-10" },
    {
      header: "カテゴリ",
      accessor: (item: InspectionItem) => (
        <input
          value={item.category}
          onChange={(e) => updateInspectionItem(item.id, "category", e.target.value)}
          className="w-full h-8 px-3 py-2 border border-gray-300 rounded-md"
          placeholder="カテゴリ"
        />
      ),
    },
    {
      header: "点検項目",
      accessor: (item: InspectionItem) => (
        <input
          value={item.item}
          onChange={(e) => updateInspectionItem(item.id, "item", e.target.value)}
          className="w-full h-8 px-3 py-2 border border-gray-300 rounded-md"
          placeholder="点検項目"
        />
      ),
    },
    {
      header: "状態",
      accessor: (item: InspectionItem) => (
        <select
          value={item.status}
          onChange={(e) => updateInspectionItem(item.id, "status", e.target.value)}
          className="w-full h-8 px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="ok">良好</option>
          <option value="ng">不良</option>
          <option value="na">該当なし</option>
        </select>
      ),
      className: "w-24",
    },
    {
      header: "備考",
      accessor: (item: InspectionItem) => (
        <input
          value={item.notes}
          onChange={(e) => updateInspectionItem(item.id, "notes", e.target.value)}
          className="w-full h-8 px-3 py-2 border border-gray-300 rounded-md"
          placeholder="備考"
        />
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold text-center mb-6">安全巡視記録</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <SelectField
          id="projectId"
          label="工事名"
          value={formData.projectId}
          onChange={(value) => updateFormData("projectId", value)}
          options={sampleProjects.map((project) => ({ value: project.id.toString(), label: project.name }))}
          placeholder="工事を選択"
          required
          error={validationErrors.projectId}
        />

        <div className="grid grid-cols-2 gap-4">
          <TextField
            id="date"
            label="日付"
            value={formData.date}
            onChange={(value) => updateFormData("date", value)}
            type="date"
            required
            error={validationErrors.date}
          />
          <SelectField
            id="weather"
            label="天候"
            value={formData.weather}
            onChange={(value) => updateFormData("weather", value)}
            options={weatherOptions}
            icon={<WeatherIcon weather={formData.weather as any} />}
          />
        </div>
      </div>

      <TextField
        id="inspector"
        label="点検者"
        value={formData.inspector}
        onChange={(value) => updateFormData("inspector", value)}
        placeholder="点検者名"
        required
        error={validationErrors.inspector}
      />

      <DataTable
        data={inspectionItems}
        columns={inspectionColumns}
        onAdd={addInspectionItem}
        onDelete={removeInspectionItem}
        getRowId={(item) => item.id}
        addButtonLabel="項目を追加"
        isDeleteDisabled={(item) => inspectionItems.length <= 1}
      />

      <div>
        <label htmlFor="generalNotes" className="block text-sm font-medium text-gray-700 mb-1">
          総合所見
        </label>
        <Textarea
          id="generalNotes"
          value={formData.generalNotes}
          onChange={(e) => updateFormData("generalNotes", e.target.value)}
          placeholder="総合所見を入力"
          className="min-h-[100px]"
        />
      </div>

      <ActionButtons onSave={saveInspection} onExport={exportToExcel} onPhoto={takePhoto} isSubmitting={isSubmitting} />

      <PreviewContainer title="安全巡視記録">
        <PreviewSection>
          <div className="grid grid-cols-4 border-b border-gray-300">
            <PreviewHeader
              title="工事名"
              value={selectedProject?.name || "未選択"}
              colSpan={3}
              className="border-r border-gray-300"
            />
            <PreviewHeader title="記録番号" value="自動採番" />
          </div>

          <div className="grid grid-cols-6 border-b border-gray-300">
            <div className="col-span-4 border-r border-gray-300 p-2">
              <div className="flex items-center">
                <span>令和</span>
                <span className="mx-2">{getReiwaYear(formData.date)}</span>
                <span>年</span>
                <span className="mx-2">{new Date(formData.date).getMonth() + 1}</span>
                <span>月</span>
                <span className="mx-2">{new Date(formData.date).getDate()}</span>
                <span>日</span>
                <span className="mx-2">（{getDayOfWeek(formData.date)}）</span>
              </div>
            </div>
            <div className="col-span-1 border-r border-gray-300 p-2 flex items-center justify-center">
              <div className="text-center">
                <div className="font-bold">天候</div>
                <div className="flex justify-center">
                  <WeatherIcon weather={formData.weather as any} size="md" />
                </div>
              </div>
            </div>
            <div className="col-span-1 p-2">
              <div className="font-bold">承認</div>
              <div></div>
            </div>
          </div>

          <div className="grid grid-cols-6 border-b border-gray-300">
            <div className="col-span-6 p-2">
              <div className="font-bold">点検者</div>
              <div>{formData.inspector || "未入力"}</div>
            </div>
          </div>

          <PreviewTable headers={["No.", "カテゴリ", "点検項目", "状態", "備考"]}>
            {inspectionItems.map((item, index) => (
              <tr key={item.id}>
                <td className="border-r border-b border-gray-300 p-2 text-center">{index + 1}</td>
                <td className="border-r border-b border-gray-300 p-2">{item.category}</td>
                <td className="border-r border-b border-gray-300 p-2">{item.item}</td>
                <td className="border-r border-b border-gray-300 p-2 text-center">
                  {item.status === "ok" ? "良好" : item.status === "ng" ? "不良" : "該当なし"}
                </td>
                <td className="border-b border-gray-300 p-2">{item.notes}</td>
              </tr>
            ))}
          </PreviewTable>

          <div className="p-4">
            <div className="font-bold mb-2">総合所見</div>
            <div className="border border-gray-300 p-2 min-h-[100px]">{formData.generalNotes || "未入力"}</div>
          </div>
        </PreviewSection>
      </PreviewContainer>
    </div>
  )
}
