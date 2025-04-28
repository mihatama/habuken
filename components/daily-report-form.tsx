"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface DailyReport {
  id?: string
  date: string
  weather: string
  temperature: number
  weatherDescription: string
  weatherIcon: string
  activity: string
  feeling: string
  learned: string
  tomorrow: string
}

interface WeatherOption {
  value: string
  label: string
  icon: string
}

const weatherOptions: WeatherOption[] = [
  { value: "sunny", label: "晴れ", icon: "sunny" },
  { value: "cloudy", label: "曇り", icon: "cloudy" },
  { value: "rainy", label: "雨", icon: "rainy" },
  { value: "thunderstorm", label: "雷雨", icon: "thunderstorm" },
  { value: "snowy", label: "雪", icon: "snowy" },
]

const WeatherIcon = ({ weather, size = "sm" }: { weather: string; size?: "sm" | "md" | "lg" }) => {
  let iconSize = "w-6 h-6"
  if (size === "md") iconSize = "w-12 h-12"
  if (size === "lg") iconSize = "w-24 h-24"

  switch (weather) {
    case "sunny":
      return <img src="/icons/sunny.svg" alt="晴れ" className={iconSize} />
    case "cloudy":
      return <img src="/icons/cloudy.svg" alt="曇り" className={iconSize} />
    case "rainy":
      return <img src="/icons/rainy.svg" alt="雨" className={iconSize} />
    case "thunderstorm":
      return <img src="/icons/thunderstorm.svg" alt="雷雨" className={iconSize} />
    case "snowy":
      return <img src="/icons/snowy.svg" alt="雪" className={iconSize} />
    default:
      return <img src="/icons/sunny.svg" alt="晴れ" className={iconSize} />
  }
}

const DailyReportForm = () => {
  const { toast } = useToast()
  const [formData, setFormData] = useState<DailyReport>({
    date: new Date().toISOString().slice(0, 10),
    weather: "sunny",
    temperature: 20,
    weatherDescription: "晴れ",
    weatherIcon: "sunny",
    activity: "",
    feeling: "",
    learned: "",
    tomorrow: "",
  })

  const [reports, setReports] = useState<DailyReport[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // 天気APIの呼び出しを削除し、デフォルト値を設定
    setFormData((prev) => ({
      ...prev,
      weather: "sunny", // デフォルト値を設定
      temperature: 20, // デフォルト値を設定
      weatherDescription: "晴れ",
      weatherIcon: "sunny",
    }))
  }, [])

  useEffect(() => {
    fetchReports()
  }, [])

  async function fetchReports() {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.from("daily_reports").select("*").order("date", { ascending: false })

      if (error) {
        throw error
      }

      setReports(data || [])
    } catch (error) {
      console.error("レポートの取得に失敗しました:", error)
      toast({
        title: "エラー",
        description: "レポートの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function createReport() {
    if (
      !formData.date ||
      !formData.weather ||
      !formData.activity ||
      !formData.feeling ||
      !formData.learned ||
      !formData.tomorrow
    ) {
      toast({
        title: "入力エラー",
        description: "すべての必須フィールドを入力してください",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const { data, error } = await supabase.from("daily_reports").insert([formData]).select()

      if (error) {
        throw error
      }

      toast({
        title: "成功",
        description: "レポートが正常に作成されました",
      })

      setFormData({
        date: new Date().toISOString().slice(0, 10),
        weather: "sunny",
        temperature: 20,
        weatherDescription: "晴れ",
        weatherIcon: "sunny",
        activity: "",
        feeling: "",
        learned: "",
        tomorrow: "",
      })

      fetchReports()
    } catch (error) {
      console.error("レポートの作成に失敗しました:", error)
      toast({
        title: "エラー",
        description: "レポートの作成に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Daily Report</h2>
      <Card>
        <CardHeader>
          <CardTitle>新規レポート作成</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">日付</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="weather">天候</Label>
                <Select
                  value={formData.weather}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      weather: value,
                      weatherDescription: weatherOptions.find((opt) => opt.value === value)?.label || "",
                      weatherIcon: value,
                    })
                  }
                >
                  <SelectTrigger id="weather">
                    <SelectValue placeholder="天候を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {weatherOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <WeatherIcon weather={option.value} />
                          <span className="ml-2">{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature">気温 (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  value={formData.temperature.toString()}
                  onChange={(e) => setFormData({ ...formData, temperature: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity">今日の活動</Label>
            <Textarea
              id="activity"
              value={formData.activity}
              onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
              placeholder="今日行った活動について記入してください"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="feeling">今日の気分</Label>
            <Textarea
              id="feeling"
              value={formData.feeling}
              onChange={(e) => setFormData({ ...formData, feeling: e.target.value })}
              placeholder="今日の気分について記入してください"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="learned">今日学んだこと</Label>
            <Textarea
              id="learned"
              value={formData.learned}
              onChange={(e) => setFormData({ ...formData, learned: e.target.value })}
              placeholder="今日学んだことについて記入してください"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tomorrow">明日の予定</Label>
            <Textarea
              id="tomorrow"
              value={formData.tomorrow}
              onChange={(e) => setFormData({ ...formData, tomorrow: e.target.value })}
              placeholder="明日の予定について記入してください"
            />
          </div>
          <Button onClick={createReport} disabled={isLoading} className="w-full">
            {isLoading ? "送信中..." : "レポート作成"}
          </Button>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">過去のレポート</h2>
        {isLoading ? (
          <div className="text-center py-4">読み込み中...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-4">レポートがありません</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <Card key={report.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{report.date}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center space-x-2 pb-2 border-b">
                    <WeatherIcon weather={report.weather} size="md" />
                    <div>
                      <div className="font-medium">{report.weatherDescription}</div>
                      <div className="text-sm text-muted-foreground">{report.temperature}°C</div>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">活動:</p>
                    <p className="text-sm">{report.activity}</p>
                  </div>
                  <div>
                    <p className="font-medium">気分:</p>
                    <p className="text-sm">{report.feeling}</p>
                  </div>
                  <div>
                    <p className="font-medium">学んだこと:</p>
                    <p className="text-sm">{report.learned}</p>
                  </div>
                  <div>
                    <p className="font-medium">明日の予定:</p>
                    <p className="text-sm">{report.tomorrow}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DailyReportForm
