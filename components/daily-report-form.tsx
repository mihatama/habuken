"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mic, MicOff } from "lucide-react"
import { sampleProjects, sampleStaff } from "@/data/sample-data"
import { format } from "date-fns"
import { getWeatherData } from "@/lib/weather-api"
import { useToast } from "@/components/ui/use-toast"
import { TextField, SelectField } from "@/components/ui/form-field"
import { DataTable } from "@/components/ui/data-table"
import { WeatherIcon } from "@/components/ui/weather-display"
import { ActionButtons } from "@/components/ui/action-buttons"
import { PreviewContainer, PreviewSection, PreviewHeader, PreviewTable } from "@/components/ui/preview-container"
import { getDayOfWeek, getReiwaYear } from "@/utils/date-utils"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { Button } from "@/components/ui/button"

// 基本的な型定義
type Worker = {
  id: number
  name: string
  workHours: string
  overtimeHours: string
  notes: string
  workContent: string
}

type Material = {
  id: number
  name: string
  spec: string
  unit: string
  quantity: string
  machineType: string
  model: string
  units: string
  status: string
}

type OtherMachine = {
  id: number
  name: string
  operator: string
  units: string
  status: string
}

type FormDataType = {
  projectId: string
  date: string
  weather: string
  temperature: number
  weatherDescription: string
  weatherIcon: string
}

