import { type NextRequest, NextResponse } from "next/server"

// 環境変数から直接APIキーを取得
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const zipCode = searchParams.get("zipCode")
  const city = searchParams.get("city")
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!zipCode && !city && (!lat || !lon)) {
    return NextResponse.json({ error: "郵便番号、都市名、または位置情報が指定されていません" }, { status: 400 })
  }

  try {
    let url: string

    if (lat && lon) {
      // 緯度経度で検索
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=ja`
    } else if (zipCode) {
      // 郵便番号で検索
      url = `https://api.openweathermap.org/data/2.5/weather?zip=${zipCode},JP&appid=${OPENWEATHER_API_KEY}&units=metric&lang=ja`
    } else {
      // 都市名で検索
      url = `https://api.openweathermap.org/data/2.5/weather?q=${city},JP&appid=${OPENWEATHER_API_KEY}&units=metric&lang=ja`
    }

    const response = await fetch(url)

    if (!response.ok) {
      const errorData = await response.json()
      console.error(`OpenWeatherMap API error: ${response.status} - ${JSON.stringify(errorData)}`)

      // より具体的なエラーメッセージ
      let errorMessage = "天気情報の取得に失敗しました"
      if (errorData.message === "city not found") {
        errorMessage = zipCode
          ? `郵便番号 ${zipCode} に対応する地域が見つかりませんでした。別の郵便番号または都市名をお試しください。`
          : `都市 ${city} が見つかりませんでした。別の都市名をお試しください。`
      } else if (errorData.message) {
        errorMessage = `エラー: ${errorData.message}`
      }

      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json({ error: "天気情報の取得中にエラーが発生しました" }, { status: 500 })
  }
}
