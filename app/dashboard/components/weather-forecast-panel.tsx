"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Loader2,
  AlertCircle,
  Cloud,
  CloudRain,
  Sun,
  CloudSun,
  Wind,
  Droplets,
  Locate,
  RefreshCw,
  Calendar,
  Clock,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDateJP, formatTimeJP, toJST } from "@/utils/date-format"

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
  coord?: {
    lat: number
    lon: number
  }
}

interface ForecastItem {
  dt: number
  dt_txt: string
  main: {
    temp: number
    feels_like: number
    humidity: number
    pressure: number
    temp_min: number
    temp_max: number
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
  clouds: {
    all: number
  }
  pop: number // 降水確率
}

interface ForecastData {
  list: ForecastItem[]
  city: {
    name: string
    country: string
    coord: {
      lat: number
      lon: number
    }
  }
}

interface DailyForecast {
  date: Date
  dateText: string
  items: ForecastItem[]
  maxTemp: number
  minTemp: number
  icon: string
  description: string
  pop: number // 最大降水確率
}

// 羽布建設の位置情報
const HABUKEN_LOCATION = {
  lat: 35.04017,
  lon: 137.381643,
  name: "羽布建設",
}

export function WeatherForecastPanel() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [forecastData, setForecastData] = useState<ForecastData | null>(null)
  const [dailyForecasts, setDailyForecasts] = useState<DailyForecast[]>([])
  const [loading, setLoading] = useState(false)
  const [forecastLoading, setForecastLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"current" | "forecast">("current")

  // 初回レンダリング時に羽布建設の位置の天気を取得
  useEffect(() => {
    fetchWeatherByCoordinates(HABUKEN_LOCATION.lat, HABUKEN_LOCATION.lon)
  }, [])

  // 天気データが変更されたら予報データも取得
  useEffect(() => {
    if (weatherData?.coord) {
      fetchForecastByCoordinates(weatherData.coord.lat, weatherData.coord.lon)
    }
  }, [weatherData])

  // 予報データを日ごとにグループ化
  useEffect(() => {
    if (forecastData) {
      const dailyData = processForecastData(forecastData.list)
      setDailyForecasts(dailyData)
    }
  }, [forecastData])

  // 予報データを日ごとにグループ化する関数
  const processForecastData = (forecastList: ForecastItem[]): DailyForecast[] => {
    const dailyMap = new Map<string, ForecastItem[]>()

    // 日付ごとにデータをグループ化
    forecastList.forEach((item) => {
      const date = toJST(item.dt_txt)
      const dateKey = date.toISOString().split("T")[0]

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, [])
      }

      dailyMap.get(dateKey)?.push(item)
    })

    // 日ごとのデータを整形
    const dailyForecasts: DailyForecast[] = []

    dailyMap.forEach((items, dateKey) => {
      const date = new Date(dateKey)
      const dateText = formatDateJP(date)

      // 最高気温と最低気温を計算
      const maxTemp = Math.max(...items.map((item) => item.main.temp_max))
      const minTemp = Math.min(...items.map((item) => item.main.temp_min))

      // 正午に最も近い時間のアイコンと説明を使用
      const noonIndex = items.reduce((closest, item, index) => {
        const itemDate = toJST(item.dt_txt)
        const hourDiff = Math.abs(12 - itemDate.getHours())
        const closestDate = toJST(items[closest].dt_txt)
        const closestHourDiff = Math.abs(12 - closestDate.getHours())

        return hourDiff < closestHourDiff ? index : closest
      }, 0)

      const icon = items[noonIndex].weather[0].icon
      const description = items[noonIndex].weather[0].description

      // 最大降水確率
      const pop = Math.max(...items.map((item) => item.pop))

      dailyForecasts.push({
        date,
        dateText,
        items,
        maxTemp,
        minTemp,
        icon,
        description,
        pop,
      })
    })

    // 日付順にソート
    return dailyForecasts.sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  const fetchWeatherByCoordinates = async (lat: number, lon: number) => {
    setLoading(true)
    setError(null)

    try {
      // サーバーサイドAPIルートを使用
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`)

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

  const fetchForecastByCoordinates = async (lat: number, lon: number) => {
    setForecastLoading(true)

    try {
      // サーバーサイドAPIルートを使用
      const response = await fetch(`/api/weather/forecast?lat=${lat}&lon=${lon}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `天気予報の取得に失敗しました（${response.status}）`)
      }

