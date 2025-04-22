// 愛知県豊田市羽布町の緯度経度
const HABU_LATITUDE = 35.1167
const HABU_LONGITUDE = 137.25

// 天気情報の型定義
export type WeatherData = {
  weather: string // sunny, cloudy, rainy など
  temperature: number
  description: string
  icon: string
}

// OpenWeather APIから天気情報を取得する関数
export async function getWeatherData(): Promise<WeatherData> {
  try {
    // APIキーが設定されていない場合はデフォルト値を返す
    if (!process.env.OPENWEATHER_API_KEY) {
      console.warn("OpenWeather API key is not set. Using default weather data.")
      return {
        weather: "sunny",
        temperature: 20,
        description: "晴れ",
        icon: "01d",
      }
    }

    const apiKey = process.env.OPENWEATHER_API_KEY
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${HABU_LATITUDE}&lon=${HABU_LONGITUDE}&appid=${apiKey}&units=metric&lang=ja`

    const response = await fetch(url, { next: { revalidate: 3600 } }) // 1時間ごとに再検証
    const data = await response.json()

    // 天気コードに基づいて天気タイプを決定
    // https://openweathermap.org/weather-conditions
    let weatherType = "sunny"
    const weatherCode = data.weather[0].id

    if (weatherCode >= 200 && weatherCode < 600) {
      weatherType = "rainy"
    } else if (weatherCode >= 600 && weatherCode < 700) {
      weatherType = "snowy"
    } else if (weatherCode >= 700 && weatherCode < 800) {
      weatherType = "foggy"
    } else if (weatherCode === 800) {
      weatherType = "sunny"
    } else if (weatherCode > 800) {
      weatherType = "cloudy"
    }

    return {
      weather: weatherType,
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
    }
  } catch (error) {
    console.error("天気情報の取得に失敗しました:", error)
    // エラー時はデフォルト値を返す
    return {
      weather: "sunny",
      temperature: 20,
      description: "晴れ",
      icon: "01d",
    }
  }
}

// 天気アイコンのURLを取得する関数
export function getWeatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
}
