// Weather data type
export type WeatherData = {
  weather: string
  temperature: number
  description: string
  icon: string
}

// 天気データを取得する関数（APIを使わずにモックデータを返す）
export async function getWeatherData(): Promise<WeatherData> {
  // モックデータを返す
  return {
    weather: "sunny",
    temperature: 20,
    description: "晴れ",
    icon: "sunny",
  }
}
