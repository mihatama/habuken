"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Sun, Cloud, CloudRain, Snowflake, Wind, Pencil } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface DailyReportDetailProps {
  report: any
}

export function DailyReportDetail({ report }: DailyReportDetailProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedReport, setEditedReport] = useState({ ...report })

  // 天候アイコンを取得
  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case "sunny":
        return <Sun className="h-5 w-5 text-yellow-500" />
      case "cloudy":
        return <Cloud className="h-5 w-5 text-gray-500" />
      case "rainy":
        return <CloudRain className="h-5 w-5 text-blue-500" />
      case "snowy":
        return <Snowflake className="h-5 w-5 text-blue-300" />
      case "windy":
        return <Wind className="h-5 w-5 text-teal-500" />
      default:
        return <Sun className="h-5 w-5 text-yellow-500" />
    }
  }

  // 天候の日本語表示を取得
  const getWeatherText = (weather: string) => {
    switch (weather) {
      case "sunny":
        return "晴れ"
      case "cloudy":
        return "曇り"
      case "rainy":
        return "雨"
      case "snowy":
        return "雪"
      case "windy":
        return "強風"
      default:
        return "不明"
    }
  }

  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    })
  }

  // 写真URLの配列を取得
  const photoUrls = report.photo_urls || []

  // 編集モードの切り替え
  const toggleEditMode = () => {
    setIsEditing(!isEditing)
  }

  // 編集内容の保存
  const saveChanges = () => {
    // ここで保存処理を実装（APIリクエストなど）
    console.log("保存する内容:", editedReport)
    setIsEditing(false)
    // 保存成功後の処理
  }

  // 編集内容の更新
  const handleChange = (field: string, value: any) => {
    setEditedReport((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // 作業者情報の更新
  const updateWorker = (index: number, field: string, value: string) => {
    const updatedWorkers = [...editedReport.workers]
    updatedWorkers[index] = {
      ...updatedWorkers[index],
      [field]: value,
    }
    setEditedReport((prev) => ({
      ...prev,
      workers: updatedWorkers,
    }))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            {isEditing ? (
              <Input
                value={editedReport.custom_project_name || ""}
                onChange={(e) => handleChange("custom_project_name", e.target.value)}
                className="font-bold text-lg"
              />
            ) : (
              <CardTitle>{report.custom_project_name || "案件名なし"}</CardTitle>
            )}
            <CardDescription>
              {isEditing ? (
                <Input
                  type="date"
                  value={editedReport.report_date}
                  onChange={(e) => handleChange("report_date", e.target.value)}
                  className="mt-2"
                />
              ) : (
                formatDate(report.report_date)
              )}
              {isEditing ? (
                <div className="flex gap-2 mt-2">
                  <Input
                    type="time"
                    value={editedReport.start_time}
                    onChange={(e) => handleChange("start_time", e.target.value)}
                  />
                  <span className="flex items-center">〜</span>
                  <Input
                    type="time"
                    value={editedReport.end_time}
                    onChange={(e) => handleChange("end_time", e.target.value)}
                  />
                </div>
              ) : (
                ` (${report.start_time} 〜 ${report.end_time})`
              )}
            </CardDescription>
          </div>
          {isEditing ? (
            <Select value={editedReport.weather} onValueChange={(value) => handleChange("weather", value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="天候" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sunny">晴れ</SelectItem>
                <SelectItem value="cloudy">曇り</SelectItem>
                <SelectItem value="rainy">雨</SelectItem>
                <SelectItem value="snowy">雪</SelectItem>
                <SelectItem value="windy">強風</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge className="flex items-center gap-1" variant="outline">
              {getWeatherIcon(report.weather)}
              <span>{getWeatherText(report.weather)}</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">作業内容</h3>
          {isEditing ? (
            <Textarea
              value={editedReport.work_description || ""}
              onChange={(e) => handleChange("work_description", e.target.value)}
              className="min-h-[100px]"
            />
          ) : (
            <div className="whitespace-pre-wrap text-sm bg-muted p-3 rounded-md">
              {report.work_description || "作業内容の記録なし"}
            </div>
          )}
        </div>

        {/* 作業者情報 */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">作業者情報</h3>
          {isEditing ? (
            <div className="space-y-2">
              {editedReport.workers &&
                Array.isArray(editedReport.workers) &&
                editedReport.workers.map((worker: any, index: number) => (
                  <div key={index} className="border rounded-md p-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-sm font-medium">名前:</Label>
                        <Input value={worker.name} onChange={(e) => updateWorker(index, "name", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">開始時間:</Label>
                        <Input
                          type="time"
                          value={worker.start_time}
                          onChange={(e) => updateWorker(index, "start_time", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">終了時間:</Label>
                        <Input
                          type="time"
                          value={worker.end_time}
                          onChange={(e) => updateWorker(index, "end_time", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <>
              {report.workers && Array.isArray(report.workers) && report.workers.length > 0 ? (
                <div className="space-y-2">
                  {report.workers.map((worker: any, index: number) => (
                    <div key={index} className="border rounded-md p-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <span className="text-sm font-medium">名前:</span>
                          <p>{worker.name}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">開始時間:</span>
                          <p>{worker.start_time}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">終了時間:</span>
                          <p>{worker.end_time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">作業者情報はありません</p>
              )}
            </>
          )}
        </div>

        {photoUrls.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">添付写真 ({photoUrls.length}枚)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {photoUrls.map((url: string, index: number) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-md overflow-hidden border cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedImage(url)}
                >
                  <Image
                    src={url || "/placeholder.svg"}
                    alt={`写真 ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-3xl p-0 overflow-hidden">
            {selectedImage && (
              <div className="relative w-full h-[80vh]">
                <Image
                  src={selectedImage || "/placeholder.svg"}
                  alt="拡大写真"
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={toggleEditMode}>
              キャンセル
            </Button>
            <Button onClick={saveChanges}>保存</Button>
          </>
        ) : (
          <Button variant="outline" onClick={toggleEditMode} className="flex items-center gap-1">
            <Pencil className="h-4 w-4" /> 編集
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
