"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Sun, Cloud, CloudRain, Snowflake, Wind } from "lucide-react"
import Image from "next/image"

interface DailyReportDetailProps {
  report: any
}

export function DailyReportDetail({ report }: DailyReportDetailProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

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

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{report.custom_project_name || "案件名なし"}</CardTitle>
            <CardDescription>
              {formatDate(report.report_date)} ({report.start_time} 〜 {report.end_time})
            </CardDescription>
          </div>
          <Badge className="flex items-center gap-1" variant="outline">
            {getWeatherIcon(report.weather)}
            <span>{getWeatherText(report.weather)}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 報告者情報を追加 */}
        <div>
          <h3 className="text-sm font-medium mb-2">報告者</h3>
          <div className="text-sm">{report.full_name || "不明な報告者"}</div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">作業内容</h3>
          <div className="whitespace-pre-wrap text-sm bg-muted p-3 rounded-md">
            {report.work_description || "作業内容の記録なし"}
          </div>
        </div>

        {/* 作業者情報 */}
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">作業者情報</h3>
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
    </Card>
  )
}