export function DailyReportForm() {
  // 状態管理
  const [workers, setWorkers] = useState<Worker[]>([
    { id: 1, name: "", workHours: "", overtimeHours: "", notes: "", workContent: "" },
  ])
  const [materials, setMaterials] = useState<Material[]>([
    { id: 1, name: "", spec: "", unit: "", quantity: "", machineType: "", model: "", units: "", status: "" },
  ])
  const [otherMachines, setOtherMachines] = useState<OtherMachine[]>([
    { id: 1, name: "", operator: "", units: "", status: "" },
  ])
  const [formData, setFormData] = useState<FormDataType>({
    projectId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    weather: "sunny",
    temperature: 0,
    weatherDescription: "",
    weatherIcon: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("workers")
  const { toast } = useToast()

  // 音声認識フックを使用
  const { isRecording, activeId, startRecording, stopRecording } = useSpeechRecognition()

  // 作業員を追加
  const addWorker = () => {
    const newId = workers.length > 0 ? Math.max(...workers.map((w) => w.id)) + 1 : 1
    setWorkers([...workers, { id: newId, name: "", workHours: "", overtimeHours: "", notes: "", workContent: "" }])
  }

  // 作業員を削除
  const removeWorker = (id: number) => {
    setWorkers(workers.filter((worker) => worker.id !== id))
  }

  // 資材を追加
  const addMaterial = () => {
    const newId = materials.length > 0 ? Math.max(...materials.map((m) => m.id)) + 1 : 1
    setMaterials([
      ...materials,
      { id: newId, name: "", spec: "", unit: "", quantity: "", machineType: "", model: "", units: "", status: "" },
    ])
  }

  // 資材を削除
  const removeMaterial = (id: number) => {
    setMaterials(materials.filter((material) => material.id !== id))
  }

  // 他社機械を追加
  const addOtherMachine = () => {
    const newId = otherMachines.length > 0 ? Math.max(...otherMachines.map((m) => m.id)) + 1 : 1
    setOtherMachines([...otherMachines, { id: newId, name: "", operator: "", units: "", status: "" }])
  }

  // 他社機械を削除
  const removeOtherMachine = (id: number) => {
    setOtherMachines(otherMachines.filter((machine) => machine.id !== id))
  }

  // 音声認識の開始
  const handleStartRecording = (workerId: number) => {
    startRecording(workerId, (text) => {
      setWorkers(
        workers.map((worker) => {
          if (worker.id === workerId) {
            return {
              ...worker,
              workContent: worker.workContent + text,
            }
          }
          return worker
        }),
      )
    })
  }

  // 作業員情報の更新
  const updateWorker = (id: number, field: string, value: string) => {
    setWorkers(workers.map((worker) => (worker.id === id ? { ...worker, [field]: value } : worker)))
  }

  // 資材情報の更新
  const updateMaterial = (id: number, field: string, value: string) => {
    setMaterials(materials.map((material) => (material.id === id ? { ...material, [field]: value } : material)))
  }

  // 他社機械情報の更新
  const updateOtherMachine = (id: number, field: string, value: string) => {
    setOtherMachines(otherMachines.map((machine) => (machine.id === id ? { ...machine, [field]: value } : machine)))
  }

  // 日報を保存
  const saveReport = async () => {
    setIsSubmitting(true)
    try {
      const reportData = {
        ...formData,
        workers,
        materials,
        otherMachines,
        createdAt: new Date(),
      }
      console.log("保存された日報:", reportData)
      // ここで実際のAPIに保存処理を実装

      toast({
        title: "保存完了",
        description: "日報が保存されました",
      })
    } catch (error) {
      console.error("保存エラー:", error)
      toast({
        title: "保存エラー",
        description: "日報の保存に失敗しました",
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
        workers,
        materials,
        otherMachines,
      })
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

  // コンポーネントがマウントされたときに天気情報を取得
  useEffect(() => {
    async function fetchWeatherData() {
      try {
        const weatherData = await getWeatherData()
        setFormData((prev) => ({
          ...prev,
          weather: weatherData.weather,
          temperature: weatherData.temperature,
          weatherDescription: weatherData.description,
          weatherIcon: weatherData.icon,
        }))
      } catch (error) {
        console.error("天気情報の取得に失敗しました:", error)
      }
    }

    fetchWeatherData()
  }, [])

  // 選択されたプロジェクト名を取得
  const selectedProject = formData.projectId
    ? sampleProjects.find((p) => p.id.toString() === formData.projectId)
    : undefined

  // 天気オプションの設定
  const weatherOptions = [
    { value: "sunny", label: "晴れ" },
    { value: "cloudy", label: "曇り" },
    { value: "rainy", label: "雨" },
    { value: "snowy", label: "雪" },
  ]

  // 作業員のテーブル列定義
  const workerColumns = [
    { header: "No.", accessor: (_, index: number) => index + 1, className: "w-10" },
    {
      header: "氏名",
      accessor: (item: Worker) => (
        <select
          value={item.name}
          onChange={(e) => updateWorker(item.id, "name", e.target.value)}
          className="w-full h-8 px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">選択</option>
          {sampleStaff.map((staff) => (
            <option key={staff.id} value={staff.name}>
              {staff.name}
            </option>
          ))}
        </select>
      ),
    },
    {
      header: "労働時間",
      accessor: (item: Worker) => (
        <input
          type="number"
          value={item.workHours}
          onChange={(e) => updateWorker(item.id, "workHours", e.target.value)}
          className="w-full h-8 px-3 py-2 border border-gray-300 rounded-md"
          placeholder="時間"
        />
      ),
      className: "w-24",
    },
    {
      header: "残業",
      accessor: (item: Worker) => (
        <input
          type="number"
          value={item.overtimeHours}
          onChange={(e) => updateWorker(item.id, "overtimeHours", e.target.value)}
          className="w-full h-8 px-3 py-2 border border-gray-300 rounded-md"
          placeholder="時間"
        />
      ),
      className: "w-24",
    },
    {
      header: "記事",
      accessor: (item: Worker) => (
        <input
          value={item.notes}
          onChange={(e) => updateWorker(item.id, "notes", e.target.value)}
          className="w-full h-8 px-3 py-2 border border-gray-300 rounded-md"
          placeholder="記事"
        />
      ),
    },
    {
      header: "作業内容",
      accessor: (item: Worker) => (
        <div className="flex">
          <Textarea
            value={item.workContent}
            onChange={(e) => updateWorker(item.id, "workContent", e.target.value)}
            className="min-h-[60px] text-sm"
            placeholder="作業内容"
          />
          <div className="flex flex-col ml-1">
            {isRecording && activeId === item.id ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={stopRecording}
                className="h-8 w-8 text-red-500"
                aria-label="音声入力停止"
              >
                <MicOff className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleStartRecording(item.id)}
                className="h-8 w-8"
                aria-label="音声入力開始"
              >
                <Mic className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ),
    },
  ]

  // 資材のテーブル列定義
  const materialColumns = [
    {
      header: "資材名",
      accessor: (item: Material) => (
        <input
          value={item.name}
          onChange={(e) => updateMaterial(item.id, "name", e.target.value)}
          className="w-full h-8 px-3 py-2 border border-gray-300 rounded-md"
          placeholder="資材名"
        />
      ),
    },
    {
      header: "規格",
      accessor: (item: Material) => (
        <input
          value={item.spec}
          onChange={(e) => updateMaterial(item.id, "spec", e.target.value)}
          className="w-full h-8 px-3 py-2 border border-gray-300 rounded-md"
          placeholder="規格"
        />
      ),
    },
    {
      header: "単位",
      accessor: (item: Material) => (
        <input
          value={item.unit}
          onChange={(e) => updateMaterial(item.id, "unit", e.target.value)}
          className="w-full h-8 px-3 py-2 border border-gray-300 rounded-md"
          placeholder="単位"
        />
      ),
    },
    {
      header: "搬入数",
      accessor: (item: Material) => (
        <input
          type="number"
          value={item.quantity}
          onChange={(e) => updateMaterial(item.id, "quantity", e.target.value)}
          className="w-full h-8 px-3 py-2 border border-gray-300 rounded-md"
          placeholder="数量"
        />
      ),
    },
    {
      header: "自社機械名",
      accessor: (item: Material) => (
        <input
          value={item.machineType}
          onChange={(e) => updateMaterial(item.id, "machineType", e.target.value)}
          className="w-full h-8 px-3 py-2 border border-gray-300 rounded-md"
          placeholder="機械名"
        />
      ),
    },
    {
      header: "型式",
      accessor: (item: Material) => (
        <input
          value={item.model}
          onChange={(e) => updateMaterial(item.id, "model", e.target.value)}
          className="w-full h-8 px-3 py-2 border border-gray-300 rounded-md"
          placeholder="型式"
        />
      ),
    },
    {
      header: "台数",
      accessor: (item: Material) => (
        <input
          type="number"
          value={item.units}
          onChange={(e) => updateMaterial(item.id, "units", e.target.value)}
          className="w-full h-8 px-3 py-2 border border-gray-300 rounded-md"
          placeholder="台数"
        />
      ),
    },
    {
      header: "稼働",
      accessor: (item: Material) => (
        <input
          value={item.status}
          onChange={(e) => updateMaterial(item.id, "status", e.target.value)}
          className="w-full h-8 px-3 py-2 border border-gray-300 rounded-md"
          placeholder="稼働"
        />
      ),
    },
  ]

  // 他社機械のテーブル列定義
  const machineColumns = [
    {
      header: "他社機械名",
      accessor: (item: OtherMachine) => (
        <input
          value={item.name}
          onChange={(e) => updateOtherMachine(item.id, "name", e.target.value)}
          className="w-full h-8 px-3 py-2 border border-gray-300 rounded-md"
          placeholder="機械名"
        />
      ),
    },
    {
      header: "業者名",
      accessor: (item: OtherMachine) => (
        <input
          value={item.operator}
          onChange={(e) => updateOtherMachine(item.id, "operator", e.target.value)}
          className="w-full h-8 px-3 py-2 border border-gray-300 rounded-md"
          placeholder="業者名"
        />
      ),
    },
    {
      header: "台数",
      accessor: (item: OtherMachine) => (
        <input
          type="number"
          value={item.units}
          onChange={(e) => updateOtherMachine(item.id, "units", e.target.value)}
          className="w-full h-8 px-3 py-2 border border-gray-300 rounded-md"
          placeholder="台数"
        />
      ),
    },
    {
      header: "稼働",
      accessor: (item: OtherMachine) => (
        <input
          value={item.status}
          onChange={(e) => updateOtherMachine(item.id, "status", e.target.value)}
          className="w-full h-8 px-3 py-2 border border-gray-300 rounded-md"
          placeholder="稼働"
        />
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold text-center mb-6">作業日報</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <SelectField
          id="projectId"
          label="工事名"
          value={formData.projectId}
          onChange={(value) => setFormData({ ...formData, projectId: value })}
          options={sampleProjects.map((project) => ({ value: project.id.toString(), label: project.name }))}
          placeholder="工事を選択"
        />

        <div className="grid grid-cols-2 gap-4">
          <TextField
            id="date"
            label="日付"
            value={formData.date}
            onChange={(value) => setFormData({ ...formData, date: value })}
            type="date"
          />
          <div>
            <label htmlFor="weather" className="block text-sm font-medium text-gray-700 mb-1">
              天候
            </label>
            <div className="flex flex-col">
              <SelectField
                id="weather"
                label=""
                value={formData.weather}
                onChange={(value) => setFormData({ ...formData, weather: value })}
                options={weatherOptions}
                icon={<WeatherIcon weather={formData.weather as any} />}
              />
              {formData.temperature > 0 && (
                <div className="text-sm mt-1 text-gray-600">
                  {formData.temperature}°C - {formData.weatherDescription}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="workers">作業員情報</TabsTrigger>
          <TabsTrigger value="materials">資材情報</TabsTrigger>
          <TabsTrigger value="machines">他社機械</TabsTrigger>
        </TabsList>

        <TabsContent value="workers">
          <DataTable
            data={workers}
            columns={workerColumns}
            onAdd={addWorker}
            onDelete={removeWorker}
            getRowId={(item) => item.id}
            addButtonLabel="作業員を追加"
            isDeleteDisabled={(item) => workers.length <= 1}
          />
        </TabsContent>

        <TabsContent value="materials">
          <DataTable
            data={materials}
            columns={materialColumns}
            onAdd={addMaterial}
            onDelete={removeMaterial}
            getRowId={(item) => item.id}
            addButtonLabel="資材を追加"
            isDeleteDisabled={(item) => materials.length <= 1}
          />
        </TabsContent>

        <TabsContent value="machines">
          <DataTable
            data={otherMachines}
            columns={machineColumns}
            onAdd={addOtherMachine}
            onDelete={removeOtherMachine}
            getRowId={(item) => item.id}
            addButtonLabel="機械を追加"
            isDeleteDisabled={(item) => otherMachines.length <= 1}
          />
        </TabsContent>
      </Tabs>

      <ActionButtons onSave={saveReport} onExport={exportToExcel} onPhoto={takePhoto} isSubmitting={isSubmitting} />

      <PreviewContainer title="作業日報">
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
                <div className="flex flex-col items-center">
                  <WeatherIcon weather={formData.weather as any} size="md" />
                  <div className="text-sm mt-1">{formData.temperature > 0 && `${formData.temperature}°C`}</div>
                </div>
              </div>
            </div>
            <div className="col-span-1 p-2">
              <div className="font-bold">承認</div>
              <div></div>
            </div>
          </div>

          <PreviewTable headers={["No.", "氏名", "労働時間", "残業", "記事", "作業内容"]}>
            {workers.map((worker, index) => (
              <tr key={worker.id}>
                <td className="border-r border-b border-gray-300 p-2 text-center">{index + 1}</td>
                <td className="border-r border-b border-gray-300 p-2">{worker.name}</td>
                <td className="border-r border-b border-gray-300 p-2 text-center">{worker.workHours}h</td>
                <td className="border-r border-b border-gray-300 p-2 text-center">{worker.overtimeHours}h</td>
                <td className="border-r border-b border-gray-300 p-2">{worker.notes}</td>
                <td className="border-b border-gray-300 p-2">{worker.workContent}</td>
              </tr>
            ))}
            <tr>
              <td className="border-r border-gray-300 p-2 text-center" colSpan={2}>
                計
              </td>
              <td className="border-r border-gray-300 p-2 text-center">
                {workers.reduce((sum, worker) => sum + (Number.parseFloat(worker.workHours) || 0), 0)}h
              </td>
              <td className="border-r border-gray-300 p-2 text-center">
                {workers.reduce((sum, worker) => sum + (Number.parseFloat(worker.overtimeHours) || 0), 0)}h
              </td>
              <td className="border-r border-gray-300 p-2"></td>
              <td className="p-2"></td>
            </tr>
          </PreviewTable>

          <PreviewTable headers={["資材名", "規格", "単位", "搬入数", "自社機械名", "型式", "台数", "稼働"]}>
            {materials.map((material) => (
              <tr key={material.id}>
                <td className="border-r border-b border-gray-300 p-2">{material.name}</td>
                <td className="border-r border-b border-gray-300 p-2">{material.spec}</td>
                <td className="border-r border-b border-gray-300 p-2">{material.unit}</td>
                <td className="border-r border-b border-gray-300 p-2">{material.quantity}</td>
                <td className="border-r border-b border-gray-300 p-2">{material.machineType}</td>
                <td className="border-r border-b border-gray-300 p-2">{material.model}</td>
                <td className="border-r border-b border-gray-300 p-2">{material.units}</td>
                <td className="border-b border-gray-300 p-2">{material.status}</td>
              </tr>
            ))}
          </PreviewTable>

          <div>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-r border-b border-gray-300 p-2" colSpan={4}>
                    合計
                  </th>
                  <th className="border-r border-b border-gray-300 p-2">他社機械名</th>
                  <th className="border-r border-b border-gray-300 p-2">業者名</th>
                  <th className="border-r border-b border-gray-300 p-2">台数</th>
                  <th className="border-b border-gray-300 p-2">稼働</th>
                </tr>
              </thead>
              <tbody>
                {otherMachines.map((machine) => (
                  <tr key={machine.id}>
                    <td className="border-r border-gray-300 p-2" colSpan={4}></td>
                    <td className="border-r border-gray-300 p-2">{machine.name}</td>
                    <td className="border-r border-gray-300 p-2">{machine.operator}</td>
                    <td className="border-r border-gray-300 p-2">{machine.units}</td>
                    <td className="p-2">{machine.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PreviewSection>
      </PreviewContainer>
    </div>
  )
}
