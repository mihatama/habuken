import { Sun, Cloud, CloudRain, CloudSnow, Cloudy } from "lucide-react"

type WeatherType = "sunny" | "cloudy" | "rainy" | "snowy" | "foggy"

type WeatherDisplayProps = {
  weather: WeatherType
  temperature?: number
  description?: string
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
}

export function WeatherIcon({
  weather,
  size = "md",
  className = "",
}: { weather: WeatherType; size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  const iconSize = sizeMap[size]

  switch (weather) {
    case "sunny":
      return <Sun className={`${iconSize} text-yellow-500 ${className}`} aria-label="晴れ" />
    case "cloudy":
      return <Cloud className={`${iconSize} text-gray-500 ${className}`} aria-label="曇り" />
    case "rainy":
      return <CloudRain className={`${iconSize} text-blue-500 ${className}`} aria-label="雨" />
    case "snowy":
      return <CloudSnow className={`${iconSize} text-blue-200 ${className}`} aria-label="雪" />
    case "foggy":
      return <Cloudy className={`${iconSize} text-gray-400 ${className}`} aria-label="霧" />
    default:
      return <Sun className={`${iconSize} text-yellow-500 ${className}`} aria-label="晴れ" />
  }
}

export function WeatherDisplay({
  weather,
  temperature,
  description,
  size = "md",
  showLabel = false,
  className = "",
}: WeatherDisplayProps) {
  const weatherLabels: Record<WeatherType, string> = {
    sunny: "晴れ",
    cloudy: "曇り",
    rainy: "雨",
    snowy: "雪",
    foggy: "霧",
  }

  return (
    <div className={`flex items-center ${className}`}>
      <WeatherIcon weather={weather} size={size} />
      {showLabel && <span className="ml-2">{weatherLabels[weather]}</span>}
      {temperature !== undefined && <span className="ml-2">{temperature}°C</span>}
      {description && <span className="ml-2 text-gray-600">{description}</span>}
    </div>
  )
}
