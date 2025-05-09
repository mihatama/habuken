"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind } from "lucide-react"
import { OPENWEATHER_API_KEY, DEFAULT_LOCATION } from "@/lib/constants"

interface WeatherData {
  name: string
  main: {
    temp: number
    feels_like: number
    humidity: number
    pressure: number
  }
  weather: {
    id: number
    main: string
    description: string
    icon: string
  }[]
  wind: {
    speed: number
  }
  sys: {
    country: string
  }
}

export function WeatherForecast() {
  const [zipCode, setZipCode] = useState("")
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // コンポーネントがマウントされたときにデフォルトの場所の天気を取得
  useState(() => {
    fetchWeatherByLocation(DEFAULT_LOCATION)
  })

  const fetchWeatherByZipCode = async () => {
    if (!zipCode.trim()) {
      setError("郵便番号を入力してください")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?zip=${zipCode},jp&units=metric&lang=ja&appid=${OPENWEATHER_API_KEY}`,
      )

      if (!response.ok) {
        throw new Error("天気データの取得に失敗しました")
      }

      const data = await response.json()
      setWeatherData(data)
    } catch (err) {
      console.error("天気データの取得エラー:", err)
      setError("天気データの取得に失敗しました。郵便番号を確認してください。")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchWeatherByLocation = async (location: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&lang=ja&appid=${OPENWEATHER_API_KEY}`,
      )

      if (!response.ok) {
        throw new Error("天気データの取得に失敗しました")
      }

      const data = await response.json()
      setWeatherData(data)
    } catch (err) {
      console.error("天気データの取得エラー:", err)
      setError("天気データの取得に失敗しました。")
    } finally {
      setIsLoading(false)
    }
  }

  const getWeatherIcon = (weatherId: number) => {
    // 天気IDに基づいて適切なアイコンを返す
    // https://openweathermap.org/weather-conditions
    if (weatherId >= 200 && weatherId < 300) {
      return <CloudLightning className="h-12 w-12 text-yellow-400" />
    } else if (weatherId >= 300 && weatherId < 600) {
      return <CloudRain className="h-12 w-12 text-blue-400" />
    } else if (weatherId >= 600 && weatherId < 700) {
      return <CloudSnow className="h-12 w-12 text-blue-200" />
    } else if (weatherId >= 700 && weatherId < 800) {
      return <Wind className="h-12 w-12 text-gray-400" />
    } else if (weatherId === 800) {
      return <Sun className="h-12 w-12 text-yellow-500" />
    } else {
      return <Cloud className="h-12 w-12 text-gray-400" />
    }
  }

  return (
    <Card className="col-span-full md:col-span-2">
      <CardHeader>
        <CardTitle>天気予報</CardTitle>
        <CardDescription>現場の天気情報を確認できます</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="郵便番号を入力（例: 100-0001）"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className="flex-1"
          />
          <Button onClick={fetchWeatherByZipCode} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            天気を取得
          </Button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : weatherData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center mb-2">{getWeatherIcon(weatherData.weather[0].id)}</div>
              <h3 className="text-xl font-medium">{weatherData.name}</h3>
              <p className="text-3xl font-bold">{Math.round(weatherData.main.temp)}°C</p>
              <p className="text-muted-foreground capitalize">{weatherData.weather[0].description}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">体感温度</p>
                <p className="text-lg font-medium">{Math.round(weatherData.main.feels_like)}°C</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">湿度</p>
                <p className="text-lg font-medium">{weatherData.main.humidity}%</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">風速</p>
                <p className="text-lg font-medium">{weatherData.wind.speed} m/s</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">気圧</p>
                <p className="text-lg font-medium">{weatherData.main.pressure} hPa</p>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
