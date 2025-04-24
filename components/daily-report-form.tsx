"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Mic,
  MicOff,
  Plus,
  Trash2,
  Save,
  Download,
  Camera,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Cloudy,
} from "lucide-react"
import { sampleProjects, sampleStaff } from "@/data/sample-data"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { getWeatherData } from "@/lib/weather-api"

export function DailyReportForm() {
  const [isRecording, setIsRecording] = useState(false)
  const [workers, setWorkers] = useState([
    { id: 1, name: "", workHours: "", overtimeHours: "", notes: "", workContent: "" },
  ])
  const [materials, setMaterials] = useState([
    { id: 1, name: "", spec: "", unit: "", quantity: "", machineType: "", model: "", units: "", status: "" },
  ])
  const [otherMachines, setOtherMachines] = useState([{ id: 1, name: "", operator: "", units: "", status: "" }])
  const [formData, setFormData] = useState({
    projectId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    weather: "sunny",
    temperature: 0,
    weatherDescription: "",
    weatherIcon: "",
  })

  // Web Speech API用の参照
  const recognitionRef = useRef<any>(null)

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
  const startSpeechRecognition = (workerId: number) => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("お使いのブラウザは音声認識をサポートしていません。")
      return
    }

    const SpeechRecognition = window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.lang = "ja-JP"
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = ""
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      if (finalTranscript) {
        const updatedWorkers = workers.map((worker) => {
          if (worker.id === workerId) {
            return {
              ...worker,
              workContent: worker.workContent + finalTranscript,
            }
          }
          return worker
        })
        setWorkers(updatedWorkers)
      }
    }

    recognitionRef.current.onerror = (event: any) => {
      console.error("音声認識エラー:", event.error)
      setIsRecording(false)
    }

    recognitionRef.current.onend = () => {
      if (isRecording) {
        recognitionRef.current.start()
      }
    }

    recognitionRef.current.start()
    setIsRecording(true)
  }

  // 音声認識の停止
  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
    }
  }

  // 作業員情報の更新
  const updateWorker = (id: number, field: string, value: string) => {
    const updatedWorkers = workers.map((worker) => {
      if (worker.id === id) {
        return { ...worker, [field]: value }
      }
      return worker
    })
    setWorkers(updatedWorkers)
  }

  // 資材情報の更新
  const updateMaterial = (id: number, field: string, value: string) => {
    const updatedMaterials = materials.map((material) => {
      if (material.id === id) {
        return { ...material, [field]: value }
      }
      return material
    })
    setMaterials(updatedMaterials)
  }

  // 他社機械情報の更新
  const updateOtherMachine = (id: number, field: string, value: string) => {
    const updatedOtherMachines = otherMachines.map((machine) => {
      if (machine.id === id) {
        return { ...machine, [field]: value }
      }
      return machine
    })
    setOtherMachines(updatedOtherMachines)
  }

  // 日報を保存
  const saveReport = () => {
    const reportData = {
      ...formData,
      workers,
      materials,
      otherMachines,
      createdAt: new Date(),
    }
    console.log("保存された日報:", reportData)
    // ここで実際のAPIに保存処理を実装
    alert("日報が保存されました")
  }

  // Excelとして出力
  const exportToExcel = () => {
    console.log("Excel出力:", {
      ...formData,
      workers,
      materials,
      otherMachines,
    })
    // ここで実際のExcel出力処理を実装
    alert("Excelファイルがダウンロードされます")
  }

  // 写真を撮影
  const takePhoto = () => {
    // カメラ機能の実装
    alert("カメラ機能は実装中です")
  }

  // 天気アイコンを取得
  const getWeatherIcon = () => {
    switch (formData.weather) {
      case "sunny":
        return <Sun className="h-5 w-5 text-yellow-500" />
      case "cloudy":
        return <Cloud className="h-5 w-5 text-gray-500" />
      case "rainy":
        return <CloudRain className="h-5 w-5 text-blue-500" />
      case "snowy":
        return <CloudSnow className="h-5 w-5 text-blue-200" />
      case "foggy":
        return <Cloudy className="h-5 w-5 text-gray-400" />
      default:
        return <Sun className="h-5 w-5 text-yellow-500" />
    }
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

  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold text-center mb-6">作業日報</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <Label htmlFor="projectId">工事名</Label>
          <Select value={formData.projectId} onValueChange={(value) => setFormData({ ...formData, projectId: value })}>
            <SelectTrigger id="projectId">
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">日付</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
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
                <SelectItem value="snowy">雪</SelectItem>
                <SelectItem value="foggy">霧</SelectItem>
              </SelectContent>
            </Select>
            {formData.temperature > 0 && (
              <div className="text-sm mt-1 text-gray-600">
                {formData.temperature}°C - {formData.weatherDescription}
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="workers">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="workers">作業員情報</TabsTrigger>
          <TabsTrigger value="materials">資材情報</TabsTrigger>
          <TabsTrigger value="machines">他社機械</TabsTrigger>
        </TabsList>

        <TabsContent value="workers">
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">作業員情報</h3>
              <Button onClick={addWorker} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                作業員を追加
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">No.</TableHead>
                    <TableHead>氏名</TableHead>
                    <TableHead className="w-24">労働時間</TableHead>
                    <TableHead className="w-24">残業</TableHead>
                    <TableHead>記事</TableHead>
                    <TableHead>作業内容</TableHead>
                    <TableHead className="w-20">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workers.map((worker, index) => (
                    <TableRow key={worker.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Select value={worker.name} onValueChange={(value) => updateWorker(worker.id, "name", value)}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {sampleStaff.map((staff) => (
                              <SelectItem key={staff.id} value={staff.name}>
                                {staff.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={worker.workHours}
                          onChange={(e) => updateWorker(worker.id, "workHours", e.target.value)}
                          className="h-8"
                          placeholder="時間"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={worker.overtimeHours}
                          onChange={(e) => updateWorker(worker.id, "overtimeHours", e.target.value)}
                          className="h-8"
                          placeholder="時間"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={worker.notes}
                          onChange={(e) => updateWorker(worker.id, "notes", e.target.value)}
                          className="h-8"
                          placeholder="記事"
                        />
                      </TableCell>
                      <TableCell className="relative">
                        <div className="flex">
                          <Textarea
                            value={worker.workContent}
                            onChange={(e) => updateWorker(worker.id, "workContent", e.target.value)}
                            className="min-h-[60px] text-sm"
                            placeholder="作業内容"
                          />
                          <div className="flex flex-col ml-1">
                            {isRecording && worker.id === workers.find((w) => w.id === worker.id)?.id ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={stopSpeechRecognition}
                                className="h-8 w-8 text-red-500"
                              >
                                <MicOff className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => startSpeechRecognition(worker.id)}
                                className="h-8 w-8"
                              >
                                <Mic className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeWorker(worker.id)}
                          disabled={workers.length <= 1}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="materials">
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">資材情報</h3>
              <Button onClick={addMaterial} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                資材を追加
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>資材名</TableHead>
                    <TableHead>規格</TableHead>
                    <TableHead>単位</TableHead>
                    <TableHead>搬入数</TableHead>
                    <TableHead>自社機械名</TableHead>
                    <TableHead>型式</TableHead>
                    <TableHead>台数</TableHead>
                    <TableHead>稼働</TableHead>
                    <TableHead className="w-20">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell>
                        <Input
                          value={material.name}
                          onChange={(e) => updateMaterial(material.id, "name", e.target.value)}
                          className="h-8"
                          placeholder="資材名"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={material.spec}
                          onChange={(e) => updateMaterial(material.id, "spec", e.target.value)}
                          className="h-8"
                          placeholder="規格"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={material.unit}
                          onChange={(e) => updateMaterial(material.id, "unit", e.target.value)}
                          className="h-8"
                          placeholder="単位"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={material.quantity}
                          onChange={(e) => updateMaterial(material.id, "quantity", e.target.value)}
                          className="h-8"
                          placeholder="数量"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={material.machineType}
                          onChange={(e) => updateMaterial(material.id, "machineType", e.target.value)}
                          className="h-8"
                          placeholder="機械名"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={material.model}
                          onChange={(e) => updateMaterial(material.id, "model", e.target.value)}
                          className="h-8"
                          placeholder="型式"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={material.units}
                          onChange={(e) => updateMaterial(material.id, "units", e.target.value)}
                          className="h-8"
                          placeholder="台数"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={material.status}
                          onChange={(e) => updateMaterial(material.id, "status", e.target.value)}
                          className="h-8"
                          placeholder="稼働"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMaterial(material.id)}
                          disabled={materials.length <= 1}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="machines">
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">他社機械</h3>
              <Button onClick={addOtherMachine} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                機械を追加
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>他社機械名</TableHead>
                    <TableHead>業者名</TableHead>
                    <TableHead>台数</TableHead>
                    <TableHead>稼働</TableHead>
                    <TableHead className="w-20">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otherMachines.map((machine) => (
                    <TableRow key={machine.id}>
                      <TableCell>
                        <Input
                          value={machine.name}
                          onChange={(e) => updateOtherMachine(machine.id, "name", e.target.value)}
                          className="h-8"
                          placeholder="機械名"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={machine.operator}
                          onChange={(e) => updateOtherMachine(machine.id, "operator", e.target.value)}
                          className="h-8"
                          placeholder="業者名"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={machine.units}
                          onChange={(e) => updateOtherMachine(machine.id, "units", e.target.value)}
                          className="h-8"
                          placeholder="台数"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={machine.status}
                          onChange={(e) => updateOtherMachine(machine.id, "status", e.target.value)}
                          className="h-8"
                          placeholder="稼働"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOtherMachine(machine.id)}
                          disabled={otherMachines.length <= 1}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between mt-6">
        <div className="flex space-x-2">
          <Button variant="outline" onClick={takePhoto}>
            <Camera className="h-4 w-4 mr-2" />
            写真撮影
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="h-4 w-4 mr-2" />
            Excel出力
          </Button>
          <Button onClick={saveReport}>
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
        </div>
      </div>

      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-medium mb-4">プレビュー</h3>
        <div className="border rounded-md p-4 bg-white">
          <div className="text-center text-2xl font-bold mb-4">作業日報</div>

          <div className="border border-gray-300">
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="col-span-3 border-r border-gray-300 p-2">
                <div className="font-bold">工事名</div>
                <div>
                  {formData.projectId
                    ? sampleProjects.find((p) => p.id.toString() === formData.projectId)?.name
                    : "未選択"}
                </div>
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
                  <div className="flex flex-col items-center">
                    {getWeatherIcon()}
                    <div className="text-sm mt-1">{formData.temperature > 0 && `${formData.temperature}°C`}</div>
                  </div>
                </div>
              </div>
              <div className="col-span-1 p-2">
                <div className="font-bold">承認</div>
                <div></div>
              </div>
            </div>

            <div className="border-b border-gray-300">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border-r border-b border-gray-300 p-2 w-10">No.</th>
                    <th className="border-r border-b border-gray-300 p-2">氏名</th>
                    <th className="border-r border-b border-gray-300 p-2 w-24 text-center" colSpan={2}>
                      <div>労働時間</div>
                      <div className="grid grid-cols-2">
                        <div className="border-r border-gray-300 p-1">時間</div>
                        <div className="p-1">残業</div>
                      </div>
                    </th>
                    <th className="border-r border-b border-gray-300 p-2">記事</th>
                    <th className="border-b border-gray-300 p-2">作業内容</th>
                  </tr>
                </thead>
                <tbody>
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
                </tbody>
              </table>
            </div>

            <div className="border-b border-gray-300">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border-r border-b border-gray-300 p-2">資材名</th>
                    <th className="border-r border-b border-gray-300 p-2">規格</th>
                    <th className="border-r border-b border-gray-300 p-2">単位</th>
                    <th className="border-r border-b border-gray-300 p-2">搬入数</th>
                    <th className="border-r border-b border-gray-300 p-2">自社機械名</th>
                    <th className="border-r border-b border-gray-300 p-2">型式</th>
                    <th className="border-r border-b border-gray-300 p-2">台数</th>
                    <th className="border-b border-gray-300 p-2">稼働</th>
                  </tr>
                </thead>
                <tbody>
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
                </tbody>
              </table>
            </div>

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
          </div>
        </div>
      </div>
    </div>
  )
}
