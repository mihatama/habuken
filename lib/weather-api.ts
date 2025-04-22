export async function getWeatherData(location: string) {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      throw new Error("OpenWeather API key is not defined")
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`,
      { cache: "no-store" },
    )

    if (!response.ok) {
      throw new Error("Failed to fetch weather data")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching weather data:", error)
    return null
  }
}

// ユーザーのIPアドレスから位置情報を取得する関数
export async function getUserLocation() {
  // headers() はServer Componentでのみ使用可能なので、この関数を削除
  // 代わりに固定の場所を返すか、別の方法で位置情報を取得する
  return { city: "Tokyo", country: "JP" }
}
