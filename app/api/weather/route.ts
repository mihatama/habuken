import { NextResponse } from "next/server"

// OpenWeather APIから天気情報を取得する関数
async function fetchWeatherFromAPI(city: string) {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      throw new Error("OpenWeather API key is not defined")
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=ja`,
      { cache: "no-store" },
    )

    if (!response.ok) {
      throw new Error(`Weather API responded with status: ${response.status}`)
    }

    const data = await response.json()

    return {
      city: data.name,
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].description,
      icon: data.weather[0].icon,
    }
  } catch (error) {
    console.error("Error fetching weather data:", error)
    // エラー時はデフォルト値を返す
    return {
      city: city,
      temperature: 20,
      condition: "晴れ",
      icon: "01d",
    }
  }
}

export async function GET(request: Request) {
  // searchParamsを使用するが、headers()は使用しない
  const { searchParams } = new URL(request.url)
  const city = searchParams.get("city") || "Tokyo"

  const weatherData = await fetchWeatherFromAPI(city)

  return NextResponse.json(weatherData)
}
