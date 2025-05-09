import { type NextRequest, NextResponse } from "next/server"
import { OPENWEATHER_API_KEY } from "@/lib/constants"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const zipCode = searchParams.get("zipCode")

  if (!zipCode) {
    return NextResponse.json({ error: "郵便番号が指定されていません" }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?zip=${zipCode},JP&appid=${OPENWEATHER_API_KEY}&units=metric&lang=ja`,
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`OpenWeatherMap API error: ${response.status} - ${errorText}`)
      return NextResponse.json(
        { error: `天気情報の取得に失敗しました（${response.status}）` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json({ error: "天気情報の取得中にエラーが発生しました" }, { status: 500 })
  }
}
