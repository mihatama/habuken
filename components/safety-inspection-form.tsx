"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Save, Download, Camera, Sun, Cloud, CloudRain } from "lucide-react"
import { sampleProjects } from "@/data/sample-data"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { useToast } from "@/components/ui/use-toast"
import { z } from "zod"

// InspectionItem型を追加
type InspectionItem = {
  id: number
  category: string
  item: string
  status: "ok" | "ng" | "na"
  notes: string
}

// バリデーションスキーマを追加
const inspectionFormSchema = z.object({
  projectId: z.string().min(1, "工事名を選択してください"),
  date: z.string().min(1, "日付を入力してください"),
  inspector: z.string().min(1, "点検者名を入力してください"),
  weather: z.string(),
  generalNotes: z.string().optional(),
})

// コンポーネントを分割するため、InspectionItemRowコンポーネントを追加
function InspectionItemRow({
  item,
  index,
  updateItem,
  removeItem,
  isRemoveDisabled,
}: {
  item: InspectionItem
  index: number
  updateItem: (id: number, field: string, value: string) => void
  removeItem: (id: number) => void
  isRemoveDisabled: boolean
}) {
  return (
    <TableRow>
      <TableCell>{index + 1}</TableCell>
      <TableCell>
        <Input
          value={item.category}
          onChange={(e) => updateItem(item.id, "category", e.target.value)}
          className="h-8"
          placeholder="カテゴリ"
          aria-label={`カテゴリ ${index + 1}`}
        />
      </TableCell>
      <TableCell>
        <Input
          value={item.item}
          onChange={(e) => updateItem(item.id, "item", e.target.value)}
          className="h-8"
          placeholder="点検項目"
          aria-label={`点検項目 ${index + 1}`}
        />
      </TableCell>
      <TableCell>
        <Select
          value={item.status}
          onValueChange={(value) => updateItem(item.id, "status", value)}
          aria-label={`状態 ${index + 1}`}
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ok">良好</SelectItem>
            <SelectItem value="ng">不良</SelectItem>
            <SelectItem value="na">該当なし</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Input
          value={item.notes}
          onChange={(e) => updateItem(item.id, "notes", e.target.value)}
          className="h-8"
          placeholder="備考"
          aria-label={`備考 ${index + 1}`}
        />
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeItem(item.id)}
          disabled={isRemoveDisabled}
          aria-label={`項目 ${index + 1} を削除`}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </TableCell>
    </TableRow>
  )
}

// InspectionPreviewコンポーネントを追加
function InspectionPreview({
  formData,
  inspectionItems,
  projectName,
  getDayOfWeek,
  getReiwaYear,
  getWeatherIcon,
}: {
  formData: any
  inspectionItems: InspectionItem[]
  projectName: string | undefined
  getDayOfWeek: (date: string) => string
  getReiwaYear: (date: string) => number
  getWeatherIcon: () => JSX.Element
}) {
  return (
    <div className="border rounded-md p-4 bg-white">
      <div className="text-center text-2xl font-bold mb-4">安全巡視記録</div>

      <div className="border border-gray-300">
        <div className="grid grid-cols-4 border-b border-gray-300">
          <div className="col-span-3 border-r border-gray-300 p-2">
            <div className="font-bold">工事名</div>
            <div>{projectName || "未選択"}</div>
          </div>
          <div className="p-2">
            <div className="font-bold">記録番号</div>
            <div>自動採番</div>
          </div>
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
              <div className="flex justify-center">{getWeatherIcon()}</div>
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

        <div className="border-b border-gray-300">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-r border-b border-gray-300 p-2 w-10">No.</th>
                <th className="border-r border-b border-gray-300 p-2">カテゴリ</th>
                <th className="border-r border-b border-gray-300 p-2">点検項目</th>
                <th className="border-r border-b border-gray-300 p-2">状態</th>
                <th className="border-b border-gray-300 p-2">備考</th>
              </tr>
            </thead>
            <tbody>
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
            </tbody>
          </table>
        </div>

        <div className="p-4">
          <div className="font-bold mb-2">総合所見</div>
          <div className="border border-gray-300 p-2 min-h-[100px]">{formData.generalNotes || "未入力"}</div>
        </div>
      </div>
    </div>
  )
}

