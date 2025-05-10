import { type NextRequest, NextResponse } from "next/server"

// 環境変数から直接APIキーを取得
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY

export async function GET(request: NextRequest) {
  // APIキーが設定されているか確認
  if (!OPENWEATHER_API_KEY) {
    return NextResponse.json(
      { error: "OpenWeather APIキーが設定されていません。環境変数を確認してください。" },
      { status: 500 },
    )
  }

  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!lat || !lon) {
    return NextResponse.json({ error: "位置情報（緯度・経度）が指定されていません" }, { status: 400 })
  }

  try {
    // 5日間予報を取得（3時間ごとのデータ）
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=ja`

    const response = await fetch(url)

    if (!response.ok) {
      const errorData = await response.json()
      console.error(`OpenWeatherMap Forecast API error: ${response.status} - ${JSON.stringify(errorData)}`)

      let errorMessage = "天気予報の取得に失敗しました"
      if (errorData.message === "Invalid API key") {
        errorMessage = "OpenWeather APIキーが無効です。環境変数を確認してください。"
      } else if (errorData.message) {
        errorMessage = `エラー: ${errorData.message}`
      }

      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Weather Forecast API error:", error)
    return NextResponse.json({ error: "天気予報の取得中にエラーが発生しました" }, { status: 500 })
  }
}
