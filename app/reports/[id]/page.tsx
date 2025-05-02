"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { ArrowLeft, Trash2, Sun, Cloud, CloudRain, Snowflake, Wind } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function DailyReportPage({ params }: { params: { id: string } }) {
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchReport() {
      try {
        setLoading(true)
        console.log("日報データを取得中...", params.id)
        const { data, error } = await supabase.from("daily_reports").select("*").eq("id", params.id).single()

        if (error) {
          throw error
        }

        console.log("取得した日報データ:", data)
        console.log("報告者名:", data.full_name)
        setReport(data)
      } catch (error: any) {
        console.error("日報データの取得エラー:", error)
        setError(error.message || "日報データの取得に失敗しました")
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [params.id, supabase])

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from("daily_reports").delete().eq("id", params.id)

      if (error) {
        throw error
      }

      router.push("/reports")
    } catch (error: any) {
      console.error("日報の削除エラー:", error)
      setError(error.message || "日報の削除に失敗しました")
    }
  }

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
        return <Wind className="h-5 w-5 text-gray-400" />
      default:
        return <Sun className="h-5 w-5 text-yellow-500" />
    }
  }

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
        return "晴れ"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>読み込み中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => router.push("/reports")}>日報一覧に戻る</Button>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="mb-4">日報が見つかりませんでした</p>
        <Button onClick={() => router.push("/reports")}>日報一覧に戻る</Button>
      </div>
    )
  }

  // 報告者名を取得する関数
  const getReporterName = () => {
    // full_nameフィールドが存在し、空でない場合はその値を使用
    if (report.full_name && report.full_name.trim() !== "" && report.full_name !== "登録者名不明") {
      console.log("full_nameを使用:", report.full_name)
      return report.full_name
    }

    console.log("報告者名が見つかりません")
    return "不明な報告者"
  }

  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <Button variant="ghost" className="mb-4" onClick={() => router.push("/reports")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> 一覧に戻る
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{report.custom_project_name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="text-sm text-muted-foreground">日付</div>
            <div>{formatDate(report.report_date)}</div>
          </div>

          <div className="flex items-center">
            <div className="border-t border-gray-200 flex-grow my-2"></div>
            <div className="mx-4">{getWeatherIcon(report.weather)}</div>
            <div className="border-t border-gray-200 flex-grow my-2"></div>
          </div>

          <div className="flex flex-col space-y-2">
            <div className="text-sm text-muted-foreground">天候</div>
            <div className="flex items-center">
              {getWeatherIcon(report.weather)}
              <span className="ml-2">{getWeatherText(report.weather)}</span>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <div className="text-sm text-muted-foreground">作業時間</div>
            <div>
              {report.start_time?.substring(0, 5)} 〜 {report.end_time?.substring(0, 5)}
            </div>
          </div>

          <div className="border-t border-gray-200 my-4"></div>

          <div className="flex flex-col space-y-2">
            <div className="text-sm text-muted-foreground">報告者</div>
            <div>{getReporterName()}</div>
          </div>

          <div className="flex flex-col space-y-2">
            <div className="text-sm text-muted-foreground">作業内容</div>
            <div className="whitespace-pre-wrap">{report.work_description}</div>
          </div>

          {report.photo_urls && report.photo_urls.length > 0 && (
            <div className="flex flex-col space-y-2">
              <div className="text-sm text-muted-foreground">写真</div>
              <div className="grid grid-cols-2 gap-2">
                {report.photo_urls.map((url: string, index: number) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`作業写真 ${index + 1}`}
                      className="object-cover w-full h-full rounded-md"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/reports")}>
            戻る
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> 削除
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>日報の削除</AlertDialogTitle>
            <AlertDialogDescription>
              この日報を削除してもよろしいですか？この操作は元に戻せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>削除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