      const data = await response.json()
      setForecastData(data)
    } catch (err) {
      console.error("天気予報データの取得エラー:", err)
      // 予報データのエラーは表示しない（現在の天気は表示できるため）
    } finally {
      setForecastLoading(false)
    }
  }

  const fetchWeatherByLocation = async () => {
    setGeoLoading(true)
    setGeoError(null)
    setError(null)

    if (!navigator.geolocation) {
      setGeoError("お使いのブラウザは位置情報をサポートしていません")
      setGeoLoading(false)
      return
    }

    try {
      // 位置情報を取得
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      })

      const { latitude, longitude } = position.coords

      setLoading(true)

      // 緯度経度を使用して天気を取得
      const response = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `天気情報の取得に失敗しました（${response.status}）`)
      }

      const data = await response.json()
      setWeatherData(data)
    } catch (err) {
      console.error("位置情報または天気データの取得エラー:", err)

      // GeolocationPositionError型のエラーかどうかを確認
      if (err instanceof Error && "code" in err) {
        const geoError = err as GeolocationPositionError
        switch (geoError.code) {
          case 1:
            setGeoError("位置情報へのアクセスが拒否されました。ブラウザの設定で位置情報の許可を確認してください。")
            break
          case 2:
            setGeoError("位置情報を取得できませんでした。電波状況をご確認ください。")
            break
          case 3:
            setGeoError("位置情報の取得がタイムアウトしました。再度お試しください。")
            break
          default:
            setGeoError("位置情報の取得中にエラーが発生しました")
        }
      } else {
        setError(err instanceof Error ? err.message : "天気情報の取得中にエラーが発生しました")
      }
    } finally {
      setGeoLoading(false)
      setLoading(false)
    }
  }

  const refreshWeather = () => {
    if (weatherData?.coord) {
      fetchWeatherByCoordinates(weatherData.coord.lat, weatherData.coord.lon)
    } else {
      fetchWeatherByCoordinates(HABUKEN_LOCATION.lat, HABUKEN_LOCATION.lon)
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

  // 小さいサイズの天気アイコンを取得する関数
  const getSmallWeatherIcon = (iconCode: string) => {
    const iconId = iconCode.substring(0, 2)
    switch (iconId) {
      case "01": // 晴れ
        return <Sun className="h-6 w-6 text-yellow-500" />
      case "02": // 薄曇り
      case "03": // 曇り
      case "04": // 厚い曇り
        return <CloudSun className="h-6 w-6 text-gray-500" />
      case "09": // 小雨
      case "10": // 雨
        return <CloudRain className="h-6 w-6 text-blue-500" />
      case "11": // 雷雨
        return <Cloud className="h-6 w-6 text-gray-700" />
      case "13": // 雪
        return <Cloud className="h-6 w-6 text-blue-200" />
      case "50": // 霧
        return <Cloud className="h-6 w-6 text-gray-400" />
      default:
        return <Cloud className="h-6 w-6 text-gray-500" />
    }
  }

  return (
    <Card className="col-span-full md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>天気予報</CardTitle>
          <CardDescription>
            {weatherData?.name === "Habuken" ? "羽布建設" : weatherData?.name || ""}
            {weatherData?.coord && ` (${weatherData.coord.lat.toFixed(4)}, ${weatherData.coord.lon.toFixed(4)})`}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshWeather} disabled={loading} title="天気を更新">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="sr-only">更新</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchWeatherByLocation}
            disabled={geoLoading || loading}
            title="現在地の天気を取得"
          >
            {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Locate className="h-4 w-4" />}
            <span className="sr-only">現在地</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="current" onValueChange={(value) => setActiveTab(value as "current" | "forecast")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">現在の天気</TabsTrigger>
            <TabsTrigger value="forecast">5日間予報</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4 pt-4">
            {(error || geoError) && (
              <div className="bg-red-50 p-4 rounded-md flex items-start gap-3 text-red-800">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <p>{error || geoError}</p>
              </div>
            )}

            {loading && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {!loading && weatherData && (
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-4 bg-muted/30 rounded-lg">
                <div className="flex flex-col items-center">
                  {weatherData.weather[0]?.icon && getWeatherIcon(weatherData.weather[0].icon)}
                  <h3 className="text-xl font-semibold mt-2">
                    {weatherData.name === "Habuken" ? "羽布建設" : weatherData.name}
                  </h3>
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
            )}

            {!loading && !weatherData && !error && !geoError && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Cloud className="h-12 w-12 mb-4 opacity-50" />
                <p>天気情報を取得中...</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="forecast" className="space-y-4 pt-4">
            {forecastLoading && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {!forecastLoading && dailyForecasts.length > 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  {dailyForecasts.slice(0, 5).map((forecast, index) => (
                    <div key={index} className="bg-muted/30 p-3 rounded-lg flex flex-col items-center">
                      <p className="font-medium text-sm">{forecast.dateText}</p>
                      {getSmallWeatherIcon(forecast.icon)}
                      <p className="text-xs mt-1">{forecast.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-sm font-bold">{Math.round(forecast.maxTemp)}°</span>
                        <span className="text-sm text-muted-foreground">{Math.round(forecast.minTemp)}°</span>
                      </div>
                      <p className="text-xs mt-1 text-blue-500">
                        {Math.round(forecast.pop * 100)}% <span className="text-muted-foreground">降水確率</span>
                      </p>
                    </div>
                  ))}
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    詳細予報（3時間ごと）
                  </h3>
                  <div className="space-y-4">
                    {dailyForecasts.slice(0, 2).map((day, dayIndex) => (
                      <div key={dayIndex} className="space-y-2">
                        <h4 className="text-sm font-medium">{day.dateText}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {day.items.map((item, itemIndex) => {
                            const time = toJST(item.dt_txt)
                            return (
                              <div key={itemIndex} className="flex items-center gap-2 p-2 bg-background rounded border">
                                <div className="flex flex-col items-center">
                                  <span className="text-xs font-medium flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatTimeJP(time)}
                                  </span>
                                  {getSmallWeatherIcon(item.weather[0].icon)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{Math.round(item.main.temp)}°C</p>
                                  <p className="text-xs">{item.weather[0].description}</p>
                                  <p className="text-xs text-blue-500">{Math.round(item.pop * 100)}%</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!forecastLoading && dailyForecasts.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Cloud className="h-12 w-12 mb-4 opacity-50" />
                <p>予報データを取得できませんでした</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
