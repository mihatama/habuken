import { Sun, Cloud, CloudRain, CloudSnow } from "lucide-react"

// WeatherIcon props
interface WeatherIconProps {
  weather: "sunny" | "cloudy" | "rainy" | "snowy" | string
  size?: "sm" | "md" | "lg"
  className?: string
}

// WeatherIcon component
export function WeatherIcon({ weather, size = "sm", className = "" }: WeatherIconProps) {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }[size]

  const getIcon = () => {
    switch (weather) {
      case "sunny":
        return <Sun className={`${sizeClass} text-yellow-500 ${className}`} />
      case "cloudy":
        return <Cloud className={`${sizeClass} text-gray-500 ${className}`} />
      case "rainy":
        return <CloudRain className={`${sizeClass} text-blue-500 ${className}`} />
      case "snowy":
        return <CloudSnow className={`${sizeClass} text-blue-300 ${className}`} />
      default:
        return <Sun className={`${sizeClass} text-yellow-500 ${className}`} />
    }
  }

  return getIcon()
}
