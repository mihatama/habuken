"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, AlertCircle, Search, Cloud, CloudRain, Sun, CloudSun, Wind, Droplets } from "lucide-react"

interface WeatherData {
  main: {
    temp: number
    feels_like: number
    humidity: number
    pressure: number
  }
  weather: Array<{
    id: number
    main: string
    description: string
    icon: string
  }>
  wind: {
    speed: number
  }
  name: string
  sys: {
    country: string
  }
}

export function WeatherForecastPanel() {
  const [zipCode, setZipCode] = useState("")
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWeather = async () => {
    // 郵便番号の簡易バリデーション（日本の郵便番号：3桁-4桁 または 7桁の数字）
    const zipRegex = /^(\d{3}-\d{4}|\d{7})$/
    if (!zipRegex.test(zipCode)) {
      setError("有効な郵便番号を入力してください（例：123-4567または1234567）")
      return
    }

    // ハイフンを削除
    const formattedZip = zipCode.replace(/-/g, "")

    setLoading(true)
    setError(null)

    try {
      // サーバーサイドAPIルートを使用
      const response = await fetch(`/api/weather?zipCode=${formattedZip}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `天気情報の取得に失敗しました（${response.status}）`)
      }

      const data = await response.json()
      setWeatherData(data)
    } catch (err) {
      console.error("天気データの取得エラー:", err)
      setError(err instanceof Error ? err.message : "天気情報の取得中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  // 天気アイコンを取得する関数
  const getWeatherIcon = (iconCode: string) => {
    const iconId = iconCode.substring(0, 2)
    switch (iconId) {
      case "01": // 晴れ
        return <Sun className="h-12 w-12 text-yellow-500" />
      case "02": // 薄曇り
      case "03": // 曇り
      case "04": // 厚い曇り
        return <CloudSun className="h-12 w-12 text-gray-500" />
      case "09": // 小雨
      case "10": // 雨
        return <CloudRain className="h-12 w-12 text-blue-500" />
      case "11": // 雷雨
        return <Cloud className="h-12 w-12 text-gray-700" />
      case "13": // 雪
        return <Cloud className="h-12 w-12 text-blue-200" />
      case "50": // 霧
        return <Cloud className="h-12 w-12 text-gray-400" />
      default:
        return <Cloud className="h-12 w-12 text-gray-500" />
    }
  }

  return (
    <Card className="col-span-full md:col-span-2">
      <CardHeader>
        <CardTitle>天気予報</CardTitle>
        <CardDescription>郵便番号を入力して地域の天気を確認できます</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="郵便番号（例：123-4567）"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              className="pr-10"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fetchWeather()
                }
              }}
            />
          </div>
          <Button onClick={fetchWeather} disabled={loading} className="whitespace-nowrap">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            天気を検索
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-md flex items-start gap-3 text-red-800">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && weatherData && (
          <div className="mt-4">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-4 bg-muted/30 rounded-lg">
              <div className="flex flex-col items-center">
                {weatherData.weather[0]?.icon && getWeatherIcon(weatherData.weather[0].icon)}
                <h3 className="text-xl font-semibold mt-2">{weatherData.name}</h3>
                <p className="text-sm text-muted-foreground">{weatherData.sys.country}</p>
              </div>

              <div className="flex-grow">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <div>
                    <p className="text-4xl font-bold">{Math.round(weatherData.main.temp)}°C</p>
                    <p className="text-muted-foreground capitalize">{weatherData.weather[0]?.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 md:mt-0">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">湿度: {weatherData.main.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-blue-300" />
                      <span className="text-sm">風速: {weatherData.wind.speed}m/s</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">体感温度: {Math.round(weatherData.main.feels_like)}°C</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cloud className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">気圧: {weatherData.main.pressure}hPa</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && !weatherData && !error && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Cloud className="h-12 w-12 mb-4 opacity-50" />
            <p>
              郵便番号を入力して検索ボタンをクリックすると、
              <br />
              その地域の最新の天気情報が表示されます。
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