export function SafetyInspectionForm() {
  // 既存のuseStateを保持
  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([
    { id: 1, category: "作業環境", item: "作業場所の整理整頓", status: "ok", notes: "" },
    { id: 2, category: "安全対策", item: "安全帯の着用", status: "ok", notes: "" },
    { id: 3, category: "機械設備", item: "重機の点検状況", status: "ok", notes: "" },
  ])
  const [formData, setFormData] = useState({
    projectId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    weather: "sunny",
    inspector: "",
    generalNotes: "",
  })

  // 新しいuseStateとuseToastを追加
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  // 曜日を取得する関数
  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "EEEE", { locale: ja })
  }

  // 令和年を取得する関数
  const getReiwaYear = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    // 令和は2019年5月1日から
    return year - 2018
  }

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
    const updatedItems = inspectionItems.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value }
      }
      return item
    })
    setInspectionItems(updatedItems)
  }

  // フォームバリデーション
  const validateForm = () => {
    try {
      inspectionFormSchema.parse(formData)
      setValidationErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message
          }
        })
        setValidationErrors(errors)
      }
      return false
    }
  }

  // 安全巡視記録を保存
  const saveInspection = async () => {
    if (!validateForm()) {
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

      // 成功トースト
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
      console.log("Excel出力:", {
        ...formData,
        inspectionItems,
      })
      // ここで実際のExcel出力処理を実装
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
    // カメラ機能の実装
    toast({
      title: "カメラ機能",
      description: "カメラ機能は実装中です",
    })
  }

  // 天気アイコンを取得
  const getWeatherIcon = () => {
    switch (formData.weather) {
      case "sunny":
        return <Sun className="h-5 w-5 text-yellow-500" aria-label="晴れ" />
      case "cloudy":
        return <Cloud className="h-5 w-5 text-gray-500" aria-label="曇り" />
      case "rainy":
        return <CloudRain className="h-5 w-5 text-blue-500" aria-label="雨" />
      default:
        return <Sun className="h-5 w-5 text-yellow-500" aria-label="晴れ" />
    }
  }

  // 選択されたプロジェクト名を取得
  const selectedProject = formData.projectId
    ? sampleProjects.find((p) => p.id.toString() === formData.projectId)
    : undefined

  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold text-center mb-6">安全巡視記録</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <Label htmlFor="projectId">
            工事名 <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.projectId}
            onValueChange={(value) => {
              setFormData({ ...formData, projectId: value })
              setValidationErrors({ ...validationErrors, projectId: "" })
            }}
          >
            <SelectTrigger id="projectId" className={validationErrors.projectId ? "border-red-500" : ""}>
              <SelectValue placeholder="工事を選択" />
            </SelectTrigger>
            <SelectContent>
              {sampleProjects.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.projectId && <p className="text-red-500 text-sm mt-1">{validationErrors.projectId}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">
              日付 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => {
                setFormData({ ...formData, date: e.target.value })
                setValidationErrors({ ...validationErrors, date: "" })
              }}
              className={validationErrors.date ? "border-red-500" : ""}
            />
            {validationErrors.date && <p className="text-red-500 text-sm mt-1">{validationErrors.date}</p>}
          </div>
          <div>
            <Label htmlFor="weather">天候</Label>
            <Select value={formData.weather} onValueChange={(value) => setFormData({ ...formData, weather: value })}>
              <SelectTrigger id="weather" className="flex items-center">
                {getWeatherIcon()}
                <SelectValue className="ml-2" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sunny">晴れ</SelectItem>
                <SelectItem value="cloudy">曇り</SelectItem>
                <SelectItem value="rainy">雨</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="inspector">
          点検者 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="inspector"
          value={formData.inspector}
          onChange={(e) => {
            setFormData({ ...formData, inspector: e.target.value })
            setValidationErrors({ ...validationErrors, inspector: "" })
          }}
          placeholder="点検者名"
          className={`mb-4 ${validationErrors.inspector ? "border-red-500" : ""}`}
        />
        {validationErrors.inspector && <p className="text-red-500 text-sm mt-1">{validationErrors.inspector}</p>}
      </div>

      <div className="border rounded-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">点検項目</h3>
          <Button onClick={addInspectionItem} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            項目を追加
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">No.</TableHead>
                <TableHead>カテゴリ</TableHead>
                <TableHead>点検項目</TableHead>
                <TableHead className="w-24">状態</TableHead>
                <TableHead>備考</TableHead>
                <TableHead className="w-20">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inspectionItems.map((item, index) => (
                <InspectionItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  updateItem={updateInspectionItem}
                  removeItem={removeInspectionItem}
                  isRemoveDisabled={inspectionItems.length <= 1}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <Label htmlFor="generalNotes">総合所見</Label>
        <Textarea
          id="generalNotes"
          value={formData.generalNotes}
          onChange={(e) => setFormData({ ...formData, generalNotes: e.target.value })}
          placeholder="総合所見を入力"
          className="min-h-[100px]"
        />
      </div>

      <div className="flex justify-between mt-6">
        <div className="flex space-x-2">
          <Button variant="outline" onClick={takePhoto}>
            <Camera className="h-4 w-4 mr-2" />
            写真撮影
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportToExcel} disabled={isSubmitting}>
            <Download className="h-4 w-4 mr-2" />
            Excel出力
          </Button>
          <Button onClick={saveInspection} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                保存中...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                保存
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-medium mb-4">プレビュー</h3>
        <InspectionPreview
          formData={formData}
          inspectionItems={inspectionItems}
          projectName={selectedProject?.name}
          getDayOfWeek={getDayOfWeek}
          getReiwaYear={getReiwaYear}
          getWeatherIcon={getWeatherIcon}
        />
      </div>
    </div>
  )
}
